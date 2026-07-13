import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import AppLayout from "@/components/layout/AppLayout";
import PushInit from "@/components/PushInit";
import React, { Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Lazy load all pages
const Welcome = React.lazy(() => import("./pages/Welcome"));
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const UpdatePassword = React.lazy(() => import("./pages/UpdatePassword"));
const Routines = React.lazy(() => import("./pages/Routines"));
const RoutineDetail = React.lazy(() => import("./pages/RoutineDetail"));
const CoachWorkoutDetail = React.lazy(() => import("./pages/CoachWorkoutDetail"));
const FreeWorkout = React.lazy(() => import("./pages/FreeWorkout"));
const WorkoutSummary = React.lazy(() => import("./pages/WorkoutSummary"));
const Onboarding = React.lazy(() => import("./pages/Onboarding"));
const Questionnaires = React.lazy(() => import("./pages/Questionnaires"));
const Progress = React.lazy(() => import("./pages/Progress"));
const ProgressPhotos = React.lazy(() => import("./pages/ProgressPhotos"));
const ActivityHistory = React.lazy(() => import("./pages/ActivityHistory"));
const Profile = React.lazy(() => import("./pages/Profile"));
const QuestionnaireSummary = React.lazy(() => import("./pages/QuestionnaireSummary"));
const Messages = React.lazy(() => import("./pages/Messages"));
const Measurements = React.lazy(() => import("./pages/Measurements"));
const Nutrition = React.lazy(() => import("./pages/Nutrition"));
const MyDiet = React.lazy(() => import("./pages/MyDiet"));
const NutritionHistory = React.lazy(() => import("./pages/NutritionHistory"));
const ExerciseLibraryPage = React.lazy(() => import("./pages/ExerciseLibraryPage"));
const Learn = React.lazy(() => import("./pages/Learn"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Support = React.lazy(() => import("./pages/Support"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PushInit />
        <BrowserRouter>
          <Routes>
            {/* Public routes (sin nav) */}
            <Route path="/welcome" element={<PublicRoute><Lazy><Welcome /></Lazy></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><Lazy><Auth /></Lazy></PublicRoute>} />
            <Route path="/reset-password" element={<Lazy><ResetPassword /></Lazy>} />
            <Route path="/update-password" element={<Lazy><UpdatePassword /></Lazy>} />
            <Route path="/privacidad" element={<Lazy><Privacy /></Lazy>} />
            <Route path="/soporte" element={<Lazy><Support /></Lazy>} />

            {/* Protected full-screen (sin nav) */}
            <Route path="/routine/:id" element={<ProtectedRoute><Lazy><RoutineDetail /></Lazy></ProtectedRoute>} />
            <Route path="/workout/:id" element={<ProtectedRoute><Lazy><CoachWorkoutDetail /></Lazy></ProtectedRoute>} />
            <Route path="/free-workout" element={<ProtectedRoute><Lazy><FreeWorkout /></Lazy></ProtectedRoute>} />
            <Route path="/workout-summary" element={<ProtectedRoute><Lazy><WorkoutSummary /></Lazy></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Lazy><Onboarding /></Lazy></ProtectedRoute>} />

            {/* Pantallas con nav persistente + transición de contenido.
                El Suspense vive en AppLayout (fuera del AnimatePresence), así que
                acá NO envolvemos en <Lazy> para evitar la pantalla en negro al
                entrar por primera vez a una pantalla aún no cargada. */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/routines" element={<ProtectedRoute><Routines /></ProtectedRoute>} />
              <Route path="/exercises" element={<ProtectedRoute><ExerciseLibraryPage /></ProtectedRoute>} />
              <Route path="/aprender" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
              <Route path="/progress/photos" element={<ProtectedRoute><ProgressPhotos /></ProtectedRoute>} />
              <Route path="/progress/activity" element={<ProtectedRoute><ActivityHistory /></ProtectedRoute>} />
              <Route path="/measurements" element={<ProtectedRoute><Measurements /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/perfil/resumen" element={<ProtectedRoute><QuestionnaireSummary /></ProtectedRoute>} />
              <Route path="/cuestionarios" element={<ProtectedRoute><Questionnaires /></ProtectedRoute>} />
              <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
              <Route path="/nutrition/my-diet" element={<ProtectedRoute><MyDiet /></ProtectedRoute>} />
              <Route path="/nutrition/history" element={<ProtectedRoute><NutritionHistory /></ProtectedRoute>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Lazy><NotFound /></Lazy>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
