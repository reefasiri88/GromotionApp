import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Zap, Clock, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const ARMode = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(5);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const isNativePlatform = Capacitor.isNativePlatform();

  // Initialize camera for real AR experience
  const initializeCamera = async () => {
    try {
      // For native platform (APK), try Capacitor Camera first
      if (isNativePlatform) {
        try {
          // Capacitor camera approach - take a video stream (if supported)
          // Note: Capacitor camera is primarily for photos, so we'll use getUserMedia
          // but we'll handle it in a way that's safe for the native WebView
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
          
          if (videoRef.current && stream) {
            cameraStreamRef.current = stream;
            videoRef.current.srcObject = stream;
            videoRef.current.playsInline = true;
            videoRef.current.muted = true;
            await videoRef.current.play();
            setIsCameraReady(true);
          }
        } catch (capacitorError) {
          console.warn('Capacitor camera approach failed, trying standard getUserMedia:', capacitorError);
          throw capacitorError; // Will be caught by outer catch
        }
      } else {
        // For web platform, use standard getUserMedia with proper error handling
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
          
          if (videoRef.current && stream) {
            cameraStreamRef.current = stream;
            videoRef.current.srcObject = stream;
            videoRef.current.playsInline = true;
            videoRef.current.muted = true;
            await videoRef.current.play();
            setIsCameraReady(true);
          }
        } else {
          throw new Error('Camera not supported in this browser');
        }
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      setCameraError('Camera not available - using simulated AR view');
      setIsCameraReady(false);
      // Fall back to gradient background
    }
  };

  // Cleanup camera on unmount
  const cleanupCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  };

  useEffect(() => {
    // Initialize camera when component mounts
    initializeCamera();

    return () => {
      cleanupCamera();
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    // Simulate coin collection
    const coinTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        setCoinsCollected((c) => c + 1);
        setEnergy((e) => Number((e + 0.05).toFixed(2)));
        toast.success("Coin collected! +0.05 kWh");
      }
    }, 3000);

    // Simulate distance decrease
    const distanceTimer = setInterval(() => {
      setDistance((d) => Math.max(0, d - 0.1));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(coinTimer);
      clearInterval(distanceTimer);
    };
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStop = () => {
    setIsActive(false);
    cleanupCamera();
    toast.success("Great workout! Energy saved to your profile.");
    setTimeout(() => navigate("/app"), 2000);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Camera Background - Real AR */}
      {isCameraReady ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
      ) : (
        /* Fallback Gradient Background */
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 opacity-80" />
      )}
      
      {/* Camera Error Message */}
      {cameraError && (
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="bg-yellow-500/90 text-black px-3 py-2 rounded-lg text-sm font-medium">
            {cameraError}
          </div>
        </div>
      )}
      
      {/* AR Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Stats Bar */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStop}
            className="text-white"
          >
            <X className="w-6 h-6" />
          </Button>
          
          <div className="flex gap-4 text-white text-sm">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-bold">{coinsCollected}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary">{energy} kWh</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(time)}</span>
            </div>
          </div>
        </div>

        {/* Center Area - AR Path & Coins */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Green AR Path - Enhanced with perspective */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-96 bg-gradient-to-t from-primary/60 to-transparent rounded-t-full"
            style={{
              transform: 'perspective(1000px) rotateX(45deg)',
              filter: isCameraReady ? 'blur(1px) drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' : 'blur(2px)',
              opacity: isCameraReady ? 0.8 : 0.6,
            }}
          />
          
          {/* Direction Arrow - Enhanced AR Style */}
          <div 
            className="mb-32 animate-bounce-coin"
            style={{
              filter: isCameraReady ? 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.8))' : 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))',
              transform: 'perspective(1000px) rotateX(-10deg)',
            }}
          >
            <ArrowUp className="w-12 h-12 text-primary" strokeWidth={3} />
          </div>

          {/* Floating Coins - Enhanced AR Style */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce-coin"
              style={{
                left: `${30 + i * 20}%`,
                bottom: `${20 + i * 15}%`,
                animationDelay: `${i * 0.3}s`,
                transform: `perspective(1000px) rotateX(${10 + i * 5}deg)`,
                filter: isCameraReady ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
            >
              <div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center"
                style={{
                  boxShadow: isCameraReady 
                    ? '0 0 20px rgba(251, 191, 36, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.3)'
                    : '0 0 10px rgba(251, 191, 36, 0.4)',
                }}
              >
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info Card */}
        <Card className="m-4 bg-black/70 backdrop-blur-md border-primary/20 p-4">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-primary mb-1">
              {distance.toFixed(1)}m
            </div>
            <div className="text-sm text-white/70">Distance to next checkpoint</div>
          </div>
          
          <div className="flex justify-around text-sm">
            <div className="text-center">
              <div className="text-white/70 mb-1">Steps</div>
              <div className="font-bold text-white">{time * 2}</div>
            </div>
            <div className="text-center">
              <div className="text-white/70 mb-1">Calories</div>
              <div className="font-bold text-white">{Math.floor(time * 0.1)}</div>
            </div>
            <div className="text-center">
              <div className="text-white/70 mb-1">CO₂ Saved</div>
              <div className="font-bold text-white">{(energy * 0.5).toFixed(2)} kg</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ARMode;
