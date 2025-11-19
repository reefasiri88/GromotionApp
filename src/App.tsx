import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Onboarding
import Splash from "./pages/onboarding/Splash";
import OnboardingSteps from "./pages/onboarding/OnboardingSteps";

// Auth
import Welcome from "./pages/auth/Welcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OTPVerification from "./pages/auth/OTPVerification";

// Setup
import GenderSelection from "./pages/setup/GenderSelection";
import AgeSelection from "./pages/setup/AgeSelection";
import WeightSelection from "./pages/setup/WeightSelection";
import HeightSelection from "./pages/setup/HeightSelection";
import CommunitySelection from "./pages/setup/CommunitySelection";


// Main App
import MainLayout from "./components/layouts/MainLayout";
import Home from "./pages/app/Home";
import History from "./pages/app/History";
import Challenges from "./pages/app/Challenges";
import MapAR from "./pages/app/MapAR";
import ARModeNative from "./pages/app/ARModeNative";
import Profile from "./pages/app/Profile";
import Leaderboard from "./pages/app/Leaderboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("isAuthenticated") === "true");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(localStorage.getItem("hasCompletedOnboarding") === "true");
  const [hasCompletedSetup, setHasCompletedSetup] = useState(localStorage.getItem("hasCompletedSetup") === "true");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for auth state
    if (!localStorage.getItem("isAuthenticated")) localStorage.setItem("isAuthenticated", "true");
    const auth = localStorage.getItem("isAuthenticated") === "true";
    const onboarding = localStorage.getItem("hasCompletedOnboarding") === "true";
    const setup = localStorage.getItem("hasCompletedSetup") === "true";
    
    setIsAuthenticated(auth);
    setHasCompletedOnboarding(onboarding);
    setHasCompletedSetup(setup);

    // Bootstrap fake local data for development/offline
    if (!localStorage.getItem("userId")) localStorage.setItem("userId", "demo-user");
    if (!localStorage.getItem("userName")) localStorage.setItem("userName", "Friend");
    if (!localStorage.getItem("userCommunity")) {
      localStorage.setItem("userCommunity", JSON.stringify({ name: "Roshn Community", members: 200, energy: "24 MWh" }));
    }

    // Debug logging for APK troubleshooting
    console.log("App initialization:");
    console.log("- isAuthenticated:", auth);
    console.log("- hasCompletedOnboarding:", onboarding);
    console.log("- hasCompletedSetup:", setup);
    
    // Set loading to false after initialization
    setIsLoading(false);
  }, []);

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Onboarding Flow */}
            <Route path="/splash" element={<Splash />} />
            <Route path="/onboarding" element={<OnboardingSteps />} />

            {/* Auth Flow */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp" element={<OTPVerification />} />

            {/* Setup Flow */}
            <Route path="/setup/gender" element={<GenderSelection />} />
            <Route path="/setup/age" element={<AgeSelection />} />
            <Route path="/setup/weight" element={<WeightSelection />} />
            <Route path="/setup/height" element={<HeightSelection />} />
            <Route path="/setup/community" element={<CommunitySelection />} />


            {/* Main App */}
            <Route path="/app" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="history" element={<History />} />
              <Route path="challenges" element={<Challenges />} />
              <Route path="map" element={<MapAR />} />
              <Route path="ar" element={<MapAR />} />
              <Route path="arnative" element={<ARModeNative />} />
              <Route path="profile" element={<Profile />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>

            {/* Root Redirect */}
            <Route 
              path="/" 
              element={
                !hasCompletedOnboarding ? (
                  <Navigate to="/splash" replace />
                ) : !isAuthenticated ? (
                  <Navigate to="/welcome" replace />
                ) : !hasCompletedSetup ? (
                  <Navigate to="/setup/gender" replace />
                ) : (
                  <Navigate to="/app" replace />
                )
              } 
            />

            {/* Fallback route to ensure app always loads */}
            <Route path="/start" element={<Navigate to="/" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
