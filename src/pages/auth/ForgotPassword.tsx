import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    toast.success("Verification code sent to your email");
    navigate("/otp");
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
        <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
        <p className="text-white/80 mb-8">
          Enter your email and we'll send you a verification code
        </p>

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

          <Button onClick={handleSubmit} className="w-full mt-6 pill h-12 text-base">
            Send Code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
