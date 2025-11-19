import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Users, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Zap,
    title: "Each step generates clean energy.",
    description: "Walk on smart pathways that convert footsteps into power.",
    image:
      "https://images.unsplash.com/photo-1549049950-9c9d21276bd3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    icon: Users,
    title: "Join your community challenges.",
    description: "Work together to light up parks and playgrounds in your neighborhood.",
    image:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=1200&auto=format&fit=crop",
  },
  {
    icon: TrendingUp,
    title: "Track your impact.",
    description: "See how your movement reduces carbon emissions and builds a sustainable future.",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop",
  },
];

const OnboardingSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("hasCompletedOnboarding", "true");
      navigate("/welcome");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    navigate("/welcome");
  };

  const IconComponent = steps[currentStep].icon;

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url(${steps[currentStep].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative min-h-screen bg-hero flex flex-col p-6">
        <div className="flex justify-end mb-8">
          <Button variant="ghost" onClick={handleSkip} className="text-white/70">
            Skip
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
          <div className="bg-primary/20 rounded-full p-8 mb-8">
            <IconComponent className="w-20 h-20 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-semibold text-center mb-4 max-w-md">
            {steps[currentStep].title}
          </h2>
          <p className="text-white/80 text-center max-w-sm mb-12">
            {steps[currentStep].description}
          </p>
          <div className="flex gap-2 mb-12">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 pill transition-all ${index === currentStep ? "w-8 bg-primary" : "w-2 bg-white/30"}`}
              />
            ))}
          </div>
        </div>

        <Button onClick={handleNext} className="w-full pill h-12 text-base">
          {currentStep < steps.length - 1 ? "Next" : "Get Started"}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingSteps;
