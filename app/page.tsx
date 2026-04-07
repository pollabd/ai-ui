import Header from "./_shared/Header";
import Hero from "./_shared/Hero";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Header handles its own layout-padding internally */}
      <Header />

      {/* Orange/Warm Mesh Gradient Container */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Top Left - Vibrant Orange Glow */}
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-orange-400/20 blur-[120px] animate-pulse" />

        {/* Top Right - Soft Amber/Yellow */}
        <div className="absolute -right-[5%] top-[5%] h-[600px] w-[600px] rounded-full bg-amber-200/20 blur-[100px] transition-all duration-[2000ms] ease-in-out" />

        {/* Center - Peach/Rose Glow for depth */}
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 bg-rose-200/10 blur-[130px] animate-[pulse_6s_ease-in-out_infinite]" />

        {/* Bottom Left - Warm Gold */}
        <div className="absolute -bottom-[20%] left-[10%] h-[500px] w-[500px] rounded-full bg-yellow-500/10 blur-[120px]" />

        {/* ✨ Added: Subtle center glow for better focus */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 bg-primary/10 blur-[100px]" />

        {/* ✨ Added: Noise texture (very subtle, premium feel) */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('/noise.png')]" />
      </div>

      {/* Main content wrapper using your custom layout-padding */}
      <main className="layout-padding relative z-10">
        <Hero />
      </main>
    </div>
  );
}
