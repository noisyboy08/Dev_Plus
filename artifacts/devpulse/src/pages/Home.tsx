import { useEffect, useState } from "react";
import { Github, ArrowUpRight, Zap, Bot, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const TICKERS = ["AI-Powered Standups", "GitHub Native", "Claude AI", "Velocity Intelligence", "Sprint Coaching", "PR Analytics", "LinkedIn Posts", "Zero Effort"];

export function Home() {
  const handleLogin = () => {
    window.location.href = window.location.origin + "/api/auth/github";
  };

  const [commitsVisible, setCommitsVisible] = useState([false, false, false, false]);
  const [typedText, setTypedText] = useState("");
  const fullText =
    "Yesterday: Fixed memory leak in auth middleware and optimized SQL query performance by 40%.\n\nToday: Implementing velocity dashboard and PR analytics hooks for the new insights page.\n\nBlockers: None.";

  useEffect(() => {
    commitsVisible.forEach((_, i) => {
      setTimeout(() => {
        setCommitsVisible((prev) => {
          const n = [...prev];
          n[i] = true;
          return n;
        });
      }, 700 + i * 380);
    });

    let idx = 0;
    const timer = setInterval(() => {
      if (idx < fullText.length) {
        setTypedText(fullText.slice(0, idx + 1));
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen overflow-x-hidden selection:bg-[var(--accent-orange)] selection:text-white">
      <div className="grain-overlay" />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 px-8 md:px-16 pt-36 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[var(--accent-orange)] opacity-[0.06] blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#4488ff] opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1440px] mx-auto">
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 font-[JetBrains_Mono] text-[10px] text-[var(--accent-orange)] tracking-[0.35em] uppercase border border-[var(--accent-orange)]/25 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
              AI-POWERED · GITHUB NATIVE · BUILT FOR ENGINEERS
            </span>
          </div>

          <h1 className="font-[Syne] font-extrabold leading-[0.88] tracking-tight">
            <div className="text-[clamp(64px,10.5vw,168px)] text-[var(--text-primary)]">Your commits.</div>
            <div className="text-[clamp(64px,10.5vw,168px)] text-[var(--text-primary)]">Your standup.</div>
            <div className="flex items-baseline gap-5 mt-1">
              <span className="text-[clamp(80px,13vw,208px)] text-[var(--accent-orange)] italic">Zero</span>
              <span className="text-[clamp(40px,6vw,96px)] text-[var(--text-secondary)] font-light not-italic font-[DM_Sans] self-end pb-3 md:pb-6">effort.</span>
            </div>
          </h1>

          <div className="mt-16 pt-10 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <p className="font-[DM_Sans] font-light text-lg text-[var(--text-secondary)] max-w-[440px] leading-relaxed">
              The AI coaching layer for your GitHub workflow. We turn your commits and PRs into perfect standups, sprint insights, and career posts — automatically.
            </p>
            <div className="flex flex-col items-start gap-3 shrink-0">
              <button
                onClick={handleLogin}
                className="group flex items-center gap-4 bg-[var(--accent-orange)] text-white px-10 py-5 font-[Syne] font-semibold text-lg transition-all duration-150 hover:brightness-110 hover:shadow-[0_0_40px_rgba(255,92,0,0.35)]"
              >
                <Github className="w-5 h-5" />
                <span>Login with GitHub</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <span className="font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)] tracking-[0.3em] pl-1">
                FREE · NO CREDIT CARD · 30 SECOND SETUP
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div className="border-y border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-4 overflow-hidden">
        <div className="marquee-track font-[JetBrains_Mono] text-[11px] text-[var(--text-muted)] uppercase tracking-[0.18em] whitespace-nowrap flex">
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} className="flex items-center gap-12 mr-12">
              <span>{t}</span>
              <span className="text-[var(--accent-orange)]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES — horizontal editorial rows ── */}
      <section className="py-28 px-8 md:px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-16 pb-6 border-b border-[var(--border-subtle)]">
            <h2 className="font-[Syne] font-bold text-[clamp(28px,4.5vw,52px)] leading-[1.1] max-w-lg">
              Everything you hate<br />about standups.{" "}
              <span className="text-[var(--accent-orange)]">Gone.</span>
            </h2>
            <span className="font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)] tracking-[0.35em] uppercase hidden md:block">
              CORE FEATURES
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {[
              {
                num: "01",
                Icon: Zap,
                title: "30-Second Standups",
                desc: "Stop staring at a blank screen. We pull your commits, PRs, and reviews and distill them into a crisp, professional update — in seconds.",
                tag: "GENERATION",
              },
              {
                num: "02",
                Icon: Bot,
                title: "AI Sprint Coach",
                desc: "A Claude-powered assistant that knows your codebase, your PRs, and your velocity. Ask it anything — blockers, priorities, code review strategy.",
                tag: "INTELLIGENCE",
              },
              {
                num: "03",
                Icon: BarChart3,
                title: "Velocity Intelligence",
                desc: "Streak tracking, PR cycle time, peak-performance days, commit keyword clouds. Real engineering metrics, no spreadsheets required.",
                tag: "ANALYTICS",
              },
            ].map((f) => (
              <div
                key={f.num}
                className="feature-row group flex items-center gap-6 md:gap-10 py-8 md:py-10 cursor-default"
              >
                <div className="font-[Space_Mono] text-[var(--text-muted)] text-xs w-7 shrink-0">{f.num}</div>
                <div className="w-9 h-9 shrink-0 border border-[var(--border-subtle)] group-hover:border-[var(--accent-orange)]/50 flex items-center justify-center transition-colors duration-200">
                  <f.Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] transition-colors duration-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-[Syne] font-bold text-xl md:text-3xl text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors duration-200 mb-0 group-hover:mb-2">
                    {f.title}
                  </h3>
                  <p className="font-[DM_Sans] text-[var(--text-secondary)] text-sm max-w-xl leading-relaxed max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-300 opacity-0 group-hover:opacity-100">
                    {f.desc}
                  </p>
                </div>
                <div className="hidden lg:block font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)] tracking-[0.3em] shrink-0">
                  {f.tag}
                </div>
                <ArrowUpRight className="w-5 h-5 text-[var(--border-accent)] group-hover:text-[var(--accent-orange)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TERMINAL DEMO ── */}
      <section className="px-8 md:px-16 pb-32">
        <div className="max-w-[1440px] mx-auto">
          <div className="border border-[var(--border-subtle)] overflow-hidden terminal-shadow">
            <div className="bg-[#0d0d12] px-5 py-3.5 flex items-center justify-between border-b border-[var(--border-subtle)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff3b30]" />
                <div className="w-3 h-3 rounded-full bg-[#ffcc00]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em]">
                DEVPULSE · AI STANDUP ENGINE
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse" />
                <span className="font-[JetBrains_Mono] text-[10px] text-[var(--accent-green)]">LIVE</span>
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr,1.3fr] min-h-[440px]">
              <div className="border-r border-[var(--border-subtle)] p-8 bg-[var(--bg-secondary)]">
                <div className="flex items-center justify-between mb-7">
                  <span className="font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em]">RECENT ACTIVITY</span>
                  <span className="font-[JetBrains_Mono] text-[10px] text-[var(--accent-green)] border border-[var(--accent-green)]/25 px-2 py-0.5 rounded-sm">
                    4 commits
                  </span>
                </div>
                <div className="space-y-5">
                  {[
                    { type: "feat", msg: "implement auth middleware", time: "2m ago", color: "#00ff88" },
                    { type: "fix", msg: "resolve race condition in sessions", time: "47m ago", color: "#ffa500" },
                    { type: "docs", msg: "update API documentation", time: "3h ago", color: "#4488ff" },
                    { type: "refactor", msg: "optimize database queries", time: "5h ago", color: "#c084fc" },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`transition-all duration-500 ${commitsVisible[i] ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                    >
                      <div className="flex items-center gap-3 font-[JetBrains_Mono] text-xs">
                        <span
                          className="shrink-0 px-2 py-0.5 text-[10px]"
                          style={{
                            color: c.color,
                            border: `1px solid ${c.color}40`,
                            background: `${c.color}12`,
                          }}
                        >
                          {c.type}
                        </span>
                        <span className="text-[var(--text-secondary)] truncate">{c.msg}</span>
                        <span className="text-[var(--text-muted)] text-[10px] shrink-0 ml-auto">{c.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] flex gap-8 font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">
                  <div>
                    <div className="text-[var(--text-primary)] font-bold text-xl mb-1 font-[Syne]">4</div>
                    commits
                  </div>
                  <div>
                    <div className="text-[var(--text-primary)] font-bold text-xl mb-1 font-[Syne]">2</div>
                    PRs merged
                  </div>
                  <div>
                    <div className="text-[var(--accent-green)] font-bold text-xl mb-1 font-[Syne]">9.1</div>
                    velocity
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[var(--bg-primary)] relative flex flex-col">
                <div className="flex items-center justify-between mb-7">
                  <span className="font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em]">
                    AI STANDUP — GENERATED
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                    <span className="font-[JetBrains_Mono] text-[10px] text-[var(--accent-orange)]">
                      claude-3-5-sonnet
                    </span>
                  </div>
                </div>
                <pre className="font-[JetBrains_Mono] text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-[1.8] flex-1">
                  {typedText}
                  <span className="inline-block w-[2px] h-[14px] bg-[var(--accent-orange)] ml-0.5 align-middle animate-blink" />
                </pre>
                <div className="mt-8 flex items-center gap-3">
                  <div className="font-[JetBrains_Mono] text-[10px] border border-[var(--border-subtle)] px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border-accent)] cursor-pointer transition-colors">
                    COPY
                  </div>
                  <div className="font-[JetBrains_Mono] text-[10px] border border-[var(--border-subtle)] px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--border-accent)] cursor-pointer transition-colors">
                    SHARE →
                  </div>
                  <div className="font-[JetBrains_Mono] text-[10px] bg-[var(--accent-orange)] text-white px-3 py-1.5 cursor-pointer hover:brightness-110 transition-all">
                    LINKEDIN POST
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-28 px-8 md:px-16 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-[auto,1fr] gap-16 md:gap-24 items-start">
          <div className="shrink-0">
            <div className="font-[Syne] font-extrabold text-[clamp(80px,11vw,152px)] text-[var(--accent-orange)] leading-none tabular-nums">
              1.2K+
            </div>
            <p className="font-[DM_Sans] text-[var(--text-secondary)] mt-5 text-base leading-relaxed max-w-xs">
              Engineers shipping faster every morning — without ever writing a standup from scratch.
            </p>
          </div>
          <div className="space-y-5 pt-2">
            {[
              {
                quote: "Finally, a standup tool that doesn't feel like a chore. DevPulse has reclaimed 20 minutes of my morning every single day.",
                author: "Alex K.",
                role: "Senior SWE @ Stripe",
                init: "AK",
              },
              {
                quote: "The AI coach feature genuinely helps me think about what I'm actually working on. It's not just automation — it's a second brain.",
                author: "Priya M.",
                role: "Staff Engineer @ Linear",
                init: "PM",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="border border-[var(--border-subtle)] p-7 hover:border-[var(--border-accent)] transition-colors duration-200 group"
              >
                <p className="font-[DM_Sans] text-[var(--text-primary)] text-base leading-relaxed mb-6">
                  <span className="text-[var(--accent-orange)] font-bold text-xl mr-1">"</span>
                  {t.quote}
                  <span className="text-[var(--accent-orange)] font-bold text-xl ml-1">"</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center font-[JetBrains_Mono] text-[10px] text-white font-bold shrink-0" style={{ background: "linear-gradient(135deg, #ff5c00, #ff2d55)" }}>
                    {t.init}
                  </div>
                  <div>
                    <div className="font-[Syne] font-semibold text-sm">{t.author}</div>
                    <div className="font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — SPLIT ── */}
      <section className="grid md:grid-cols-2 min-h-[55vh]">
        <div className="bg-[var(--bg-primary)] flex flex-col justify-center px-12 md:px-16 py-24 border-r border-[var(--border-subtle)]">
          <span className="font-[JetBrains_Mono] text-[10px] text-[var(--accent-orange)] tracking-[0.4em] uppercase mb-8 block">
            START NOW
          </span>
          <h2 className="font-[Syne] font-extrabold text-[clamp(36px,4.5vw,64px)] leading-[1.05] mb-6">
            Ready to never<br />write a standup<br />again?
          </h2>
          <p className="font-[DM_Sans] text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs">
            Connect your GitHub in 30 seconds. Your first AI standup is free, forever.
          </p>
          <div className="mt-10 font-[JetBrains_Mono] text-[10px] text-[var(--text-muted)] uppercase tracking-[0.25em] pt-8 border-t border-[var(--border-subtle)]">
            Built for Replit 10 Year Buildathon · Powered by Claude AI
          </div>
        </div>
        <div
          className="flex flex-col justify-center items-center px-12 py-24 relative overflow-hidden"
          style={{ background: "var(--accent-orange)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(0,0,0,0.8) 24px, rgba(0,0,0,0.8) 25px)",
            }}
          />
          <button
            onClick={handleLogin}
            className="relative z-10 group flex flex-col items-center gap-7 text-white"
          >
            <Github className="w-14 h-14 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-center">
              <div className="font-[Syne] font-extrabold text-4xl md:text-5xl leading-[1.1]">
                Get Started<br />Free
              </div>
              <div className="flex items-center justify-center gap-2 mt-3 font-[JetBrains_Mono] text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Login with GitHub</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
            <span className="font-[JetBrains_Mono] text-[10px] tracking-[0.35em] opacity-60 uppercase">
              No credit card required
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
