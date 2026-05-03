import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetStandupHistory } from "@workspace/api-client-react";
import { StandupCard, getVelocityColor } from "@/components/StandupCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Clock, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Standup History</h1>
          <p className="text-muted-foreground mt-1">Review your past daily updates and velocity trends.</p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content or repository..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64 flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={repoFilter} onValueChange={setRepoFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Repositories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Repositories</SelectItem>
                  {repos.map(repo => (
                    <SelectItem key={repo} value={repo}>{repo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-card">
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card className="bg-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No standups found</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Try adjusting your search filters or go to the dashboard to generate a new standup.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map(standup => (
              <Dialog key={standup.id}>
                <DialogTrigger asChild>
                  <Card className="bg-card hover:bg-secondary/20 transition-colors cursor-pointer border-border">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">
                            {new Date(standup.date).toLocaleDateString(undefined, { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h3>
                          {standup.sentToSlack && (
                            <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                              Sent to Slack
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{standup.repoName}</p>
                      </div>
                      
                      {standup.velocityScore != null && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Velocity</span>
                          <Badge variant="outline" className={getVelocityColor(standup.velocityScore)}>
                            {standup.velocityScore}/10
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-3xl border-border bg-background p-0 overflow-hidden">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Standup for {new Date(standup.date).toLocaleDateString()}</DialogTitle>
                    <DialogDescription>View the full standup details.</DialogDescription>
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