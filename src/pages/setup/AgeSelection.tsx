import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AgeSelection = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState(25);

  const handleContinue = () => {
    localStorage.setItem("userAge", age.toString());
    navigate("/setup/weight");
  };

  return (
    <div className="min-h-screen bg-hero flex flex-col p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/setup/gender")}
        className="self-start mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <p className="text-sm text-primary mb-2">Step 2 of 5</p>
          <h1 className="text-3xl font-bold mb-2">How Old Are You?</h1>
          <p className="text-white/80">
            We'll calculate age-appropriate goals
          </p>
        </div>

        <div className="glass rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-primary mb-2">{age}</div>
            <div className="text-muted-foreground">years old</div>
          </div>

          <input
            type="range"
            min="13"
            max="100"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-primary"
          />

          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>13</span>
            <span>100</span>
          </div>
        </div>

        <Button onClick={handleContinue} className="w-full pill h-12 text-base" size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default AgeSelection;
