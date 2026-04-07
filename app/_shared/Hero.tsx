"use client";

import { useState, useEffect } from "react";
import { Send, Sparkles, Monitor, Smartphone, Command, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroupTextarea } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";

function Hero() {
  const [platform, setPlatform] = useState<"website" | "mobile">("website");
  const [isFocused, setIsFocused] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const suggestions = [
    "A modern SaaS landing page",
    "Fintech dashboard with dark mode",
    "Fitness app progress tracking",
    "E-commerce product page",
    "Minimal portfolio website",
    "Social media app feed",
  ];

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    setLoading(true);

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const projectId = crypto.randomUUID();

    const result = await axios.post("/api/project", {
      userInput,
      device: platform,
      projectId,
    });

    // console.log(result.data);
    setLoading(false);
    router.push("/project/" + projectId);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        handleGenerate();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [userInput]);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Glow Background */}
      <div
        className={cn(
          "absolute inset-0 -z-10 blur-3xl transition-all duration-700",
          "bg-[radial-gradient(circle_at_50%_40%,var(--tw-gradient-stops))]",
          "from-primary/15 via-transparent to-transparent",
          isFocused ? "opacity-100 scale-110" : "opacity-70 scale-100",
        )}
      />

      <div className="w-full max-w-4xl mx-auto text-center space-y-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs md:text-sm font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Engine v3.0 is Live</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1.05] text-foreground">
          Design{" "}
          <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Faster
          </span>
          <br />
          Than You Think
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Describe your vision. Our AI handles the layout, spacing, and components instantly.
        </p>

        {/* Input Box */}
        <div
          className={cn(
            "relative group rounded-3xl border bg-card/60 backdrop-blur-xl shadow-2xl transition-all duration-300",
            isFocused
              ? "border-primary/50 ring-4 ring-primary/5 -translate-y-0.5"
              : "border-border",
          )}
        >
          <div className="flex flex-col">
            <InputGroupTextarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Describe your design (e.g. 'A minimalist fitness app dashboard...')"
              className="w-full min-h-35 p-6 text-lg leading-relaxed resize-none bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
            />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-4 border-t border-border/50 gap-4">
              <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border">
                {(["website", "mobile"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPlatform(type)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      platform === type
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {type === "website" ? (
                      <Monitor className="w-4 h-4" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground mr-2">
                  <Command className="w-3 h-3" /> + Enter
                </span>

                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!userInput.trim() || loading}
                  className="rounded-xl px-8 font-bold gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Updated Suggestions UI */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          <span className="text-xs font-medium text-muted-foreground mr-2 uppercase tracking-wider">
            Try these:
          </span>
          {suggestions.map((item, i) => (
            <button
              key={i}
              onClick={() => setUserInput(item)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border",
                "bg-secondary/30 border-transparent text-muted-foreground",
                "hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm",
                "active:scale-95 whitespace-nowrap",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
