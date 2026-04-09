import React, { useState, useRef, useCallback, useEffect } from "react";
import ScreenFrame from "./ScreenFrame";
import { ProjectType, ScreenConfig } from "@/type/types";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  projectDetail: ProjectType | undefined;
  screenConfig: ScreenConfig[];
  loading?: boolean;
};

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.12;

const DEVICE_PRESETS = {
  mobile: {
    canvasWidth: 390,
    canvasHeight: 844,
    label: "iPhone 14 · 390×844",
    initialScale: 0.65,
  },
  desktop: {
    canvasWidth: 1280,
    canvasHeight: 800,
    label: "Desktop · 1280×800",
    initialScale: 0.32,
  },
};

export default function Canvas({ projectDetail, screenConfig, loading }: Props) {
  const isMobile = projectDetail?.device === "mobile";
  const preset = isMobile ? DEVICE_PRESETS.mobile : DEVICE_PRESETS.desktop;

  const [scale, setScale] = useState(preset.initialScale);
  const [offset, setOffset] = useState({ x: 80, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });
  const [isDraggingScreen, setIsDraggingScreen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [activeScreen, setActiveScreen] = useState<number | null>(null);
  const [screenLabels, setScreenLabels] = useState<Record<number, string>>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  const SCREEN_WIDTH = preset.canvasWidth;
  const SCREEN_HEIGHT = preset.canvasHeight;
  const GAP = isMobile ? 80 : 120;

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const zoom = useCallback((delta: number, focalX?: number, focalY?: number) => {
    setScale((prev) => {
      const next = clampScale(prev + delta);
      if (focalX !== undefined && focalY !== undefined) {
        const ratio = next / prev;
        setOffset((o) => ({
          x: focalX - (focalX - o.x) * ratio,
          y: focalY - (focalY - o.y) * ratio,
        }));
      }
      return next;
    });
  }, []);

  const zoomIn = () => zoom(ZOOM_STEP);
  const zoomOut = () => zoom(-ZOOM_STEP);

  const resetView = () => {
    setScale(preset.initialScale);
    setOffset({ x: 80, y: 80 });
  };

  const fitAll = () => {
    const count = screenConfig.length || 1;
    const totalW = count * SCREEN_WIDTH + (count - 1) * GAP + 160;
    const vw = canvasRef.current?.clientWidth ?? window.innerWidth;
    const vh = (canvasRef.current?.clientHeight ?? window.innerHeight) - 52;
    const scaleX = (vw * 0.9) / totalW;
    const scaleY = (vh * 0.85) / SCREEN_HEIGHT;
    const newScale = clampScale(Math.min(scaleX, scaleY));
    setScale(newScale);
    setOffset({ x: 40, y: 80 });
  };

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const fx = e.clientX - rect.left;
      const fy = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      zoom(delta, fx, fy);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (isDraggingScreen) return;
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".screen-frame")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setPanOrigin({ ...offset });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setOffset({
      x: panOrigin.x + (e.clientX - panStart.x),
      y: panOrigin.y + (e.clientY - panStart.y),
    });
  };

  const onMouseUp = () => setIsPanning(false);

  const renameScreen = useCallback((index: number, name: string) => {
    setScreenLabels((prev) => ({ ...prev, [index]: name }));
  }, []);

  const scalePercent = Math.round(scale * 100);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "#f1f3f4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: isMobile ? 160 : 280,
              height: isMobile ? 300 : 180,
              borderRadius: isMobile ? 20 : 12,
              backgroundColor: "#e8eaed",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        cursor: isPanning ? "grabbing" : "grab",
        userSelect: "none",
        backgroundColor: "#f1f3f4",
        backgroundImage: showGrid
          ? "radial-gradient(circle, #c8c9ca 1px, transparent 1px)"
          : "none",
        backgroundSize: showGrid ? "24px 24px" : undefined,
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 100,
        }}
      >
        {/* Left: title + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#202124",
              letterSpacing: "-0.01em",
            }}
          >
            {projectDetail?.projectName ?? "Untitled project"}
          </span>

          <div style={{ width: 1, height: 16, backgroundColor: "#e0e0e0" }} />

          {/* Device badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 100,
              backgroundColor: isMobile ? "#e8f0fe" : "#f1f3f4",
              border: `1px solid ${isMobile ? "#c5d8fd" : "#e0e0e0"}`,
            }}
          >
            {isMobile ? (
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                <rect x="0.5" y="0.5" width="9" height="13" rx="1.5" stroke="#1a73e8" />
                <circle cx="5" cy="11.5" r="0.75" fill="#1a73e8" />
              </svg>
            ) : (
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                <rect x="0.5" y="0.5" width="13" height="8" rx="1" stroke="#5f6368" />
                <path d="M4 10.5h6M7 9v1.5" stroke="#5f6368" strokeLinecap="round" />
              </svg>
            )}
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: isMobile ? "#1a73e8" : "#5f6368",
              }}
            >
              {preset.label}
            </span>
          </div>
        </div>

        {/* Right: screen count + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#9aa0a6" }}>
            {screenConfig.length} screen{screenConfig.length !== 1 ? "s" : ""}
          </span>
          {activeScreen !== null && (
            <>
              <span style={{ color: "#e0e0e0" }}>·</span>
              <span style={{ fontSize: 12, color: "#1a73e8" }}>
                {screenLabels[activeScreen] ?? `Screen ${activeScreen + 1}`} selected
              </span>
            </>
          )}

          <div style={{ width: 1, height: 20, backgroundColor: "#e0e0e0", margin: "0 4px" }} />

          <TopBarBtn active={showGrid} onClick={() => setShowGrid((v) => !v)}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M1 1h4v4H1zM8 1h4v4H8zM1 8h4v4H1zM8 8h4v4H8z"
                stroke={showGrid ? "#1a73e8" : "#5f6368"}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            Grid
          </TopBarBtn>

          <TopBarBtn onClick={fitAll}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5f6368"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            Fit all
          </TopBarBtn>
        </div>
      </div>

      {/* ── Zoomable layer ── */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
            width: screenConfig.length * (SCREEN_WIDTH + GAP) + 80,
            height: SCREEN_HEIGHT + 80,
          }}
        >
          {/* Connector lines */}
          {screenConfig.length > 1 && (
            <svg
              style={{
                position: "absolute",
                top: 40,
                left: 40,
                width: screenConfig.length * (SCREEN_WIDTH + GAP),
                height: SCREEN_HEIGHT + 40,
                pointerEvents: "none",
                zIndex: 0,
              }}
            >
              {screenConfig.slice(0, -1).map((_, i) => {
                const x1 = i * (SCREEN_WIDTH + GAP) + SCREEN_WIDTH;
                const x2 = (i + 1) * (SCREEN_WIDTH + GAP);
                const y = SCREEN_HEIGHT / 2;
                const mx = (x1 + x2) / 2;
                return (
                  <g key={i}>
                    <path
                      d={`M${x1} ${y} C${mx} ${y} ${mx} ${y} ${x2} ${y}`}
                      stroke="#dadce0"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                      fill="none"
                    />
                    <circle
                      cx={mx}
                      cy={y}
                      r="3.5"
                      fill="#ffffff"
                      stroke="#dadce0"
                      strokeWidth="1.5"
                    />
                    <text x={mx} y={y + 4} textAnchor="middle" fontSize="7" fill="#9aa0a6">
                      {i + 1}→{i + 2}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {screenConfig.map((screen, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top: 40,
                left: 40 + index * (SCREEN_WIDTH + GAP),
                zIndex: 1,
              }}
              className="screen-frame"
            >
              {screen?.code ? (
                <ScreenFrame
                  index={index}
                  x={0}
                  y={0}
                  width={SCREEN_WIDTH}
                  height={SCREEN_HEIGHT}
                  isMobile={isMobile}
                  isActive={activeScreen === index}
                  label={screenLabels[index] ?? `Screen ${index + 1}`}
                  onSelect={() => setActiveScreen(index === activeScreen ? null : index)}
                  onRename={(name) => renameScreen(index, name)}
                  setIsDraggingScreen={setIsDraggingScreen}
                  screenData={screen}
                  projectDetail={projectDetail}
                />
              ) : (
                <div
                  className="bg-white rounded-2xl p-5 gap-4 flex flex-col"
                  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                >
                  <Skeleton className="w-full rounded-lg h-10 bg-gray-200" />
                  <Skeleton className="w-[50%] rounded-lg h-20  bg-gray-200" />
                  <Skeleton className="w-[70%] rounded-lg h-30  bg-gray-200" />
                  <Skeleton className="w-[30%] rounded-lg h-10  bg-gray-200" />
                  <Skeleton className="w-full rounded-lg h-10  bg-gray-200" />
                  <Skeleton className="w-[50%] rounded-lg h-20  bg-gray-200" />
                  <Skeleton className="w-[70%] rounded-lg h-30  bg-gray-200" />
                  <Skeleton className="w-[30%] rounded-lg h-10  bg-gray-200" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom zoom pill ── */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: 100,
          padding: "4px 8px",
          gap: 2,
          boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
        }}
      >
        <ZoomBtn onClick={zoomOut} title="Zoom out">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5f6368"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </ZoomBtn>

        <button
          onClick={resetView}
          style={{
            minWidth: 56,
            height: 32,
            padding: "0 8px",
            fontSize: 12,
            fontWeight: 500,
            color: "#202124",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: 100,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f3f4")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          title="Reset zoom"
        >
          {scalePercent}%
        </button>

        <ZoomBtn onClick={zoomIn} title="Zoom in">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5f6368"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </ZoomBtn>

        <div style={{ width: 1, height: 18, backgroundColor: "#e0e0e0", margin: "0 4px" }} />

        <ZoomBtn onClick={() => setScale(clampScale(0.25))} title="25%">
          <span style={{ fontSize: 10, fontWeight: 500, color: "#5f6368" }}>25%</span>
        </ZoomBtn>
        <ZoomBtn onClick={() => setScale(clampScale(0.5))} title="50%">
          <span style={{ fontSize: 10, fontWeight: 500, color: "#5f6368" }}>50%</span>
        </ZoomBtn>
        <ZoomBtn onClick={() => setScale(clampScale(1))} title="100%">
          <span style={{ fontSize: 10, fontWeight: 500, color: "#5f6368" }}>100%</span>
        </ZoomBtn>

        <div style={{ width: 1, height: 18, backgroundColor: "#e0e0e0", margin: "0 4px" }} />

        <ZoomBtn onClick={fitAll} title="Fit all">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5f6368"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </ZoomBtn>
      </div>

      {/* Hint */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 20,
          fontSize: 11,
          color: "#bdc1c6",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        <KbdTag>scroll</KbdTag> zoom ·<KbdTag>drag</KbdTag> pan
      </div>
    </div>
  );
}

function TopBarBtn({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 6,
        border: "1px solid #e0e0e0",
        backgroundColor: active ? "#e8f0fe" : "transparent",
        color: active ? "#1a73e8" : "#5f6368",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => !active && (e.currentTarget.style.backgroundColor = "#f1f3f4")}
      onMouseLeave={(e) => !active && (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {children}
    </button>
  );
}

function ZoomBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 100,
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f3f4")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {children}
    </button>
  );
}

function KbdTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        backgroundColor: "#f1f3f4",
        padding: "2px 6px",
        borderRadius: 4,
        border: "1px solid #e0e0e0",
        color: "#9aa0a6",
      }}
    >
      {children}
    </span>
  );
}
