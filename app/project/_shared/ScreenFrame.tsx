import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { Rnd } from "react-rnd";
import { ProjectType, ScreenConfig } from "@/type/types";
import { THEMES, themeToCssVars } from "@/data/themes";
import { SettingContext } from "@/context/SettingsContext";

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
  const { settingsDetail } = useContext(SettingContext);

  useEffect(() => {
    setLabelValue(label);
  }, [label]);

  const currentHeight = isMinimized ? 44 : size.height;

  const rawTheme = settingsDetail?.theme ?? projectDetail?.theme;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>

<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>

<!-- ✅ Tailwind mapped to your global.css system -->
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          background: "var(--color-background)",
          foreground: "var(--color-foreground)",
          border: "var(--color-border)",
          primary: "var(--color-primary)"
        }
      }
    }
  }
</script>

<style>
  ${themeToCssVars(rawTheme)}

  html, body {
    margin: 0;
    padding: 0;
    height: auto !important;
  }

  body {
    display: inline-block;
    width: 100%;
    min-height: auto !important;
  }

  /* ✅ FIX: map old Tailwind classes → your theme system */
  .bg-white,
  .bg-gray-50,
  .bg-gray-100 {
    background-color: var(--color-background) !important;
  }

  .text-black,
  .text-gray-900,
  .text-gray-800 {
    color: var(--color-foreground) !important;
  }

  .border-gray-200,
  .border-gray-300 {
    border-color: var(--color-border) !important;
  }
</style>
</head>

<body class="bg-background text-foreground w-full min-h-screen">
  ${screenData?.code ?? ""}

  <script>
    function sendHeight() {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      window.parent.postMessage({ type: "IFRAME_HEIGHT", height }, "*");
    }

    new ResizeObserver(sendHeight).observe(document.body);

    window.addEventListener("load", sendHeight);
    setTimeout(sendHeight, 50);
    setTimeout(sendHeight, 200);
    setTimeout(sendHeight, 500);
  </script>
</body>
</html>
`;

  const measureIframeHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const headerH = 44;
      const htmlEl = doc.documentElement;
      const body = doc.body;

      const contentH = Math.max(
        htmlEl?.scrollHeight ?? 0,
        body?.scrollHeight ?? 0,
        htmlEl?.offsetHeight ?? 0,
        body?.offsetHeight ?? 0,
      );

      const next = Math.min(Math.max(contentH + headerH, 160), 2000);

      setSize((s) => (Math.abs(s.height - next) > 2 ? { ...s, height: next } : s));
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "IFRAME_HEIGHT") {
        const contentH = e.data.height;
        const next = Math.min(Math.max(contentH + 44, 160), 2000);

        setSize((s) => (Math.abs(s.height - next) > 2 ? { ...s, height: next } : s));
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      measureIframeHeight();

      requestAnimationFrame(() => measureIframeHeight());

      const doc = iframe.contentDocument;
      if (!doc) return;

      const observer = new MutationObserver(() => measureIframeHeight());
      observer.observe(doc.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      const t1 = window.setTimeout(measureIframeHeight, 50);
      const t2 = window.setTimeout(measureIframeHeight, 200);
      const t3 = window.setTimeout(measureIframeHeight, 600);

      return () => {
        observer.disconnect();
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
      };
    };

    iframe.addEventListener("load", onLoad);
    window.addEventListener("resize", measureIframeHeight);

    return () => {
      iframe.removeEventListener("load", onLoad);
      window.removeEventListener("resize", measureIframeHeight);
    };
  }, [measureIframeHeight, screenData?.code]);

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
        {/* everything else unchanged */}
        <iframe
          key={rawTheme}
          ref={iframeRef}
          sandbox="allow-same-origin allow-scripts"
          srcDoc={html}
          style={{
            width: "100%",
            height: size.height - 44,
            border: "none",
            display: "block",
          }}
        />
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
