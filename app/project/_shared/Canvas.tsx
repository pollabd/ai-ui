"use client";

import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ScreenFrame from "./ScreenFrame";
import { ProjectType, ScreenConfig } from "@/type/types";
import { Loader2 } from "lucide-react";

type Props = {
  projectDetail: ProjectType | undefined;
  screenConfig: ScreenConfig[];
  loading?: boolean;
};

function Canvas({ projectDetail, screenConfig, loading }: Props) {
  const [panningEnabled, setPanningEnabled] = useState(true);

  const isMobile = projectDetail?.device === "mobile";

  const SCREEN_WIDTH = isMobile ? 360 : 260;
  const SCREEN_HEIGHT = isMobile ? 640 : 720;
  const GAP = isMobile ? 20 : 80;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200">
      {/* GRID BACKGROUND */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* TOP TOOLBAR */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/70 backdrop-blur shadow-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-600">Canvas</span>
          <span className="text-xs text-gray-400">Drag • Resize • Zoom</span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
        </div>
      )}

      <TransformWrapper
        initialScale={0.8}
        minScale={0.5}
        maxScale={3}
        initialPositionX={100}
        initialPositionY={80}
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: false }}
        panning={{ disabled: !panningEnabled }}
      >
        {({ zoomIn, zoomOut, resetTransform, state }) => (
          <>
            {/* CONTROLS */}
            <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2">
              <button
                onClick={() => zoomIn()} // ✅ FIXED
                className="btn-canvas"
              >
                +
              </button>

              <button
                onClick={() => zoomOut()} // ✅ FIXED
                className="btn-canvas"
              >
                −
              </button>

              <button
                onClick={() => resetTransform()} // ✅ FIXED
                className="btn-canvas text-xs"
              >
                Reset
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
              }}
            >
              <div className="relative">
                {screenConfig.map((screen, index) => (
                  <ScreenFrame
                    key={index}
                    x={index * (SCREEN_WIDTH + GAP)}
                    y={0}
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                    setPanningEnabled={setPanningEnabled}
                    scale={state.scale} // ✅ CRITICAL FIX
                  />
                ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* BUTTON STYLE */}
      <style jsx>{`
        .btn-canvas {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: white;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-canvas:hover {
          background: #f9fafb;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export default Canvas;
