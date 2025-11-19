import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const WeightSelection = () => {
  const navigate = useNavigate();
  const [weight, setWeight] = useState(70);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");

  const handleContinue = () => {
    localStorage.setItem("userWeight", weight.toString());
    localStorage.setItem("weightUnit", unit);
    navigate("/setup/height");
  };

  return (
    <div className="min-h-screen bg-hero flex flex-col p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/setup/age")}
        className="self-start mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <p className="text-sm text-primary mb-2">Step 3 of 5</p>
          <h1 className="text-3xl font-bold mb-2">What Is Your Weight?</h1>
          <p className="text-white/80">
            This helps calculate calories burned
          </p>
        </div>

        <div className="glass rounded-2xl p-8 mb-4">
          <div className="flex justify-center gap-2 mb-6">
            <Button variant={unit === "kg" ? "default" : "outline"} onClick={() => setUnit("kg")} size="sm" className="pill px-5">
              KG
            </Button>
            <Button variant={unit === "lb" ? "default" : "outline"} onClick={() => setUnit("lb")} size="sm" className="pill px-5">
              LB
            </Button>
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-primary mb-2">{weight}</div>
            <div className="text-muted-foreground">{unit}</div>
          </div>

          <input
            type="range"
            min={unit === "kg" ? "30" : "66"}
            max={unit === "kg" ? "200" : "440"}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-primary"
          />

          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{unit === "kg" ? "30" : "66"}</span>
            <span>{unit === "kg" ? "200" : "440"}</span>
          </div>
        </div>

        <Button onClick={handleContinue} className="w-full pill h-12 text-base" size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default WeightSelection;
