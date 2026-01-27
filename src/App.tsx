import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import WorkoutDetail from "./pages/WorkoutDetail";
import WorkoutSummary from "./pages/WorkoutSummary";
import Routines from "./pages/Routines";
import Progress from "./pages/Progress";
import ProgressUpload from "./pages/ProgressUpload";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import ExerciseHistory from "./pages/ExerciseHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/progress/upload" element={<ProgressUpload />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/workout/:id" element={<WorkoutDetail />} />
          <Route path="/workout-summary" element={<WorkoutSummary />} />
          <Route path="/exercise/:id" element={<ExerciseHistory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
