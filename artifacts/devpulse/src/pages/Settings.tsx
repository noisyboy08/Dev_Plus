import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useGetPreferences, 
  useUpdatePreferences, 
  useGetGithubRepos,
  useTestSlackWebhook,
  PreferencesStandupTone,
  UpdatePreferencesBody
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, MessageSquare, Github, Settings2, CheckCircle } from "lucide-react";

export function Settings() {
  const { toast } = useToast();
  const { data: prefs, isLoading: isLoadingPrefs } = useGetPreferences({});
  const { data: repos } = useGetGithubRepos({});
  
  const updateMutation = useUpdatePreferences();
  const testSlackMutation = useTestSlackWebhook();

  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [standupTone, setStandupTone] = useState<PreferencesStandupTone>("professional");
  const [defaultRepo, setDefaultRepo] = useState("");

  useEffect(() => {
    if (prefs) {
      setSlackWebhookUrl(prefs.slackWebhookUrl || "");
      setStandupTone(prefs.standupTone || "professional");
      setDefaultRepo(prefs.defaultRepo || "");
    }
  }, [prefs]);

  const handleSave = () => {
    const data: UpdatePreferencesBody = { standupTone };
    data.slackWebhookUrl = slackWebhookUrl || null;
    data.defaultRepo = defaultRepo && defaultRepo !== "none" ? defaultRepo : null;

    updateMutation.mutate({ data }, {
      onSuccess: () => toast({ title: "Settings saved", description: "Your preferences have been updated." }),
      onError: (err: any) => toast({ title: "Failed to save", description: err?.error || "An error occurred.", variant: "destructive" })
    });
  };

  const handleTestSlack = () => {
    if (!slackWebhookUrl) {
      toast({ title: "Missing URL", description: "Please enter a Slack webhook URL.", variant: "destructive" });
      return;
    }
    testSlackMutation.mutate({ data: { webhookUrl: slackWebhookUrl } }, {
      onSuccess: () => toast({ title: "Test successful", description: "Check your Slack channel." }),
      onError: (err: any) => toast({ title: "Test failed", description: err?.error || "Check your URL.", variant: "destructive" })
    });
  };

  if (isLoadingPrefs) {
    return (
      <AppLayout requireAuth>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-orange)]" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requireAuth>
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="animate-fade-up">
          <h1 className="font-[Syne] font-semibold text-3xl text-[var(--text-primary)] tracking-tight">Interface Configuration</h1>
          <p className="text-[var(--text-secondary)] font-[DM_Sans] mt-2">Adjust your AI preferences and integration settings.</p>
        </div>

        <div className="grid gap-12 animate-fade-up-1">
          {/* SLACK SECTION */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-xl">
            <div className="p-8 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[var(--accent-orange)]" />
                <h2 className="font-[Syne] font-bold text-lg text-[var(--text-primary)]">Slack Integration</h2>
              </div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Webhooks</div>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Incoming Webhook URL</label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    placeholder="https://hooks.slack.com/services/..."
                    className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-orange)]"
                    value={slackWebhookUrl}
                    onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleTestSlack}
                    disabled={!slackWebhookUrl || testSlackMutation.isPending}
                    className="h-auto px-6 font-mono text-xs uppercase tracking-widest border-[var(--border-subtle)]"
                  >
                    {testSlackMutation.isPending ? '...' : 'Test'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* PREFERENCES SECTION */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-xl">
            <div className="p-8 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-[var(--accent-orange)]" />
                <h2 className="font-[Syne] font-bold text-lg text-[var(--text-primary)]">Generation Engine</h2>
              </div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">AI Tuning</div>
            </div>
            <div className="p-8 space-y-10">
              <div className="space-y-6">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Standup Tone</label>
                <div className="grid gap-4">
                  {[
                    { id: 'professional', name: 'Professional', desc: 'Precise engineering language for enterprise teams.' },
                    { id: 'casual', name: 'Casual', desc: 'Relaxed, emoji-friendly tone for modern startups.' },
                    { id: 'bullet-points', name: 'Bullet Points', desc: 'Strictly technical lists for rapid scannability.' }
                  ].map(tone => (
                    <div 
                      key={tone.id}
                      onClick={() => setStandupTone(tone.id as PreferencesStandupTone)}
                      className={`relative p-5 bg-[var(--bg-tertiary)] border rounded-xl cursor-pointer transition-all ${standupTone === tone.id ? 'border-[var(--accent-orange)] shadow-[0_0_20px_var(--accent-orange-glow)]' : 'border-[var(--border-subtle)] opacity-60 hover:opacity-100'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-[Syne] font-bold text-[var(--text-primary)]">{tone.name}</span>
                        {standupTone === tone.id && <CheckCircle className="w-4 h-4 text-[var(--accent-orange)]" />}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-[DM_Sans]">{tone.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <Github className="w-4 h-4 text-[var(--text-muted)]" />
                  <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Default Repository</label>
                </div>
                <select 
                  value={defaultRepo || "none"} 
                  onChange={(e) => setDefaultRepo(e.target.value)}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-sm font-mono text-[var(--text-primary)] appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--accent-orange)]"
                >
                  <option value="none">None (Select manually)</option>
                  {repos?.map(repo => (
                    <option key={repo.id} value={repo.fullName}>{repo.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 flex justify-end animate-fade-up-2">
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="btn-orange rounded-none h-14 px-12 font-[Syne] font-bold text-lg flex items-center gap-3"
          >
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Persist Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
