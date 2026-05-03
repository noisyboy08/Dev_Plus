import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetStandupHistory } from "@workspace/api-client-react";
import { StandupCard } from "@/components/StandupCard";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogTitle, 
  DialogHeader,
  DialogDescription
} from "@/components/ui/dialog";
import { Search, Filter, Clock, ChevronRight } from "lucide-react";

export function History() {
  const { data: history, isLoading } = useGetStandupHistory({});
  const [searchTerm, setSearchTerm] = useState("");
  const [repoFilter, setRepoFilter] = useState<string>("all");

  const repos = Array.from(new Set(history?.map(s => s.repoName) || []));

  const filteredHistory = history?.filter(s => {
    const matchesSearch = 
      s.yesterday.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.today.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.repoName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRepo = repoFilter === "all" || s.repoName === repoFilter;
    
    return matchesSearch && matchesRepo;
  }) || [];

  return (
    <AppLayout requireAuth>
      <div className="space-y-10">
        <div className="animate-fade-up">
          <h1 className="font-[Syne] font-semibold text-3xl text-[var(--text-primary)] tracking-tight">Standup History</h1>
          <p className="text-[var(--text-secondary)] font-[DM_Sans] mt-2">A chronological record of your engineering updates.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 animate-fade-up-1">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent-orange)] transition-colors" />
            <input
              placeholder="Search content or repository..."
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg pl-11 pr-4 py-3 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-orange)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent-orange)] transition-colors" />
              <select 
                value={repoFilter} 
                onChange={(e) => setRepoFilter(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg pl-11 pr-4 py-3 text-sm font-mono text-[var(--text-primary)] appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--accent-orange)]"
              >
                <option value="all">All Repositories</option>
                {repos.map(repo => (
                  <option key={repo} value={repo}>{repo}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="shimmer h-20 rounded-xl border border-[var(--border-subtle)]" />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-20 flex flex-col items-center justify-center text-center animate-fade-up-2">
            <Clock className="w-12 h-12 text-[var(--text-muted)] mb-6" />
            <h3 className="font-[Syne] font-bold text-xl text-[var(--text-primary)]">No updates found</h3>
            <p className="text-[var(--text-secondary)] font-[DM_Sans] mt-2">Adjust your filters or generate a new standup from the dashboard.</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-up-2">
            {filteredHistory.map((standup, i) => (
              <Dialog key={standup.id}>
                <DialogTrigger asChild>
                  <div className="group bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--accent-orange)]/50 transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest min-w-[120px]">
                        {new Date(standup.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="h-4 w-px bg-[var(--border-subtle)]" />
                      <div>
                        <div className="font-[Syne] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors">
                          {standup.repoName}
                        </div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)] mt-1 truncate max-w-md">
                          {standup.today}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      {standup.velocityScore != null && (
                        <div className="flex flex-col items-end">
                          <div 
                            className="font-[Syne] font-extrabold text-xl"
                            style={{ 
                              color: standup.velocityScore >= 8 ? 'var(--accent-green)' : 
                                     standup.velocityScore >= 5 ? '#ffa500' : 'var(--accent-red)' 
                            }}
                          >
                            {standup.velocityScore}
                          </div>
                          <div className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-tighter">SCORE</div>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl bg-[var(--bg-primary)] border-[var(--border-subtle)] p-0 overflow-hidden">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Standup Details</DialogTitle>
                    <DialogDescription>Full report for {standup.repoName}</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[85vh] overflow-y-auto">
                    <StandupCard standup={standup} />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
