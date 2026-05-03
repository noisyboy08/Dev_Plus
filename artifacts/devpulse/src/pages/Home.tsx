import { useEffect, useState } from "react";
import { Github, Zap, Bot, BarChart3, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

export function Home() {
  const handleLogin = () => {
    window.location.href = window.location.origin + '/api/auth/github';
  };

  const [commitsVisible, setCommitsVisible] = useState([false, false, false, false]);
  const [typedText, setTypedText] = useState("");
  const fullText = "Generated Standup:\n\nYesterday: Fixed memory leak in auth middleware and optimized SQL queries.\n\nToday: Implementing AI coach drawer and polishing dashboard UI.\n\nBlockers: None.";

  useEffect(() => {
    // Staggered commits
    commitsVisible.forEach((_, i) => {
      setTimeout(() => {
        setCommitsVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 500 + i * 400);
    });

    // Typewriter effect
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < fullText.length) {
        setTypedText(fullText.slice(0, currentIdx + 1));
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen selection:bg-[var(--accent-orange)] selection:text-white">
      <Navbar />

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 pt-20 overflow-hidden grid-bg">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-fade-up">
            <div className="font-[JetBrains_Mono] text-[var(--accent-orange)] text-xs tracking-[0.3em] font-bold uppercase mb-6">
              BUILT FOR DEVELOPERS
            </div>
            <h1 className="font-[Syne] font-extrabold text-6xl md:text-8xl leading-[0.9] mb-8">
              Your commits.<br />
              Your standup.<br />
              <span className="text-[var(--accent-orange)] italic">Zero effort.</span>
            </h1>
            <p className="font-[DM_Sans] font-light text-xl text-[var(--text-secondary)] max-w-lg mb-12">
              The AI-powered engineering coach that lives in your workflow. We analyze your commits, PRs, and velocity so you never have to write a standup again.
            </p>
            
            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleLogin}
                className="btn-orange w-fit px-10 py-8 rounded-none text-lg font-[Syne] font-semibold flex items-center gap-3"
              >
                <Github className="w-6 h-6" />
                Login with GitHub →
              </Button>
              <div className="font-[JetBrains_Mono] text-xs text-[var(--text-muted)] tracking-tight">
                Free forever · No credit card · 30 seconds to setup
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="animate-float relative z-20 transform rotate-[-3deg]">
              <div className="glass-card rounded-xl p-8 w-[420px] shadow-2xl border-white/10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-[var(--text-muted)] font-[JetBrains_Mono] text-[10px] uppercase tracking-widest mb-1">MARCH 14, 2024</div>
                    <div className="text-xl font-bold font-[Syne]">Daily Standup</div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-[var(--accent-green)] flex items-center justify-center text-[var(--accent-green)] font-[Syne] font-bold">
                    9.2
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[var(--text-muted)] font-[JetBrains_Mono] text-[10px] uppercase mb-1">YESTERDAY</div>
                    <p className="text-sm font-[DM_Sans] text-[var(--text-secondary)]">Refactored the authentication flow and fixed a race condition in the session handler.</p>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)] font-[JetBrains_Mono] text-[10px] uppercase mb-1">TODAY</div>
                    <p className="text-sm font-[DM_Sans] text-[var(--text-secondary)]">Implementing the new velocity tracking dashboard and PR analytics hooks.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-orange)] opacity-10 blur-[120px] -z-10 rounded-full" />
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-white" />
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* SECTION 2: FEATURES */}
      <section className="bg-[var(--bg-secondary)] py-32 px-6 md:px-12 border-y border-[var(--border-subtle)]">
        <div className="container mx-auto">
          <h2 className="font-[Syne] font-bold text-4xl md:text-6xl text-center mb-24 max-w-3xl mx-auto leading-tight">
            Everything you hate about standups. Gone.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", icon: Zap, title: "30-Second Standups", text: "Stop staring at a blank screen. We summarize your GitHub activity into a perfect update in seconds." },
              { num: "02", icon: Bot, title: "AI Sprint Coach", text: "A dedicated AI assistant that knows your code, your PRs, and your velocity. Ask anything about your progress." },
              { num: "03", icon: BarChart3, title: "Velocity Intelligence", text: "Deeper insights into your development cycle. Understand bottlenecks and ship faster with data-driven metrics." }
            ].map((f, i) => (
              <div key={i} className="feature-card bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-10 rounded-lg relative group overflow-hidden">
                <div className="font-[Space_Mono] text-7xl font-bold text-white opacity-[0.03] absolute -top-4 -right-4 transition-all group-hover:opacity-10 group-hover:-translate-y-2">
                  {f.num}
                </div>
                <div className="w-12 h-12 bg-[var(--accent-orange-glow)] flex items-center justify-center rounded-lg mb-8 border border-[var(--accent-orange)]/20">
                  <f.icon className="text-[var(--accent-orange)] w-6 h-6" />
                </div>
                <h3 className="font-[Syne] font-bold text-2xl mb-4">{f.title}</h3>
                <p className="font-[DM_Sans] text-[var(--text-secondary)] leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: LIVE DEMO TERMINAL */}
      <section className="py-32 px-6 md:px-12 bg-[var(--bg-primary)]">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[var(--bg-tertiary)]">
            <div className="bg-[#1a1a24] px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff3355]" />
                <div className="w-3 h-3 rounded-full bg-[#ffa500]" />
                <div className="w-3 h-3 rounded-full bg-[#00ff88]" />
              </div>
              <div className="font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                devpulse — dashboard
              </div>
              <div className="w-12" />
            </div>
            
            <div className="grid md:grid-cols-2 h-[400px]">
              <div className="border-r border-white/5 p-6 font-[JetBrains_Mono] text-xs">
                <div className="text-[var(--text-muted)] mb-4 uppercase tracking-tighter">RECENT COMMITS</div>
                <div className="space-y-4">
                  {[
                    "feat: implement auth middleware",
                    "fix: resolve race condition in sessions",
                    "docs: update API documentation",
                    "refactor: optimize database queries"
                  ].map((commit, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-3 transition-all duration-500 ${commitsVisible[i] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
                      <span className="text-[var(--text-secondary)] truncate">{commit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 font-[JetBrains_Mono] text-xs bg-black/20">
                <div className="text-[var(--text-muted)] mb-4 uppercase tracking-tighter">AI GENERATION</div>
                <pre className="whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">
                  {typedText}
                  <span className="inline-block w-1.5 h-4 bg-[var(--accent-orange)] ml-1 animate-blink" />
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SOCIAL PROOF */}
      <section className="py-40 px-6 md:px-12 bg-[var(--bg-primary)] text-center border-t border-[var(--border-subtle)]">
        <div className="container mx-auto">
          <div className="animate-fade-up inline-block mb-12">
            <h2 className="font-[Syne] font-extrabold text-7xl md:text-9xl text-[var(--accent-orange)] mb-4">
              1,247+
            </h2>
            <p className="font-[DM_Sans] font-light text-2xl text-[var(--text-secondary)] uppercase tracking-[0.2em]">
              developers ship faster with DevPulse
            </p>
          </div>

          <div className="flex justify-center -space-x-3 mb-12">
            {["AK", "JL", "MR", "TS", "PW"].map((init, i) => (
              <div key={i} className="w-12 h-12 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--accent-blue)] flex items-center justify-center text-[10px] font-bold font-[JetBrains_Mono]">
                {init}
              </div>
            ))}
          </div>

          <p className="font-[JetBrains_Mono] italic text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            "Finally, a standup tool that doesn't feel like a chore. DevPulse has reclaimed 20 minutes of my morning every single day."
          </p>
        </div>
      </section>

      {/* SECTION 5: FOOTER CTA */}
      <section className="py-40 px-6 md:px-12 bg-[var(--bg-secondary)] text-center relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <h2 className="font-[Syne] font-bold text-4xl md:text-6xl mb-12 max-w-2xl mx-auto leading-[1.1]">
            Ready to never write a standup again?
          </h2>
          <Button 
            onClick={handleLogin}
            className="btn-orange px-12 py-8 rounded-none text-xl font-[Syne] font-semibold"
          >
            Get Started Free
          </Button>
          
          <div className="mt-24 pt-12 border-t border-white/5">
            <p className="font-[JetBrains_Mono] text-xs text-[var(--text-muted)] uppercase tracking-[0.3em]">
              Built for Replit 10 Year Buildathon · Powered by Claude AI
            </p>
          </div>
        </div>
        
        {/* Decorative background blur */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--accent-orange)] opacity-[0.05] blur-[100px] rounded-full" />
      </section>
    </div>
  );
}
