"use client";

import { useTransition, useState, useOptimistic } from "react";
import { 
  DndContext, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { toast } from "@/components/ui/Toast";
import { setApplicationStage } from "@/lib/admin/actions";
import { ApplicationDrawer, type Application } from "./ApplicationDrawer";

const COLUMNS = [
  { id: "submitted", title: "Submitted", color: "bg-gray-100" },
  { id: "under_review", title: "Under Review", color: "bg-blue-50" },
  { id: "interview", title: "Interview", color: "bg-purple-50" },
  { id: "accepted", title: "Accepted", color: "bg-green-50" },
  { id: "rejected", title: "Rejected", color: "bg-red/5" }
] as const;



function ApplicationCard({ app, onClick }: { app: Application; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: app.id,
    data: { type: "Application", app }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-navy/30 transition-colors"
    >
      <div className="font-medium text-navy text-sm mb-1">{app.name}</div>
      <div className="text-xs text-gray-500 mb-3 truncate">{app.email}</div>
      <div className="flex gap-2 items-center">
        {app.department && <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md truncate max-w-[120px]">{app.department}</span>}
      </div>
    </div>
  );
}

function Column({ id, title, apps, onCardClick }: { id: string, title: string, apps: Application[], onCardClick: (app: Application) => void }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden min-h-[500px]">
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-10">
        <h3 className="font-oswald font-bold uppercase text-navy text-sm tracking-wide">{title}</h3>
        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{apps.length}</span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-3 flex flex-col gap-3">
        <SortableContext items={apps.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {apps.map(app => (
            <ApplicationCard key={app.id} app={app} onClick={() => onCardClick(app)} />
          ))}
        </SortableContext>
        {apps.length === 0 && (
          <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium uppercase tracking-widest">
            Drop Here
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ apps }: { apps: Application[] }) {
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticApps, setOptimisticApp] = useOptimistic(
    apps,
    (state: Application[], update: { id: string; stage: string }) => {
      // Create a copy of the array where the target app is moved to the end of the target stage
      const app = state.find(a => a.id === update.id);
      if (!app) return state;
      const withoutApp = state.filter(a => a.id !== update.id);
      return [...withoutApp, { ...app, stage: update.stage }];
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (e: DragStartEvent) => {
    const { active } = e;
    const app = optimisticApps.find(a => a.id === active.id);
    if (app) setActiveApp(app);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveApp(null);
    const { active, over } = e;
    
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the target stage based on what was dropped on
    // If dropped on an empty column, overId is the column id
    // If dropped on another card, overId is that card's id
    const isColumn = COLUMNS.some(c => c.id === overId);
    const targetStage = isColumn 
      ? overId 
      : optimisticApps.find(a => a.id === overId)?.stage;

    if (!targetStage) return;

    const app = optimisticApps.find(a => a.id === activeId);
    if (!app || app.stage === targetStage) return;

    startTransition(async () => {
      setOptimisticApp({ id: activeId, stage: targetStage });
      
      const { error } = await setApplicationStage(activeId, targetStage);
      if (error) {
        toast(`Save failed. Have you run the migration? (${error})`, "error");
      } else {
        toast("Application moved to " + targetStage, "success");
      }
    });
  };

  const handleStageChange = (id: string, stage: string) => {
    setSelectedApp(null); // close drawer
    const app = optimisticApps.find(a => a.id === id);
    if (!app || app.stage === stage) return;
    
    startTransition(async () => {
      setOptimisticApp({ id, stage });
      const { error } = await setApplicationStage(id, stage);
      if (error) {
        toast(`Save failed. Have you run the migration? (${error})`, "error");
      } else {
        toast("Application moved to " + stage, "success");
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(col => (
            <Column 
              key={col.id}
              id={col.id} 
              title={col.title} 
              apps={optimisticApps.filter(a => a.stage === col.id)} 
              onCardClick={setSelectedApp}
            />
          ))}

          <DragOverlay>
            {activeApp ? (
              <div className="opacity-80 rotate-2 scale-105 transition-transform">
                <ApplicationCard app={activeApp} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <ApplicationDrawer 
        app={selectedApp} 
        onClose={() => setSelectedApp(null)} 
        onStageChange={handleStageChange}
      />
    </>
  );
}
