import React, { useEffect, useRef, useState } from "react";
import { useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import { UploadCloud, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { getMediaAssets } from "@/lib/admin/media-actions";
import type { MediaAsset } from "@/components/admin/media/MediaLibraryClient";
import { resolver } from "../../registry";

/**
 * In-editor media library. Uploads go through the existing UploadThing pipeline;
 * assets are draggable onto the canvas (create an Image node) and clickable to
 * append one to the selected container (or the page root).
 */
export const AssetsPanel = () => {
  const { connectors: { create }, actions, query } = useEditor();
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () =>
    getMediaAssets()
      .then((d) => setAssets(d as MediaAsset[]))
      .catch((e) => { console.error(e); setAssets([]); });

  useEffect(() => { load(); }, []);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => load(),
    onUploadError: (e) => alert(`Upload failed: ${e.message}`),
  });

  const insertImage = (url: string) => {
    const selectedId = query.getEvent("selected").first();
    let parentId = ROOT_NODE;
    if (selectedId && query.node(selectedId).get()) {
      parentId = query.node(selectedId).isCanvas()
        ? selectedId
        : query.node(selectedId).get().data.parent || ROOT_NODE;
    }
    const tree = query
      .parseReactElement(React.createElement(resolver.Image, { src: url, alt: "" }))
      .toNodeTree();
    actions.addNodeTree(tree, parentId);
    actions.selectNode(tree.rootNodeId);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Assets</h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-center hover:border-blue-500 text-xs text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-60"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-1"><Loader2 size={14} className="animate-spin" /> Uploading…</span>
          ) : (
            <span className="flex items-center justify-center gap-1"><UploadCloud size={14} /> Upload image</span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void startUpload([f]); }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 pb-20">
        {assets === null ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <p className="text-xs text-gray-400 text-center pt-6">No images yet. Upload one above.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {assets.map((a) => (
              <button
                key={a.id}
                ref={(ref: any) => {
                  if (ref) create(ref, React.createElement(resolver.Image, { src: a.url, alt: a.alt ?? "" }));
                }}
                onClick={() => insertImage(a.url)}
                title={`${a.name} — drag onto canvas or click to insert`}
                className="group relative aspect-square rounded-md overflow-hidden border border-gray-200 hover:border-blue-500 cursor-grab active:cursor-grabbing bg-gray-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.alt ?? a.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
