import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useGetGithubRepos, 
  useGetGithubVelocity, 
  useGenerateStandup,
  useGetPreferences,
  useGetStandupHistory,
  useCoachChat,
  useGetAuthMe,
  getGetGithubVelocityQueryKey,
  CoachChatMessage
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { StandupCard } from "@/components/StandupCard";
import { VelocityChart } from "@/components/VelocityChart";
import { 
  Loader2, 
  Zap, 
  Bot, 
  X, 
  Send,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetStandupHistoryQueryKey } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user } = useGetAuthMe({});
  const { data: prefs } = useGetPreferences({});
  const { data: repos, isLoading: isLoadingRepos } = useGetGithubRepos({});
  const { data: history } = useGetStandupHistory({});
  
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachInput, setCoachInput] = useState("");
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set initial repo from preferences when available
  useEffect(() => {
    if (prefs?.defaultRepo && !selectedRepo && repos?.some(r => r.fullName === prefs.defaultRepo)) {
      setSelectedRepo(prefs.defaultRepo);
    } else if (!selectedRepo && repos && repos.length > 0) {
      setSelectedRepo(repos[0].fullName);
    }
  }, [prefs, repos, selectedRepo]);

  const { data: velocityData, isLoading: isLoadingVelocity } = useGetGithubVelocity(
    { repo: selectedRepo },
    { query: { enabled: !!selectedRepo, queryKey: getGetGithubVelocityQueryKey({ repo: selectedRepo }) } }
  );

  const generateMutation = useGenerateStandup();
  const coachMutation = useCoachChat();

  const today = new Date().toISOString().split('T')[0];
  const todaysStandup = history?.find(s => 
    s.repoName === selectedRepo && 
    s.date.split('T')[0] === today
  );

  const handleGenerate = () => {
    if (!selectedRepo) return;
    
    generateMutation.mutate({ data: { repoName: selectedRepo } }, {
      onSuccess: () => {
        toast({ title: "Standup generated", description: "Your daily standup has been created successfully." });
        queryClient.invalidateQueries({ queryKey: getGetStandupHistoryQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Generation failed", description: err?.error || "An error occurred.", variant: "destructive" });
      }
    });
  };

  const handleSendMessage = () => {
    if (!coachInput.trim() || coachMutation.isPending) return;

    const userMessage: CoachChatMessage = { role: 'user', content: coachInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCoachInput("");

    coachMutation.mutate({ 
      data: { 
        message: coachInput, 
        conversationHistory: newMessages.slice(-9), 
        repo: selectedRepo 
      } 
    }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout requireAuth>
      <div className="flex flex-col gap-10">
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-up">
          <div>
            <h1 className="font-[Syne] font-semibold text-3xl text-[var(--text-primary)]">
              {getTimeGreeting()}, {user?.username || 'Developer'}
            </h1>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-full">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Active Repo</span>
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger className="h-auto p-0 border-none bg-transparent focus:ring-0 font-mono text-xs text-[var(--accent-orange)] w-auto min-w-[120px]">
                  <SelectValue placeholder="Select repo" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                  {repos?.map(repo => (
                    <SelectItem key={repo.id} value={repo.fullName} className="focus:bg-[var(--bg-secondary)]">
                      {repo.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsCoachOpen(true)}
              variant="outline"
              className="rounded-none border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 h-11 px-6"
            >
              <Bot className="w-4 h-4" />
              Ask AI Coach
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !selectedRepo}
              className="btn-orange rounded-none h-11 px-8 font-[Syne] font-semibold flex items-center gap-2"
            >
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Generate Standup
            </Button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 gap-10 animate-fade-up-1">
          {generateMutation.isPending ? (
            <div className="shimmer h-[400px] w-full rounded-xl border border-[var(--border-subtle)]" />
          ) : todaysStandup ? (
            <StandupCard standup={todaysStandup} onRegenerate={handleGenerate} />
          ) : (
            <div 
              onClick={handleGenerate}
              className="h-[400px] border-2 border-dashed border-[var(--border-subtle)] rounded-xl flex flex-col items-center justify-center p-12 group cursor-pointer hover:border-[var(--accent-orange)]/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)]" />
              </div>
              <h3 className="font-[Syne] font-bold text-2xl mb-2 text-[var(--text-primary)]">No standup generated yet</h3>
              <p className="text-[var(--text-secondary)] font-[DM_Sans] text-center max-w-sm">
                Click to analyze your commits and generate your daily update automatically.
              </p>
            </div>
          )}

          {/* VELOCITY CHART */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-[Syne] font-semibold text-lg text-[var(--text-primary)] tracking-tight">7-Day Velocity</h2>
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em]">Repository Activity</div>
            </div>
            {isLoadingVelocity ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : velocityData ? (
              <VelocityChart data={velocityData} />
            ) : null}
          </div>
        </div>

        {/* AI COACH DRAWER */}
        <div 
          className={`fixed top-0 right-0 h-full w-[380px] bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] shadow-2xl z-[100] transition-transform duration-500 ease-in-out ${isCoachOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-orange-glow)] border border-[var(--accent-orange)]/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[var(--accent-orange)]" />
                </div>
                <h3 className="font-[Syne] font-semibold text-[var(--text-primary)]">AI Sprint Coach</h3>
              </div>
              <button onClick={() => setIsCoachOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="space-y-6 pt-10">
                  <div className="text-center">
                    <p className="font-[DM_Sans] text-sm text-[var(--text-secondary)] mb-8 px-4">
                      I'm your engineering coach. Ask me about your sprint progress, PR status, or velocity trends.
                    </p>
                    <div className="grid gap-3">
                      {[
                        "Am I on track this sprint?",
                        "Which PR needs attention?",
                        "Write a manager update email",
                        "What did I ship this week?"
                      ].map(suggestion => (
                        <button 
                          key={suggestion}
                          onClick={() => {
                            setCoachInput(suggestion);
                          }}
                          className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-mono rounded-lg hover:border-[var(--accent-orange)]/50 hover:text-[var(--text-primary)] transition-all text-left group flex justify-between items-center"
                        >
                          {suggestion}
                          <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] px-4 py-3 text-sm font-[DM_Sans] leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-[var(--accent-orange-glow)] border border-[var(--accent-orange)]/20 text-[var(--text-primary)] rounded-[12px_12px_2px_12px]' 
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-[12px_12px_12px_2px]'
                      }`}
                    >
                      {m.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full bg-[var(--accent-orange)] flex items-center justify-center text-[8px] font-bold">D</div>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">DevPulse AI</span>
                        </div>
                      )}
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {coachMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-tertiary)] p-4 rounded-[12px_12px_12px_2px] typing-indicator flex gap-1">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-subtle)]">
              <div className="relative">
                <input 
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask your coach..."
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg pl-4 pr-12 py-3 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-orange)]"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!coachInput.trim() || coachMutation.isPending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-[var(--accent-orange)] text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
