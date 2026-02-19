import React, { useState, useEffect } from 'react';

// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Router
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InventoryDetail from "./pages/InventoryDetails";
import ComparePage from "./pages/ComparePage";

// Components
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/PageLoader";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if user is already "logged in"
    const authStatus = localStorage.getItem("is_auth") === "true";
    setIsAuthenticated(authStatus);

    // Simulate a small connection delay for premium feel
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-fill for convenience if empty
    const finalUser = username || "admin";
    const finalPass = password || "admin123";

    // THE HARDCODED AUTHENTICATION (as requested)
    if (finalUser === "admin" && finalPass === "admin123") {
      localStorage.setItem("is_auth", "true");
      localStorage.setItem("user_name", "Administrator");
      setIsAuthenticated(true);
      toast.success("Welcome, Administrator");
    } else {
      toast.error("Invalid credentials. Try admin / admin123");
    }
  };

  if (isLoading) {
    return <PageLoader message="Initializing secure portal..." />;
  }

  // --- LOGIN PAGE UI ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0 bg-gradient-primary opacity-20 animate-pulse" />
        <div className="absolute -top-[20%] -left-[10%] w-[70vh] h-[70vh] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] -right-[10%] w-[60vh] h-[60vh] rounded-full bg-accent/20 blur-[100px] pointer-events-none" />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-[420px] p-8 mx-4">
          {/* Glass Card */}
          <div className="absolute inset-0 bg-card/70 backdrop-blur-xl rounded-2xl border border-border/20 shadow-glow" />

          <div className="relative z-10 text-center space-y-8">
            <div className="space-y-4">
              {/* Logo Area */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-card/50 rounded-full shadow-sm ring-1 ring-border/50">
                  <img
                    src="/images/sunrise_logo.png"
                    alt="Sunrise Logo"
                    className="h-16 w-auto object-contain"
                  />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Inventory Portal
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  Secure Enterprise Access System
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 text-left pt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Corporate ID</Label>
                <Input
                  id="username"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Security Key</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 mt-4"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Sign In to Portal
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 pt-2">
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                <span>Local Authentication Active (admin / admin123)</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP UI ---
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/inventory/:id" element={<InventoryDetail />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;