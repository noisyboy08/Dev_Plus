import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { useGetAuthMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

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
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      );
    }

    if (!user || error) {
      setLocation("/");
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}