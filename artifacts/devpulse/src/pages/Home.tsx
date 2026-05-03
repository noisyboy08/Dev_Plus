import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock, Github, Shield, Zap } from "lucide-react";

export function Home() {
  const handleLogin = () => {
    window.location.href = `${window.location.origin}/api/auth/github`;
  };

  return (
    <AppLayout>
      <div className="flex flex-col items-center text-center py-24 space-y-8">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Activity className="mr-2 h-4 w-4" />
          <span>DevPulse 1.0 is live</span>
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl max-w-4xl text-foreground">
          Generate <span className="text-primary">Standups</span> in Seconds
        </h1>
        
        <p className="max-w-2xl text-xl text-muted-foreground">
          Connect your GitHub account and let DevPulse analyze your commits, PRs, and issues to instantly generate your daily standup update. Stop wasting time writing what you already did.
        </p>
        
        <div className="flex gap-4">
          <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleLogin}>
            <Github className="mr-2 h-5 w-5" />
            Login with GitHub
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 py-16">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Generation</h3>
            <p className="text-muted-foreground">
              We analyze your GitHub activity from the last 24 hours to generate a comprehensive standup report in seconds.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sprint Intelligence</h3>
            <p className="text-muted-foreground">
              Track your velocity with dynamic scoring based on your commits and pull requests. Know exactly how your sprint is going.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">History Tracking</h3>
            <p className="text-muted-foreground">
              Keep a permanent record of all your daily standups. Easy to reference for performance reviews or 1-on-1s.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}