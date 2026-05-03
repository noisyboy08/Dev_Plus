import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useGetInsightsStreak, 
  useGetInsightsBestDay, 
  useGetInsightsPrCycleTime, 
  useGetInsightsTopKeywords,
  useGetGithubRepos,
  useGetPreferences,
  getGetInsightsPrCycleTimeQueryKey
} from "@workspace/api-client-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function Insights() {
  const { data: repos } = useGetGithubRepos({});
  const { data: prefs } = useGetPreferences({});
  const [selectedRepo, setSelectedRepo] = useState<string>("");

  useEffect(() => {
    if (prefs?.defaultRepo && !selectedRepo) {
      setSelectedRepo(prefs.defaultRepo);
    } else if (!selectedRepo && repos && repos.length > 0) {
      setSelectedRepo(repos[0].fullName);
    }
  }, [prefs, repos, selectedRepo]);

  const streak = useGetInsightsStreak({});
  const bestDay = useGetInsightsBestDay({});
  const prCycle = useGetInsightsPrCycleTime({ repo: selectedRepo }, { query: { enabled: !!selectedRepo, queryKey: getGetInsightsPrCycleTimeQueryKey({ repo: selectedRepo }) } });
  const topKeywords = useGetInsightsTopKeywords({});

  const isLoading = streak.isLoading || bestDay.isLoading || prCycle.isLoading || topKeywords.isLoading;

  return (
    <AppLayout requireAuth>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-up">
          <div>
            <h1 className="font-[Syne] font-semibold text-3xl text-[var(--text-primary)] tracking-tight">Engineering Insights</h1>
            <p className="text-[var(--text-secondary)] font-[DM_Sans] mt-2">Data-driven performance metrics from your GitHub activity.</p>
          </div>
          <div className="w-full md:w-64">
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                {repos?.map(repo => (
                  <SelectItem key={repo.id} value={repo.fullName}>{repo.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="shimmer h-[280px] rounded-xl border border-[var(--border-subtle)]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Streak Tracker */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-8 animate-fade-up-1">
              <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] mb-8">Consistency</div>
              <div className="flex flex-col items-center justify-center py-4">
                <span className="text-6xl mb-4">🔥</span>
                <h3 className="font-[Syne] font-extrabold text-5xl text-[var(--accent-orange)] mb-2">
                  {streak.data?.currentStreak || 0} day streak
                </h3>
                <p className="font-mono text-xs text-[var(--text-muted)]">
                  Longest: {streak.data?.longestStreak || 0} days
                </p>
              </div>
            </div>

            {/* Card 2: Best Day */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-8 animate-fade-up-2">
              <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Peak Performance</div>
              <div className="h-[120px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bestDay.data || []}>
                    <XAxis 
                      dataKey="day" 
                      hide 
                    />
                    <Bar dataKey="avgVelocity" radius={[2, 2, 0, 0]}>
                      {(bestDay.data || []).map((entry, index) => {
                        const isMax = entry.avgVelocity === Math.max(...(bestDay.data?.map(d => d.avgVelocity) || [0]));
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill="var(--accent-orange)" 
                            fillOpacity={isMax ? 1 : 0.3} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center">
                <h3 className="font-[Syne] font-bold text-2xl text-[var(--text-primary)]">
                  {bestDay.data?.sort((a, b) => b.avgVelocity - a.avgVelocity)[0]?.day || '—'}
                </h3>
                <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase mt-1">Highest Average Velocity</p>
              </div>
            </div>

            {/* Card 3: PR Cycle Time */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-8 animate-fade-up-3">
              <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] mb-8">Delivery Speed</div>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="font-[Syne] font-extrabold text-6xl text-[var(--text-primary)]">
                    {prCycle.data?.avgHours?.toFixed(1) || '0.0'}
                  </h3>
                  <span className="font-mono text-sm text-[var(--text-muted)] uppercase">hrs</span>
                </div>
                <div 
                  className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{ 
                    backgroundColor: `${prCycle.data?.color || 'gray'}20`, 
                    color: prCycle.data?.color || 'gray',
                    border: `1px solid ${prCycle.data?.color || 'gray'}40`
                  }}
                >
                  {prCycle.data?.label || 'Unknown'}
                </div>
                <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase mt-6 tracking-widest">Avg PR Merge Time</p>
              </div>
            </div>

            {/* Card 4: Top Keywords */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-8 animate-fade-up-4 overflow-hidden">
              <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] mb-8">Focus Areas</div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 py-4 min-h-[120px]">
                {topKeywords.data?.length ? (
                  topKeywords.data.slice(0, 15).map((kw, i) => {
                    const fontSize = Math.max(12, Math.min(32, 12 + (kw.count * 2)));
                    const isTop = i < 3;
                    return (
                      <span 
                        key={kw.word}
                        style={{ 
                          fontSize: `${fontSize}px`,
                          color: isTop ? 'var(--accent-orange)' : 'var(--text-secondary)',
                          fontWeight: isTop ? 'bold' : 'normal'
                        }}
                        className="font-[Syne] transition-all hover:scale-110 cursor-default"
                      >
                        {kw.word}
                      </span>
                    );
                  })
                ) : (
                  <p className="text-[var(--text-muted)] font-mono text-xs">Insufficient data</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
