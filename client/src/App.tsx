import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import AdminAccess from "./pages/AdminAccess";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AdminAccess} />
      <Route path="/admin-access" component={AdminAccess} />
      <Route path="/dashboard">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/appointments">
        <DashboardLayout>
          <Appointments />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/clients">
        <DashboardLayout>
          <Clients />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/services">
        <DashboardLayout>
          <Services />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/staff">
        <DashboardLayout>
          <Staff />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/reports">
        <DashboardLayout>
          <Reports />
        </DashboardLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
