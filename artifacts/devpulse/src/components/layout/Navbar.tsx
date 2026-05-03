import { Link, useLocation } from "wouter";
import { useGetAuthMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, Activity, Clock, LogIn } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { data: user, isLoading } = useGetAuthMe({});
  const logoutMutation = useLogout();
  const [location] = useLocation();

  const handleLogin = () => {
    window.location.href = `${window.location.origin}/api/auth/github`;
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">DevPulse</span>
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 rounded-md transition-colors hover:text-primary ${location === "/dashboard" ? "bg-secondary text-primary" : "text-muted-foreground"}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/history" 
                className={`px-3 py-2 rounded-md transition-colors hover:text-primary ${location === "/history" ? "bg-secondary text-primary" : "text-muted-foreground"}`}
              >
                History
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      GitHub Connected
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/history">
                  <DropdownMenuItem className="cursor-pointer">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>History</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login with GitHub
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}