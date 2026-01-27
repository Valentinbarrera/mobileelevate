import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
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
          {/* Public routes - redirect to home if logged in */}
          <Route path="/welcome" element={<PublicRoute><Welcome /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/onboarding/goal" element={<PublicRoute><GoalSelection /></PublicRoute>} />
          <Route path="/onboarding/data" element={<PublicRoute><DataHub /></PublicRoute>} />
          
          {/* Protected routes - require authentication */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/routines" element={<ProtectedRoute><Routines /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/progress/upload" element={<ProtectedRoute><ProgressUpload /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/workout/:id" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
          <Route path="/workout-summary" element={<ProtectedRoute><WorkoutSummary /></ProtectedRoute>} />
          <Route path="/exercise/:id" element={<ProtectedRoute><ExerciseHistory /></ProtectedRoute>} />
          <Route path="/checkin" element={<ProtectedRoute><WeeklyCheckin /></ProtectedRoute>} />
          <Route path="/checkin/:id" element={<ProtectedRoute><CheckinDetail /></ProtectedRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
