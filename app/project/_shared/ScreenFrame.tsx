import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { ProjectType, ScreenConfig } from "@/type/types";
import { themeToCssVars } from "@/data/themes";

type Props = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isMobile: boolean;
  isActive: boolean;
  label: string;
  onSelect: () => void;
  onRename: (name: string) => void;
  setIsDraggingScreen: (v: boolean) => void;
  screenData?: ScreenConfig;
  projectDetail?: ProjectType;
};

const ACCENT_COLORS = ["#1a73e8", "#e8710a", "#188038", "#9334e6", "#d93025", "#0097a7"];

export default function ScreenFrame({
  index,
  x,
  y,
  width,
  height,
  isMobile,
  isActive,
  label,
  onSelect,
  onRename,
  setIsDraggingScreen,
  screenData,
  projectDetail,
}: Props) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [labelValue, setLabelValue] = useState(label);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ width, height });
  const labelInputRef = useRef<HTMLInputElement>(null);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  useEffect(() => {
    setLabelValue(label);
  }, [label]);

  const currentHeight = isMinimized ? 44 : size.height;

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Google Font -->
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">


<!-- Tailwind + Iconify -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
  <style >
    ${themeToCssVars(projectDetail?.theme)}
  </style>
</head>
<body class="bg-(--background) text-(--foreground) w-full">
  ${screenData?.code ?? ""}
</body>
</html>
`;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
      onClick={onSelect}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <Rnd
        default={{ x, y, width, height }}
        size={{ width: size.width, height: currentHeight }}
        dragHandleClassName="drag-handle"
        enableResizing={
          isMinimized
            ? false
            : {
                bottom: true,
                bottomLeft: true,
                bottomRight: true,
                left: true,
                right: true,
                top: false,
              }
        }
        onDragStart={() => setIsDraggingScreen(true)}
        onDragStop={() => setIsDraggingScreen(false)}
        onResizeStart={() => setIsDraggingScreen(true)}
        onResizeStop={(_e, _dir, ref) => {
          setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
          setIsDraggingScreen(false);
        }}
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: isActive ? `2px solid ${accent}` : "1px solid #dadce0",
          background: "#ffffff",
          boxShadow: isActive
            ? `0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px ${accent}22`
            : "0 1px 3px rgba(0,0,0,0.08)",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        {/* Title bar */}
        <div
          className="drag-handle"
          style={{
            height: 44,
            background: isActive ? `${accent}08` : "#fafafa",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          {/* LEFT */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Drag dots */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,4px)", gap: 2 }}>
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    style={{ width: 3, height: 3, borderRadius: "50%", background: "#bdc1c6" }}
                  />
                ))}
            </div>

            <span style={{ fontSize: 11, fontWeight: 500, color: accent, marginLeft: 4 }}>
              {label}
            </span>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 999,
                background: `${accent}12`,
                color: accent,
                fontWeight: 500,
                border: `1px solid ${accent}30`,
                whiteSpace: "nowrap",
              }}
            >
              {isMobile ? "Mobile" : "Desktop"} · {size.width}×{size.height}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 2 }} onClick={(e) => e.stopPropagation()}>
              <TitleBtn
                onClick={() => setIsMinimized((v) => !v)}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? "⛶" : "—"}
              </TitleBtn>
            </div>
          </div>
        </div>
        <iframe
          className="w-full h-[calc(100%-40px)] bg-white rounded-2xl"
          sandbox="allow-same-origin allow-scripts"
          srcDoc={html}
        />

        {/* Screen body */}
        {!isMinimized && (
          <div
            style={{
              height: currentHeight - 44,
              padding: 20,
              overflowY: "auto",
              background: "#fff",
            }}
          >
            <div
              style={{
                height: 7,
                borderRadius: 4,
                background: "#f1f3f4",
                width: "65%",
                marginBottom: 10,
              }}
            />
          </div>
        )}

        {!isMinimized && (
          <div
            style={{
              position: "absolute",
              bottom: 3,
              right: 5,
              fontSize: 10,
              color: "#dadce0",
              pointerEvents: "none",
            }}
          >
            ⊿
          </div>
        )}
      </Rnd>
    </div>
  );
}

function TitleBtn({
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
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        border: "none",
        background: "transparent",
        color: "#9aa0a6",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
