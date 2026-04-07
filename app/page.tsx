import Header from "./_shared/Header";
import Hero from "./_shared/Hero";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Header />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-[10%] -top-[10%] h-125 w-125 rounded-full bg-orange-400/20 blur-[120px] animate-pulse" />

        <div className="absolute -right-[5%] top-[5%] h-150 w-150 rounded-full bg-amber-200/20 blur-[100px] transition-all duration-2000 ease-in-out" />

        <div className="absolute left-1/2 top-1/4 h-100 w-100 -translate-x-1/2 bg-rose-200/10 blur-[130px] animate-[pulse_6s_ease-in-out_infinite]" />

        <div className="absolute -bottom-[20%] left-[10%] h-125 w-125 rounded-full bg-yellow-500/10 blur-[120px]" />

        <div className="absolute left-1/2 top-1/2 h-75 w-75 -translate-x-1/2 -translate-y-1/2 bg-primary/10 blur-[100px]" />

        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('/noise.png')]" />
      </div>

      <main className="layout-padding relative z-10">
        <Hero />
      </main>
    </div>
  );
}
