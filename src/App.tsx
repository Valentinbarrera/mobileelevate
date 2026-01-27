import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import GoalSelection from "./pages/onboarding/GoalSelection";
import DataHub from "./pages/onboarding/DataHub";
import WorkoutDetail from "./pages/WorkoutDetail";
import WorkoutSummary from "./pages/WorkoutSummary";
import Routines from "./pages/Routines";
import Progress from "./pages/Progress";
import ProgressUpload from "./pages/ProgressUpload";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import ExerciseHistory from "./pages/ExerciseHistory";
import WeeklyCheckin from "./pages/WeeklyCheckin";
import CheckinDetail from "./pages/CheckinDetail";
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
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding/goal" element={<GoalSelection />} />
          <Route path="/onboarding/data" element={<DataHub />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/progress/upload" element={<ProgressUpload />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/workout/:id" element={<WorkoutDetail />} />
          <Route path="/workout-summary" element={<WorkoutSummary />} />
          <Route path="/exercise/:id" element={<ExerciseHistory />} />
          <Route path="/checkin" element={<WeeklyCheckin />} />
          <Route path="/checkin/:id" element={<CheckinDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
