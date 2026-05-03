import { 
  Standup, 
  useSendStandupToSlack, 
  useGenerateLinkedinPost 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Copy, Slack, Linkedin, Share2, RefreshCw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface StandupCardProps {
  standup: Standup;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function StandupCard({ standup, onRegenerate, isRegenerating }: StandupCardProps) {
  const { toast } = useToast();
  const sendToSlackMutation = useSendStandupToSlack();
  const linkedinMutation = useGenerateLinkedinPost();

  const handleCopy = () => {
    const text = `Yesterday: ${standup.yesterday}\n\nToday: ${standup.today}\n\nBlockers: ${standup.blockers?.length ? standup.blockers.join(', ') : 'None'}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleShare = () => {
    const url = window.location.origin + '/standup/' + standup.id + '/share';
    navigator.clipboard.writeText(url);
    toast({ title: "Share link copied" });
  };

  const handleSlack = () => {
    sendToSlackMutation.mutate({ id: standup.id }, {
      onSuccess: () => toast({ title: "Sent to Slack" }),
      onError: () => toast({ title: "Failed to send to Slack", variant: "destructive" })
    });
  };

  const getVelocityColor = (score: number) => {
    if (score >= 8) return 'var(--accent-green)';
    if (score >= 5) return '#ffa500';
    return 'var(--accent-red)';
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg overflow-hidden animate-fade-up shadow-2xl">
      <div className="p-8 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="font-mono text-xs text-[var(--text-muted)] tracking-widest uppercase">
          {new Date(standup.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        {standup.velocityScore != null && (
          <div className="flex flex-col items-center">
            <div 
              className="font-[Syne] font-extrabold text-4xl velocity-score-animate"
              style={{ color: getVelocityColor(standup.velocityScore) }}
            >
              {standup.velocityScore}
            </div>
            <div className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-tighter">VELOCITY SCORE</div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2">
        <div className="p-8 border-r border-[var(--border-subtle)]">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">YESTERDAY</div>
          <div className="font-[DM_Sans] text-sm leading-relaxed text-[var(--text-primary)]">
            {standup.yesterday}
          </div>
        </div>
        <div className="p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">TODAY</div>
          <div className="font-[DM_Sans] text-sm leading-relaxed text-[var(--text-primary)]">
            {standup.today}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 border-t border-[var(--border-subtle)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4 p-4 rounded-r border-l-4 border-[var(--accent-red)] bg-red-500/5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">BLOCKERS</div>
              <div className="font-[DM_Sans] text-sm text-[var(--text-primary)]">
                {standup.blockers?.length ? standup.blockers.join(', ') : <span className="text-[var(--accent-green)]/60 italic">None</span>}
              </div>
            </div>
          </div>

          {standup.nextPriorityTask && (
            <div className="flex items-start gap-4 p-4 rounded-r border-l-4 border-[var(--accent-orange)] bg-[var(--accent-orange-glow)]">
              <Zap className="w-4 h-4 text-[var(--accent-orange)] mt-1 flex-shrink-0" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">PRIORITY TASK</div>
                <div className="font-[DM_Sans] text-sm text-[var(--text-primary)]">
                  {standup.nextPriorityTask}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-8 rounded-none border border-[var(--border-subtle)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          >
            <Copy className="w-3 h-3 mr-2" />
            Copy
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSlack}
            disabled={sendToSlackMutation.isPending}
            className="h-8 rounded-none border border-[var(--border-subtle)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          >
            <Slack className="w-3 h-3 mr-2" />
            Slack
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => linkedinMutation.mutate({ data: { standupId: standup.id } })}
                className="h-8 rounded-none border border-[var(--border-subtle)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                <Linkedin className="w-3 h-3 mr-2" />
                LinkedIn
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-[Syne]">LinkedIn Post Preview</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {linkedinMutation.isPending ? (
                  <div className="flex flex-col items-center py-10 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-orange)]" />
                    <span className="text-xs font-mono uppercase tracking-widest opacity-50">Crafting your professional post...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea 
                      readOnly 
                      value={linkedinMutation.data?.post} 
                      className="w-full h-48 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-4 font-[DM_Sans] text-sm resize-none focus:outline-none"
                    />
                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          navigator.clipboard.writeText(linkedinMutation.data?.post || "");
                          toast({ title: "Post copied" });
                        }}
                        className="font-mono text-xs"
                      >
                        Copy Text
                      </Button>
                      <Button 
                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/standup/' + standup.id + '/share')}`, '_blank')}
                        className="btn-orange font-mono text-xs"
                      >
                        Open LinkedIn
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare}
            className="h-8 rounded-none border border-[var(--border-subtle)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          >
            <Share2 className="w-3 h-3 mr-2" />
            Share →
          </Button>
        </div>

        {onRegenerate && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="h-8 rounded-none font-mono text-[10px] uppercase tracking-wider text-[var(--accent-orange)] hover:bg-[var(--accent-orange-glow)] ml-auto"
          >
            <RefreshCw className={`w-3 h-3 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            ↺ Regen
          </Button>
        )}
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
