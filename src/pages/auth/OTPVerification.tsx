import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter complete code");
      return;
    }
    
    toast.success("Password reset link sent!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-hero flex flex-col p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/forgot-password")}
        className="self-start mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">OTP Verification</h1>
        <p className="text-white/80 mb-8">
          We sent a 6-digit code to your email
        </p>

        <div className="flex gap-3 justify-center mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-12 h-14 text-center text-xl font-semibold bg-card border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
            />
          ))}
        </div>

        <Button onClick={handleVerify} className="w-full pill h-12 text-base">
          Verify
        </Button>

        <Button variant="link" className="mt-4 text-white/80">
          Resend code
        </Button>
      </div>
    </div>
  );
};

export default OTPVerification;
