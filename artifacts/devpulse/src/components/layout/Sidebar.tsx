import { Link, useLocation } from "wouter";
import { useGetAuthMe, useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Clock, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useGetAuthMe({});
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/insights", label: "Insights", icon: TrendingUp },
    { href: "/history", label: "History", icon: Clock },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-[240px] hidden md:flex flex-col h-screen bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] sticky top-0 overflow-y-auto">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--accent-orange)] rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse-glow" />
          </div>
          <span className="font-[Syne] font-bold text-xl tracking-tight text-[var(--text-primary)]">DevPulse</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`sidebar-nav-item flex items-center justify-between px-4 py-3 rounded-md cursor-pointer group ${isActive ? 'active' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent-orange)]' : ''}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-[var(--accent-orange)]' : ''}`} />
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-subtle)]">
        {user && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-9 w-9 border border-[var(--border-accent)]">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.username}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">Developer</p>
            </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="w-full justify-start text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-xs font-mono">LOGOUT</span>
        </Button>
      </div>
    </aside>
  );
}
