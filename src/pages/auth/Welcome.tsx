import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import logo from "@/assets/icon/Gromotion logo.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero flex flex-col items-center justify-between p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary/15 shadow-glow mb-8">
          <Zap className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-center mb-3">Power Up Your Walk!</h1>
        <p className="text-white/80 text-center max-w-sm mb-12">Turn your steps into clean, shared energy.</p>
      </div>
      <div className="w-full space-y-4">
        <Button onClick={() => navigate("/login")} className="w-full pill h-12 text-base">
          Login
        </Button>
        <Button onClick={() => navigate("/register")} variant="outline" className="w-full pill h-12 text-base">
          Register
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
