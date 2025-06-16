import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import Targeting from "@/pages/targeting";
import Budget from "@/pages/budget";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/onboarding";
import AdCopyGeneratorPage from "@/pages/ad-copy-generator";
import ChannelPlanner from "@/pages/channel-planner";
import VisualStyleGuide from "@/pages/visual-style-guide";
import LaunchWizard from "@/pages/launch-wizard";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Sidebar from "@/components/layout/sidebar";

interface AuthState {
  isAuthenticated: boolean;
  businessId: number | null;
  businessName: string | null;
}

function Router({ authState, onLogout }: { authState: AuthState; onLogout: () => void }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar businessName={authState.businessName} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/campaigns" component={Campaigns} />
          <Route path="/targeting" component={Targeting} />
          <Route path="/budget" component={Budget} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/ad-copy-generator" component={AdCopyGeneratorPage} />
          <Route path="/channel-planner" component={ChannelPlanner} />
          <Route path="/visual-style" component={VisualStyleGuide} />
          <Route path="/launch-wizard" component={LaunchWizard} />
          <Route path="/settings" component={Settings} />
          <Route path="/onboarding" component={Onboarding} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    businessId: null,
    businessName: null,
  });

  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setAuthState(parsed);
      } catch (error) {
        console.error('Failed to parse saved auth state:', error);
        localStorage.removeItem('auth');
      }
    }
  }, []);

  const handleLoginSuccess = (businessId: number) => {
    const newAuthState = {
      isAuthenticated: true,
      businessId,
      businessName: "Mike's Coffee Shop",
    };
    setAuthState(newAuthState);
    localStorage.setItem('auth', JSON.stringify(newAuthState));
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      businessId: null,
      businessName: null,
    });
    localStorage.removeItem('auth');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {authState.isAuthenticated ? (
          <Router authState={authState} onLogout={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
