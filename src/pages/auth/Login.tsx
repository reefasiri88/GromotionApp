import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    localStorage.setItem("isAuthenticated", "true");
    const hasSetup = localStorage.getItem("hasCompletedSetup") === "true";
    
    toast.success("Welcome back!");
    navigate(hasSetup ? "/app" : "/setup/gender");
  };

  return (
    <div className="min-h-screen bg-hero flex flex-col p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/welcome")}
        className="self-start mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">Welcome back! Glad to see you, Again!</h1>
        <p className="text-white/80 mb-8">Enter your email and password</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-0 pill h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-0 pill h-12"
            />
          </div>

          <div className="flex justify-end">
            <Button variant="link" className="px-0 text-white/80" onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </Button>
          </div>

          <Button onClick={handleLogin} className="w-full pill h-12 text-base">
            Sign In
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="px-1 text-primary"
              onClick={() => navigate("/register")}
            >
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
