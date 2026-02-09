import React from 'react';
import { AuthProvider, useAuth } from "react-oidc-context";
import { oidcConfig } from "./lib/authConfig";

// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Router
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InventoryDetail from "./pages/InventoryDetails";
import ComparePage from "./pages/ComparePage";

// Components
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/PageLoader";

const queryClient = new QueryClient();

// --- 1. Create a wrapper component to handle the Auth Logic ---
const AppContent = () => {
  const auth = useAuth();

  // A. Loading State
  if (auth.isLoading) {
    return <PageLoader message="Connecting to Corporate Server..." />;
  }

  // B. Error State
  if (auth.error) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 text-red-600">
        <div className="font-bold">Authentication Error</div>
        <div>{auth.error.message}</div>
        <button
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded text-black transition"
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    // Pass the ID token hint so Keycloak knows exactly who is logging out
    auth.signoutRedirect({
      id_token_hint: auth.user?.id_token,
      post_logout_redirect_uri: window.location.origin,
    });
  };

  // C. Not Logged In -> Show Professional Login Page
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">

        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0 bg-gradient-primary opacity-20 animate-pulse" />
        <div className="absolute -top-[20%] -left-[10%] w-[70vh] h-[70vh] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] -right-[10%] w-[60vh] h-[60vh] rounded-full bg-accent/20 blur-[100px] pointer-events-none" />

        {/* Background Image Overlay (Optional - kept for context but muted) */}
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay">
          <img
            src="/images/sunrise_bg.jpg"
            alt="Background"
            className="w-full h-full object-cover grayscale"
          />
        </div>

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

            <div className="space-y-6 pt-4">
              <button
                onClick={() => auth.signinRedirect()}
                className="w-full group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Sign In with Corporate ID
                </span>
                {/* Button Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // D. Logged In -> Show Main App
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute requiredRoles={['inventory_viewer']}>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/:id"
                element={
                  <ProtectedRoute requiredRoles={['inventory_viewer']}>
                    <InventoryDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compare"
                element={
                  <ProtectedRoute requiredRoles={['inventory_viewer']}>
                    <ComparePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

// --- 2. Main App Component wraps everything in AuthProvider ---
const App = () => {
  return (
    <AuthProvider {...oidcConfig}>
      <AppContent />
    </AuthProvider>
  );
};

export default App;