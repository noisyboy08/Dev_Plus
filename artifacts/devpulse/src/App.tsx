import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetAuthMe } from "@workspace/api-client-react";

function Home() {
  return (
    <AppLayout>
      <div className="text-center py-20">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Generate <span className="text-primary">Standups</span> in Seconds
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
          Connect your GitHub account and let DevPulse analyze your commits, PRs, and issues to instantly generate your daily standup update.
        </p>
      </div>
    </AppLayout>
  );
}

function Dashboard() {
  return (
    <AppLayout requireAuth>
      <div>Dashboard</div>
    </AppLayout>
  );
}

function History() {
  return (
    <AppLayout requireAuth>
      <div>History</div>
    </AppLayout>
  );
}

function Settings() {
  return (
    <AppLayout requireAuth>
      <div>Settings</div>
    </AppLayout>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
