import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 9500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-hero relative flex flex-col items-center justify-center p-6">
      <div className="animate-fade-in text-center">
        <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-primary/15 shadow-glow">
          <Zap className="w-14 h-14 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl font-bold mt-8 tracking-tight">
          Gro<span className="text-primary">Motion</span>
        </h1>
        <p className="mt-3 text-base">Walk the Future</p>
      </div>
    </div>
  );
};

export default Splash;
