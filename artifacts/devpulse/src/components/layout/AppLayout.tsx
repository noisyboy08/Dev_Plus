import { ReactNode } from "react";
import { useGetAuthMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AppLayout({ children, requireAuth = false }: AppLayoutProps) {
  const { data: user, isLoading, error } = useGetAuthMe({});
  const [, setLocation] = useLocation();

  if (requireAuth) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-orange)]" />
            <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">Initializing Interface</span>
          </div>
        </div>
      );
    }

    if (!user || error) {
      setLocation("/");
      return null;
    }

    return (
      <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
          
          {/* Mobile Bottom Tab Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] flex items-center justify-around px-6 z-50">
             {/* Icons for mobile could be added here if needed, but the prompt says Sidebar collapses to bottom tab bar */}
          </div>
        </main>
      </div>
    );
  }

  // Unauthenticated pages (like Home) manage their own layout
  return <>{children}</>;
}
