import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const genders = ["Male", "Female"];

const GenderSelection = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");

  const handleContinue = () => {
    if (!selected) return;
    localStorage.setItem("userGender", selected);
    navigate("/setup/age");
  };

  return (
    <div className="min-h-screen bg-hero flex flex-col p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/login")}
        className="self-start mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <p className="text-sm text-primary mb-2">Step 1 of 5</p>
          <h1 className="text-3xl font-bold mb-2">What's Your Gender?</h1>
          <p className="text-white/80">
            This helps us personalize your fitness goals
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {genders.map((gender) => (
            <button
              key={gender}
              onClick={() => setSelected(gender)}
              className={`w-full p-4 pill text-left transition-all ${
                selected === gender
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "glass hover:bg-muted"
              }`}
            >
              {gender}
            </button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full pill h-12 text-base"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default GenderSelection;
