import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useGetGithubRepos, 
  useGetGithubVelocity, 
  useGenerateStandup,
  useGetPreferences,
  useGetStandupHistory
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StandupCard } from "@/components/StandupCard";
import { VelocityChart } from "@/components/VelocityChart";
import { Loader2, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetStandupHistoryQueryKey } from "@workspace/api-client-react";

export function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: prefs } = useGetPreferences({});
  const { data: repos, isLoading: isLoadingRepos } = useGetGithubRepos({});
  const { data: history } = useGetStandupHistory({});
  
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  
  // Set initial repo from preferences when available
  if (prefs?.defaultRepo && !selectedRepo && repos?.some(r => r.fullName === prefs.defaultRepo)) {
    setSelectedRepo(prefs.defaultRepo);
  } else if (!selectedRepo && repos && repos.length > 0) {
    setSelectedRepo(repos[0].fullName);
  }

  const { data: velocityData, isLoading: isLoadingVelocity } = useGetGithubVelocity(
    { repo: selectedRepo },
    { query: { enabled: !!selectedRepo } }
  );

  const generateMutation = useGenerateStandup();

  // Find today's standup for the selected repo
  const today = new Date().toISOString().split('T')[0];
  const todaysStandup = history?.find(s => 
    s.repoName === selectedRepo && 
    s.date.split('T')[0] === today
  );

  const handleGenerate = () => {
    if (!selectedRepo) return;
    
    generateMutation.mutate({ data: { repoName: selectedRepo } }, {
      onSuccess: () => {
        toast({
          title: "Standup generated",
          description: "Your daily standup has been created successfully.",
        });
        queryClient.invalidateQueries({ queryKey: getGetStandupHistoryQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Generation failed",
          description: err?.error || "An error occurred while generating standup.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AppLayout requireAuth>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Generate and manage your daily standups.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-card p-2 rounded-lg border shadow-sm">
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="w-[250px] border-none bg-transparent focus:ring-0">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRepos ? (
                  <div className="p-2 text-sm text-center text-muted-foreground">Loading repos...</div>
                ) : repos?.length === 0 ? (
                  <div className="p-2 text-sm text-center text-muted-foreground">No repositories found</div>
                ) : (
                  repos?.map((repo) => (
                    <SelectItem key={repo.id} value={repo.fullName}>
                      {repo.fullName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-border mx-1" />
            <Button 
              onClick={handleGenerate} 
              disabled={!selectedRepo || generateMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Generate Today
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {generateMutation.isPending ? (
              <Card className="h-[400px] flex flex-col items-center justify-center bg-card border-border border-dashed">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-medium">Analyzing GitHub Activity...</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm">
                  We are reading your commits, pull requests, and issues from the last 24 hours to generate a precise update.
                </p>
              </Card>
            ) : todaysStandup ? (
              <StandupCard 
                standup={todaysStandup} 
                onRegenerate={handleGenerate}
                isRegenerating={generateMutation.isPending}
              />
            ) : (
              <Card className="h-[400px] flex flex-col items-center justify-center bg-card border-border border-dashed">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium">No standup for today</h3>
                <p className="text-muted-foreground mt-2 text-center max-w-sm mb-6">
                  Select a repository and click generate to create your daily update based on your recent activity.
                </p>
                <Button onClick={handleGenerate} disabled={!selectedRepo}>
                  Generate Standup Now
                </Button>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Velocity (Last 7 Days)</CardTitle>
                <CardDescription>Commit and PR activity for the selected repo</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingVelocity ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : velocityData && velocityData.length > 0 ? (
                  <VelocityChart data={velocityData} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                    No activity in the last 7 days
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {history?.filter(s => s.repoName === selectedRepo && s.id !== todaysStandup?.id).slice(0, 3).map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 rounded-md bg-secondary/30 border border-border">
                    <div>
                      <div className="font-medium text-sm">{new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">{s.repoName}</div>
                    </div>
                    {s.velocityScore != null && (
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        s.velocityScore >= 8 ? "bg-green-500/20 text-green-500" :
                        s.velocityScore >= 5 ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-red-500/20 text-red-500"
                      }`}>
                        {s.velocityScore}/10
                      </div>
                    )}
                  </div>
                ))}
                {(!history || history.filter(s => s.repoName === selectedRepo).length <= 1) && (
                  <div className="text-sm text-center text-muted-foreground py-4">
                    No older standups found for this repo.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}