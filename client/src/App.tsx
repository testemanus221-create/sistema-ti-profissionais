import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import TecnicoDashboard from "./pages/TecnicoDashboard";
import Profissionais from "./pages/Profissionais";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component, requiredRole }: { component: React.ComponentType<any>, requiredRole?: 'admin' | 'user' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user) {
    return <NotFound />;
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <NotFound />;
  }

  return <Component />;
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/profissionais"} component={Profissionais} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      
      {user?.role === 'admin' && (
        <Route path={"/admin/*"} component={() => <ProtectedRoute component={AdminDashboard} requiredRole="admin" />} />
      )}
      
      {user && user.role !== 'admin' && (
        <Route path={"/dashboard/*"} component={() => <ProtectedRoute component={TecnicoDashboard} />} />
      )}

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
