import { Standup } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Slack, RefreshCw, CheckCircle2, AlertCircle, ArrowRightCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendStandupToSlack } from "@workspace/api-client-react";

interface StandupCardProps {
  standup: Standup;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function getVelocityColor(score: number | null | undefined) {
  if (score == null) return "bg-muted text-muted-foreground";
  if (score >= 8) return "bg-green-500/10 text-green-500 border-green-500/20";
  if (score >= 5) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  return "bg-red-500/10 text-red-500 border-red-500/20";
}

export function StandupCard({ standup, onRegenerate, isRegenerating }: StandupCardProps) {
  const { toast } = useToast();
  const sendToSlackMutation = useSendStandupToSlack();

  const handleCopy = () => {
    const text = `Yesterday: ${standup.yesterday}
Today: ${standup.today}
Blockers: ${standup.blockers?.length > 0 ? standup.blockers.join(', ') : 'None'}`;
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Standup text has been copied to your clipboard.",
      });
    });
  };

  const handleSlack = () => {
    sendToSlackMutation.mutate({ id: standup.id }, {
      onSuccess: () => {
        toast({
          title: "Sent to Slack",
          description: "Standup was successfully sent to your configured Slack channel.",
        });
      },
      onError: () => {
        toast({
          title: "Failed to send",
          description: "Could not send to Slack. Check your settings.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="w-full bg-card border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-bold">Today's Standup</CardTitle>
          <div className="text-sm text-muted-foreground font-mono">
            {standup.repoName} • {new Date(standup.date).toLocaleDateString()}
          </div>
        </div>
        {standup.velocityScore != null && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Velocity</span>
            <Badge variant="outline" className={`text-base px-3 py-1 ${getVelocityColor(standup.velocityScore)}`}>
              {standup.velocityScore} / 10
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <h4 className="flex items-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Yesterday
          </h4>
          <div className="pl-6 border-l-2 border-border/50 whitespace-pre-wrap text-sm leading-relaxed">
            {standup.yesterday}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="flex items-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <ArrowRightCircle className="mr-2 h-4 w-4 text-primary" /> Today
          </h4>
          <div className="pl-6 border-l-2 border-primary/30 whitespace-pre-wrap text-sm leading-relaxed">
            {standup.today}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="flex items-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <AlertCircle className="mr-2 h-4 w-4 text-destructive" /> Blockers
          </h4>
          <div className="pl-6 border-l-2 border-destructive/30 text-sm">
            {standup.blockers && standup.blockers.length > 0 ? (
              <ul className="list-disc pl-4 space-y-1">
                {standup.blockers.map((blocker, i) => (
                  <li key={i}>{blocker}</li>
                ))}
              </ul>
            ) : (
              <span className="text-muted-foreground italic">None</span>
            )}
          </div>
        </div>

        {standup.nextPriorityTask && (
          <div className="p-3 bg-secondary/50 rounded-md border border-border">
            <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Suggested Next Priority</div>
            <div className="text-sm">{standup.nextPriorityTask}</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/20 border-t border-border pt-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Text
          </Button>
          <Button variant="outline" size="sm" onClick={handleSlack} disabled={sendToSlackMutation.isPending}>
            <Slack className="mr-2 h-4 w-4" />
            {sendToSlackMutation.isPending ? "Sending..." : "Send to Slack"}
          </Button>
        </div>
        {onRegenerate && (
          <Button variant="ghost" size="sm" onClick={onRegenerate} disabled={isRegenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}