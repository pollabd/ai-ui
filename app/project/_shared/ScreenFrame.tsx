"use client";

import { GripVertical } from "lucide-react";
import React from "react";
import { Rnd } from "react-rnd";

function ScreenFrame({
  x,
  y,
  width,
  height,
  setPanningEnabled,
  scale,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  setPanningEnabled: (enabled: boolean) => void;
  scale: number;
}) {
  return (
    <Rnd
      default={{
        x,
        y,
        width,
        height,
      }}
      scale={scale} // ✅ FIX: makes drag & resize correct
      dragHandleClassName="drag-handle"
      enableResizing={{
        bottomLeft: true,
        bottomRight: true,
      }}
      // ❌ DO NOT USE bounds inside zoom container

      onDragStart={() => setPanningEnabled(false)}
      onDragStop={() => setPanningEnabled(true)}
      onResizeStart={() => setPanningEnabled(false)}
      onResizeStop={() => setPanningEnabled(true)}
    >
      <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all">
        {/* HEADER */}
        <div className="drag-handle flex items-center gap-2 px-3 py-2 bg-gray-50 border-b cursor-move select-none">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">Drag</span>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="h-full rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
            Screen Content
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-[10px] text-gray-400 px-3 py-1 border-t bg-gray-50 text-right">
          Resize ↘
        </div>
      </div>
    </Rnd>
  );
}

export default ScreenFrame;
