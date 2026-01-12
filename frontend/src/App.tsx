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

const queryClient = new QueryClient();

// --- 1. Create a wrapper component to handle the Auth Logic ---
const AppContent = () => {
  const auth = useAuth();

  // A. Loading State
  if (auth.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
           {/* Simple Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg font-semibold text-slate-700">Connecting to Corporate Server...</div>
        </div>
      </div>
    );
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
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-100">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <img 
                src="/images/sunrise_bg.jpg" // Ensure this path is correct in /public
                alt="Background" 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md p-8 bg-white/95 backdrop-blur shadow-2xl rounded-xl text-center space-y-8 animate-in fade-in zoom-in duration-300">
          
          <div className="space-y-2">
            {/* Logo */}
            <div className="flex justify-center mb-4">
                <img 
                    src="/images/sunrise_logo.png" 
                    alt="Sunrise Logo" 
                    className="h-20 w-auto object-contain" 
                />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800">Inventory Portal</h1>
            <p className="text-slate-500 text-sm">Secure Enterprise Access</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => auth.signinRedirect()}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Sign In with Corporate ID (ADFS)
            </button>
            
            <p className="text-xs text-slate-400">
              Access is monitored and logged.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // D. Logged In -> Show Main App
  return (
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