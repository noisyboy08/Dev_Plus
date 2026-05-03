import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetPublicStandup, getGetPublicStandupQueryKey } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

export function SharePage() {
  const params = useParams<{ id: string }>();
  const standupId = parseInt(params.id || "0");

  const { data: standup, isLoading, error } = useGetPublicStandup(standupId, {
    query: { enabled: !!standupId, queryKey: getGetPublicStandupQueryKey(standupId) }
  });

  useEffect(() => {
    if (standup) {
      document.title = `${standup.author.username}'s Standup — DevPulse`;
      const meta = document.querySelector('meta[property="og:description"]');
      if (meta) {
        meta.setAttribute("content", `Check out ${standup.author.username}'s daily standup on DevPulse.`);
      }
    }
  }, [standup]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-orange)]" />
        <span className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Fetching public standup...</span>
      </div>
    );
  }

  if (error || !standup) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-[Syne] font-bold text-4xl text-[var(--text-primary)] mb-4">404</h1>
        <p className="text-[var(--text-secondary)] font-[DM_Sans] mb-8">Standup not found or has been made private.</p>
        <Link href="/">
          <button className="btn-orange px-8 py-3 font-mono text-xs uppercase tracking-widest">Return Home</button>
        </Link>
      </div>
    );
  }

  const getVelocityColor = (score: number) => {
    if (score >= 8) return 'var(--accent-green)';
    if (score >= 5) return '#ffa500';
    return 'var(--accent-red)';
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_#0d0a14_0%,_#050507_100%)] p-6 md:p-12 selection:bg-[var(--accent-orange)] selection:text-white">
      <div className="max-w-lg mx-auto mt-12 md:mt-20 glass-card rounded-2xl p-8 md:p-12 animate-fade-up shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-orange)] opacity-[0.05] blur-[60px] rounded-full -mr-10 -mt-10" />

        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-full border-2 border-[var(--border-subtle)] p-1 mb-6 relative group">
            {standup.author.avatarUrl ? (
              <img src={standup.author.avatarUrl} alt={standup.author.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center font-[Syne] font-bold text-xl text-[var(--text-secondary)]">
                {standup.author.username.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--accent-orange)] rounded-full flex items-center justify-center border-2 border-[var(--bg-primary)]">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          
          <h2 className="font-[Syne] font-extrabold text-2xl text-[var(--text-primary)]">{standup.author.username}</h2>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] mt-1">Daily Standup</div>
          <div className="font-mono text-[10px] text-[var(--accent-orange)] mt-4 px-3 py-1 bg-[var(--accent-orange-glow)] rounded-full border border-[var(--accent-orange)]/20">
            {new Date(standup.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {standup.velocityScore != null && (
          <div className="text-center mb-12">
            <div 
              className="font-[Syne] font-extrabold text-8xl md:text-9xl tracking-tighter velocity-score-animate"
              style={{ color: getVelocityColor(standup.velocityScore) }}
            >
              {standup.velocityScore}
            </div>
            <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest -mt-4">Velocity Index</div>
          </div>
        )}

        <div className="space-y-8">
          <div className="border-l-4 border-[var(--accent-blue)]/50 pl-6 py-1">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">Yesterday</h4>
            <p className="font-[DM_Sans] text-sm leading-relaxed text-[var(--text-primary)] opacity-90">
              {standup.yesterday}
            </p>
          </div>

          <div className="border-l-4 border-[var(--accent-orange)]/50 pl-6 py-1">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">Today</h4>
            <p className="font-[DM_Sans] text-sm leading-relaxed text-[var(--text-primary)] opacity-90">
              {standup.today}
            </p>
          </div>

          {standup.blockers && standup.blockers.length > 0 && (
            <div className="border-l-4 border-[var(--accent-red)]/50 pl-6 py-1">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">Blockers</h4>
              <p className="font-[DM_Sans] text-sm leading-relaxed text-[var(--text-primary)] opacity-90">
                {standup.blockers.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 text-center">
          <Link href="/">
            <div className="inline-block cursor-pointer group">
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                Generated by <span className="text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">DevPulse</span>
              </p>
              <p className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-50">Powered by Claude AI</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
