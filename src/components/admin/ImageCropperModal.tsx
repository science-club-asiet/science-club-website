"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Crop, ZoomIn, ZoomOut, RotateCw, Circle, Square, Sparkles, Move, Maximize2, Lock, Sliders } from "lucide-react";
import { toast } from "@/components/ui/Toast";

export type CropShape = "square" | "circle";
export type AspectRatioOption = "1:1" | "4:3" | "16:9" | "free";
export type TargetResolution = "500x500" | "360x360" | "1080x1080" | "original";
export type ScalingMode = "lock-preset" | "dynamic-native";

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | File | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File, croppedUrl: string) => void;
  initialShape?: CropShape;
  initialAspectRatio?: AspectRatioOption;
  initialResolution?: TargetResolution;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  initialShape = "circle",
  initialAspectRatio = "1:1",
  initialResolution = "500x500",
}: ImageCropperModalProps) {
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);
  const [shape, setShape] = useState<CropShape>(initialShape);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>(initialAspectRatio);
  const [targetResolution, setTargetResolution] = useState<TargetResolution>(initialResolution);
  const [scalingMode, setScalingMode] = useState<ScalingMode>("lock-preset");

  // Transform controls
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize image object URL when imageSrc prop changes
  useEffect(() => {
    if (!imageSrc) {
      setLoadedImage(null);
      setImageObjectUrl(null);
      return;
    }

    let url = "";
    if (typeof imageSrc === "string") {
      url = imageSrc;
    } else if (imageSrc instanceof File) {
      url = URL.createObjectURL(imageSrc);
    }

    setImageObjectUrl(url);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setLoadedImage(img);
      // Reset transforms to 100% cover
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
    img.onerror = () => {
      toast("Failed to load image for cropping", "error");
    };
    img.src = url;

    return () => {
      if (imageSrc instanceof File && url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imageSrc]);

  // Adjust aspect ratio behavior when shape changes
  useEffect(() => {
    if (shape === "circle") {
      setAspectRatio("1:1");
    }
  }, [shape]);

  // Calculate live source image crop bounds (exact pixel dimensions of zoomed region)
  const liveSourceDimensions = useMemo(() => {
    if (!loadedImage) return { w: 0, h: 0 };
    const previewW = 500;
    const cropW = Math.min(previewW * 0.75, 320);
    let cropH = cropW;
    if (aspectRatio === "4:3") cropH = (cropW * 3) / 4;
    if (aspectRatio === "16:9") cropH = (cropW * 9) / 16;

    const baseCoverScale = Math.max(cropW / loadedImage.width, cropH / loadedImage.height);
    const effectiveScale = baseCoverScale * zoom;

    const srcW = Math.round(cropW / effectiveScale);
    const srcH = Math.round(cropH / effectiveScale);

    return { w: Math.min(srcW, loadedImage.width), h: Math.min(srcH, loadedImage.height) };
  }, [loadedImage, zoom, aspectRatio]);

  // Calculate final target output pixel resolution
  const outputDimensions = useMemo(() => {
    if (!loadedImage) return { w: 500, h: 500 };

    if (scalingMode === "dynamic-native") {
      return { w: liveSourceDimensions.w, h: liveSourceDimensions.h };
    }

    let w = 500;
    let h = 500;

    if (targetResolution === "360x360") {
      w = 360;
      h = 360;
    } else if (targetResolution === "1080x1080") {
      w = 1080;
      h = 1080;
    } else if (targetResolution === "original") {
      w = loadedImage.width;
      h = loadedImage.height;
    }

    if (aspectRatio === "4:3") h = Math.round((w * 3) / 4);
    if (aspectRatio === "16:9") h = Math.round((w * 9) / 16);

    return { w, h };
  }, [loadedImage, targetResolution, aspectRatio, scalingMode, liveSourceDimensions]);

  // Draw interactive preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage || !containerRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerWidth = containerRef.current.clientWidth || 550;
    const containerHeight = Math.min(window.innerHeight * 0.5, 420);

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#090d16"; // Deep dark navy slate
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Determine crop box size on preview canvas
    const cropW = Math.min(canvas.width * 0.75, 320);
    let cropH = cropW;

    if (aspectRatio === "4:3") cropH = (cropW * 3) / 4;
    if (aspectRatio === "16:9") cropH = (cropW * 9) / 16;
    if (aspectRatio === "free") cropH = Math.min(canvas.height * 0.75, 280);

    // Calculate COVER scale so the image fills the crop box completely at zoom = 1
    const baseCoverScale = Math.max(cropW / loadedImage.width, cropH / loadedImage.height);
    const effectiveScale = baseCoverScale * zoom;

    const drawWidth = loadedImage.width * effectiveScale;
    const drawHeight = loadedImage.height * effectiveScale;

    // Center pivot point
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.translate(centerX + pan.x, centerY + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.drawImage(
      loadedImage,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    // Draw Darkened Overlay with Cutout Mask
    ctx.save();
    ctx.fillStyle = "rgba(10, 15, 30, 0.72)";

    const cropX = (canvas.width - cropW) / 2;
    const cropY = (canvas.height - cropH) / 2;

    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);

    if (shape === "circle") {
      const radius = cropW / 2;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    } else {
      ctx.rect(cropX + cropW, cropY, -cropW, cropH);
    }

    ctx.fill("evenodd");

    // Draw Vibrant Crop Border & Corner Guides
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#e11d48"; // Vibrant Red Accent

    ctx.beginPath();
    if (shape === "circle") {
      const radius = cropW / 2;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    } else {
      ctx.rect(cropX, cropY, cropW, cropH);
    }
    ctx.stroke();

    // Grid Lines inside crop area (Rule of thirds)
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    // Vertical grid lines
    ctx.moveTo(cropX + cropW / 3, cropY);
    ctx.lineTo(cropX + cropW / 3, cropY + cropH);
    ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
    ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
    // Horizontal grid lines
    ctx.moveTo(cropX, cropY + cropH / 3);
    ctx.lineTo(cropX, cropY + cropH);
    ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
    ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
    ctx.stroke();

    ctx.restore();
  }, [loadedImage, zoom, rotation, pan, shape, aspectRatio]);

  useEffect(() => {
    if (isOpen && loadedImage) {
      drawPreview();
    }
  }, [isOpen, loadedImage, drawPreview]);

  // Mouse Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3.5));
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Process and export cropped image
  const handleCropAndSave = async () => {
    if (!loadedImage) return;
    setIsProcessing(true);

    try {
      const outputW = outputDimensions.w;
      const outputH = outputDimensions.h;

      const outCanvas = document.createElement("canvas");
      outCanvas.width = outputW;
      outCanvas.height = outputH;

      const outCtx = outCanvas.getContext("2d");
      if (!outCtx) {
        throw new Error("Could not initialize canvas context");
      }

      // Enable high-quality smoothing for sharp bicubic upscaling / downscaling
      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = "high";

      // If Shape is Circle, ensure transparent background!
      if (shape === "circle") {
        outCtx.clearRect(0, 0, outputW, outputH);
        outCtx.beginPath();
        outCtx.arc(outputW / 2, outputH / 2, outputW / 2, 0, Math.PI * 2);
        outCtx.closePath();
        outCtx.clip();
      } else {
        outCtx.fillStyle = "#ffffff";
        outCtx.fillRect(0, 0, outputW, outputH);
      }

      // Calculate mapping from preview crop box to output canvas
      const previewCanvas = canvasRef.current;
      const previewW = previewCanvas ? previewCanvas.width : 500;
      const cropWPreview = Math.min(previewW * 0.75, 320);
      let cropHPreview = cropWPreview;
      if (aspectRatio === "4:3") cropHPreview = (cropWPreview * 3) / 4;
      if (aspectRatio === "16:9") cropHPreview = (cropWPreview * 9) / 16;

      const baseCoverScale = Math.max(cropWPreview / loadedImage.width, cropHPreview / loadedImage.height);
      const effectiveScale = baseCoverScale * zoom;

      // Multiplier to map preview canvas coordinates to high-res output canvas
      const scaleMultiplier = outputW / cropWPreview;

      outCtx.save();
      outCtx.translate(outputW / 2, outputH / 2);
      outCtx.rotate((rotation * Math.PI) / 180);

      const finalDrawW = loadedImage.width * effectiveScale * scaleMultiplier;
      const finalDrawH = loadedImage.height * effectiveScale * scaleMultiplier;

      const finalPanX = pan.x * scaleMultiplier;
      const finalPanY = pan.y * scaleMultiplier;

      outCtx.drawImage(
        loadedImage,
        -finalDrawW / 2 + finalPanX,
        -finalDrawH / 2 + finalPanY,
        finalDrawW,
        finalDrawH
      );

      outCtx.restore();

      // Export format: PNG for circular transparent crops, WebP for rectangular crops
      const mimeType = shape === "circle" ? "image/png" : "image/webp";
      const fileExt = shape === "circle" ? "png" : "webp";

      outCanvas.toBlob(
        (blob) => {
          if (!blob) {
            toast("Failed to crop image", "error");
            setIsProcessing(false);
            return;
          }

          const croppedFile = new File(
            [blob],
            `cropped-${shape}-${outputW}x${outputH}-${Date.now()}.${fileExt}`,
            { type: mimeType, lastModified: Date.now() }
          );

          const croppedUrl = URL.createObjectURL(croppedFile);
          toast(
            `Cropped to ${shape} (${outputW}x${outputH}${shape === "circle" ? " transparent edges" : ""})`,
            "success"
          );

          onCropComplete(croppedFile, croppedUrl);
          setIsProcessing(false);
          onClose();
        },
        mimeType,
        0.92
      );
    } catch (err: unknown) {
      toast("Crop failed: " + (err as Error).message, "error");
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] bg-navy/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col font-inter"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red text-white flex items-center justify-center shadow-sm">
                <Crop className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-oswald text-lg font-bold uppercase text-navy leading-none">
                  Image Cropper & Resizer
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Crop, scale, and output transparent round or rectangular photos
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-navy rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Canvas Viewport */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="relative w-full h-[380px] bg-slate-950 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
          >
            <canvas ref={canvasRef} className="max-w-full max-h-full" />

            {!loadedImage && (
              <div className="text-gray-400 text-xs flex items-center gap-2">
                Loading image...
              </div>
            )}

            {/* Top Bar Instructions & Dynamic Real-Time Output Resolution Metric Badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
              <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-white/80 font-mono shadow-md flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-red" />
                <span>Drag to position • Scroll to zoom</span>
              </div>

              {loadedImage && (
                <div className="bg-red/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold shadow-md flex items-center gap-1.5 border border-white/20">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>
                    Region: {liveSourceDimensions.w}×{liveSourceDimensions.h} px ➔ Output: {outputDimensions.w}×{outputDimensions.h} px {scalingMode === "lock-preset" ? "(Upscaled)" : "(Native)"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-5 bg-white border-t border-gray-100 space-y-4">
            {/* Mode & Target Sizing Selector */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Shape Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy/70">
                  Crop Shape:
                </span>
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShape("circle")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      shape === "circle"
                        ? "bg-navy text-white shadow-sm"
                        : "text-navy/70 hover:text-navy"
                    }`}
                  >
                    <Circle className="w-3.5 h-3.5 text-red" />
                    Circle (Transparent)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShape("square")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      shape === "square"
                        ? "bg-navy text-white shadow-sm"
                        : "text-navy/70 hover:text-navy"
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    Square / Rect
                  </button>
                </div>
              </div>

              {/* Scaling Mode Selector (Lock Preset vs Dynamic Native) */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy/70">
                  Output Mode:
                </span>
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setScalingMode("lock-preset")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scalingMode === "lock-preset"
                        ? "bg-navy text-white shadow-sm"
                        : "text-navy/70 hover:text-navy"
                    }`}
                    title="Lock output size to chosen preset (High Quality Bicubic Upscaling)"
                  >
                    <Lock className="w-3.5 h-3.5 text-red" />
                    Lock Preset Size
                  </button>
                  <button
                    type="button"
                    onClick={() => setScalingMode("dynamic-native")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scalingMode === "dynamic-native"
                        ? "bg-navy text-white shadow-sm"
                        : "text-navy/70 hover:text-navy"
                    }`}
                    title="Output exact native resolution of zoomed region"
                  >
                    <Sliders className="w-3.5 h-3.5 text-red" />
                    Dynamic Native Size
                  </button>
                </div>
              </div>
            </div>

            {/* Target Resolution Selector (When in Lock Preset mode) */}
            {scalingMode === "lock-preset" && (
              <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy/70">
                    Preset Target Resolution:
                  </span>
                  <select
                    value={targetResolution}
                    onChange={(e) => setTargetResolution(e.target.value as TargetResolution)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-xs font-mono font-bold text-navy focus:outline-none focus:border-red"
                  >
                    <option value="500x500">500×500 px (Recommended for Execom)</option>
                    <option value="360x360">360×360 px (Standard Avatar)</option>
                    <option value="1080x1080">1080×1080 px (High-Res Square)</option>
                    <option value="original">Original Aspect Dimensions</option>
                  </select>
                </div>
                <div className="text-[10px] text-gray-500 italic">
                  Zooming will upscale/downscale region to guarantee {outputDimensions.w}×{outputDimensions.h} px output file
                </div>
              </div>
            )}

            {/* Transform Controls (Zoom Slider & Rotation) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <ZoomOut className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red"
                />
                <ZoomIn className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-mono text-navy font-bold w-12 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-navy text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-3.5 h-3.5 text-navy/70" /> Rotate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-navy text-xs font-medium transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-[11px] text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                <Sparkles className="w-3.5 h-3.5 text-green-600" />
                {shape === "circle"
                  ? "PNG with transparent circle edges enabled"
                  : "Auto-optimized high quality WebP format"}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider text-navy hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropAndSave}
                  disabled={isProcessing || !loadedImage}
                  className="bg-navy hover:bg-red text-white px-5 py-2 rounded-xl font-oswald text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isProcessing ? "Cropping..." : "Apply & Crop"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
