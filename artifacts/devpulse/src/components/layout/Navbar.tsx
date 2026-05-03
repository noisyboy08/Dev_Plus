import { Link } from "wouter";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const handleLogin = () => {
    window.location.href = window.location.origin + '/api/auth/github';
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-8 md:px-12 bg-transparent">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-2 h-2 rounded-full bg-[var(--accent-orange)] group-hover:scale-150 transition-transform" />
        <span className="font-[Space_Mono] text-lg font-bold tracking-tight text-[var(--text-primary)] uppercase">DevPulse</span>
      </Link>

      <Button 
        onClick={handleLogin}
        variant="outline"
        className="rounded-none border-white/20 text-white hover:bg-white hover:text-black transition-all font-[Space_Mono] text-xs uppercase tracking-wider px-6 h-10"
      >
        Login with GitHub
      </Button>
    </nav>
  );
}
