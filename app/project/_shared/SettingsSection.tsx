"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { THEME_NAME_LIST, THEMES } from "@/data/themes";
import { Camera, Share, Sparkles, Check, LayoutGrid } from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ProjectType } from "@/type/types";

type Props = {
  projectDetail: ProjectType | undefined;
};

function SettingsSection({ projectDetail }: Props) {
  const [selectedTheme, setSelectedTheme] = useState("AURORA_INK");
  const [projectName, setProjectName] = useState(projectDetail?.projectName);
  const [deviceType, setDeviceType] = useState<string | undefined>(projectDetail?.device);
  const [userNewScreenInput, setUserNewScreenInput] = useState<string>("");

  useEffect(() => {
    projectDetail && setProjectName(projectDetail.projectName);
  }, [projectDetail]);

  return (
    <aside className="w-80 h-screen flex flex-col border-r bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center gap-2 border-b">
        <LayoutGrid className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-lg tracking-tight">Project Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {/* Project Details Group */}
        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
              General
            </label>
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-foreground ml-1">Project Name</h3>
              <Input
                placeholder="Untitled Design"
                className="bg-background/50 border-border/60 focus-visible:ring-primary/20"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-foreground ml-1">AI Generation Prompt</h3>
              <Textarea
                placeholder="Describe a new screen (e.g. 'A dark mode profile page with stats')"
                className="min-h-24 bg-background/50 border-border/60 focus-visible:ring-primary/20 leading-relaxed resize-none"
                onChange={(e) => setUserNewScreenInput(e.target.value)}
              />
            </div>
            <Button className="w-full gap-2 shadow-sm shadow-primary/20 hover:scale-[1.01] transition-transform">
              <Sparkles className="w-4 h-4 fill-primary-foreground/20" />
              Generate Screen
            </Button>
          </div>
        </section>

        <Separator className="bg-border/40" />

        {/* Theme Selector */}
        <section className="space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
            Visual Style
          </label>
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-foreground ml-1">Active Theme</h3>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {THEME_NAME_LIST.map((theme) => {
                const isActive = selectedTheme === theme;
                return (
                  <div
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={cn(
                      "group relative p-3 border rounded-xl transition-all cursor-pointer",
                      "hover:bg-accent/50 hover:border-primary/30",
                      isActive
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/50 bg-background/30",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "text-xs font-semibold tracking-tight transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {theme.replace(/_/g, " ")}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>

                    <div className="flex gap-1.5">
                      {[
                        THEMES[theme]?.primary,
                        THEMES[theme]?.secondary,
                        THEMES[theme]?.accent,
                        THEMES[theme]?.background,
                      ].map((color, idx) => (
                        <div
                          key={idx}
                          className="h-3 w-full rounded-sm border border-black/5"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Separator className="bg-border/40" />

        {/* Extras / Tools */}
        <section className="space-y-3 pb-4">
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
            Actions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border/60 hover:bg-background"
            >
              <Camera className="w-3.5 h-3.5" />
              Capture
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border/60 hover:bg-background"
            >
              <Share className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </section>
      </div>
    </aside>
  );
}

export default SettingsSection;
