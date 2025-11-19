import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, Play, X, Clock, ArrowUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { logArSession } from "@/services/db";
import { arEngine, ARConfig, ARPath, ARCoin } from "@/native/AREngine";
import { mapViewEngine, MapConfig, MapRoute, MapPoint } from "@/native/MapView";

const MapAR = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"map" | "ar">("map");
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [energy, setEnergy] = useState(0.0);
  const [time, setTime] = useState(0); // seconds
  const [distance, setDistance] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizAnswer, setQuizAnswer] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const arContainerRef = useRef<HTMLDivElement>(null);
  const community = JSON.parse(localStorage.getItem("userCommunity") || "{}");
  const userId = localStorage.getItem("userId") || "demo-user";

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Initialize native modules
  useEffect(() => {
    const initializeModules = async () => {
      // Initialize MapView
      const mapConfig: MapConfig = {
        center: { latitude: 0, longitude: 0 },
        zoom: 16,
        showUserLocation: true,
        showCompass: true,
        showScale: true
      };
      await mapViewEngine.initialize(mapConfig);

      // Initialize AR Engine
      const arConfig: ARConfig = {
        enableCamera: true,
        enableLocation: true,
        enablePlaneDetection: true,
        enableHitTesting: true
      };
      await arEngine.initialize(arConfig);

      // Set up AR callbacks
      arEngine.onCoinCollected((coin: ARCoin) => {
        setCoinsCollected(prev => prev + 1);
        setEnergy(prev => prev + 0.1); // Each coin gives 0.1 kWh
      });

      arEngine.onQuizTriggered(() => {
        showQuizPopup();
      });
    };

    initializeModules();

    return () => {
      arEngine.stopARSession();
      mapViewEngine.destroy();
    };
  }, []);

  // Update map when view changes
  useEffect(() => {
    if (view === "map" && mapContainerRef.current) {
      mapViewEngine.renderMap(mapContainerRef.current);
      
      // Add community route
      const userLocation = mapViewEngine.getUserLocation();
      if (userLocation) {
        const route: MapRoute = {
          points: [
            userLocation,
            { latitude: userLocation.latitude + 0.001, longitude: userLocation.longitude + 0.001 },
            { latitude: userLocation.latitude + 0.002, longitude: userLocation.longitude + 0.002 }
          ],
          color: '#00ff00',
          width: 4
        };
        mapViewEngine.addRoute(route);
      }
    }
  }, [view]);

  // Timer for AR session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isARActive) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
        setDistance(prev => prev + 0.5); // 0.5 meters per second walking speed
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isARActive]);

  const showQuizPopup = () => {
    const questions = [
      { question: "What type of energy does walking generate?", answer: "Kinetic" },
      { question: "How many watts can a person generate while walking?", answer: "50-100" },
      { question: "What is the most efficient way to harvest energy from walking?", answer: "Piezoelectric" }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setQuizQuestion(randomQuestion.question);
    setQuizAnswer(randomQuestion.answer);
    setShowQuiz(true);
  };

  const handleQuizAnswer = (userAnswer: string) => {
    setShowQuiz(false);
    if (userAnswer.toLowerCase() === quizAnswer.toLowerCase()) {
      // Correct answer - add bonus points
      setCoinsCollected(prev => prev + 2);
      setEnergy(prev => prev + 0.2);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const startARSession = async () => {
    setShowStartDialog(false);
    setView("ar");
    setIsARActive(true);
    
    // Start AR session
    if (arContainerRef.current) {
      arEngine.startARSession(arContainerRef.current);
      
      // Set up AR path
      const arPath: ARPath = {
        points: [
          { x: -1, y: 0, z: -2 },
          { x: 0, y: 0, z: -5 },
          { x: 1, y: 0, z: -8 },
          { x: 0, y: 0, z: -12 }
        ],
        width: 2,
        color: '#00ff00'
      };
      arEngine.setARPath(arPath);
      
      // Spawn coins
      arEngine.spawnCoins(15, 2);
    }
    
    // Log AR session start
    await logArSession(userId, { 
      status: "started",
      timestamp: new Date().toISOString()
    });
  };

  const stopARSession = async () => {
    setIsARActive(false);
    arEngine.stopARSession();
    setView("map");
    
    // Log AR session end
    await logArSession(userId, { 
      status: "ended",
      coinsCollected,
      distance,
      energy,
      duration: time,
      timestamp: new Date().toISOString()
    });
  };

  const MapView = (
    <div className="min-h-screen bg-gradient-dark">
      <div className="flex items-center gap-4 p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Map / AR</h1>
      </div>
      <div ref={mapContainerRef} className="h-[60vh] bg-gradient-to-b from-gray-900 to-gray-800 relative rounded-3xl mx-4 overflow-hidden border border-gray-700">
        {/* Native MapView will be rendered here */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <Card className="glass px-6 py-3 pill text-white/90 backdrop-blur-md">
            <span className="font-bold text-lg">{distance} m</span>
          </Card>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Card className="bg-gradient-card p-4 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{community.name || "Your Community"}</h3>
              <p className="text-sm text-muted-foreground">{community.members || 0} members active</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <Zap className="w-4 h-4 text-primary inline mr-1" />
              <span className="font-medium">{community.energy || "0 MWh"}</span>
            </div>
            <div className="text-muted-foreground">Generated this month</div>
          </div>
        </Card>

        <div className="flex gap-3 px-2">
          
          <Button 
            onClick={() => navigate("/app/arnative")} 
            className="flex-1 pill h-14 text-base font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
          >
            <Play className="w-5 h-5 mr-2" /> Native AR
          </Button>
        </div>
      </div>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Start generating your community's energy</DialogTitle>
            <DialogDescription>Enable camera and location to start AR mode.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Camera access</div>
                <div className="text-sm text-muted-foreground">To enable AR experience</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Location tracking</div>
                <div className="text-sm text-muted-foreground">To measure distance accurately</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowStartDialog(false)}>Cancel</Button>
            <Button className="flex-1" onClick={startARSession}>Start Now</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const ARView = (
    <div ref={arContainerRef} className="min-h-screen bg-black relative overflow-hidden">
      {/* AR content will be rendered here by the native AR engine */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-6 bg-gradient-to-b from-black/70 to-transparent backdrop-blur-md">
          <Button variant="ghost" size="icon" onClick={stopARSession} className="text-white hover:bg-white/10">
            <X className="w-7 h-7" />
          </Button>
          <div className="flex gap-6 text-white text-sm">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              <span className="font-bold text-lg">{coinsCollected}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
              <span className="text-primary font-semibold">{energy.toFixed(2)} kWh</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-semibold">{formatTime(time)}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-96 bg-gradient-to-t from-primary/40 to-transparent rounded-t-full blur-xl" />
          <div className="mb-32 animate-bounce-coin">
            <ArrowUp className="w-14 h-14 text-primary drop-shadow-glow animate-pulse-glow" strokeWidth={3} />
          </div>
        </div>

        <Card className="m-6 bg-black/60 backdrop-blur-xl border-primary/30 p-6 rounded-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2 animate-pulse-glow">{distance}m</div>
            <div className="text-sm text-white/80 font-medium">Distance walked</div>
          </div>
          <div className="flex justify-around text-sm">
            <div className="text-center">
              <div className="text-white/70 mb-2 font-medium">Steps</div>
              <div className="font-bold text-white text-lg">{Math.floor(time * 1.8)}</div>
            </div>
            <div className="text-center">
              <div className="text-white/70 mb-2 font-medium">Calories</div>
              <div className="font-bold text-white text-lg">{Math.floor(time * 0.1)}</div>
            </div>
            <div className="text-center">
              <div className="text-white/70 mb-2 font-medium">CO₂ Saved</div>
              <div className="font-bold text-white text-lg">{(energy * 0.5).toFixed(2)} kg</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="flex justify-center gap-2 p-4 bg-card sticky top-0 z-20">
        <Button variant={view === "map" ? "default" : "outline"} className="pill" onClick={() => setView("map")}>Map</Button>
        <Button variant={view === "ar" ? "default" : "outline"} className="pill" onClick={() => setView("ar")}>AR</Button>
      </div>
      {view === "map" ? MapView : ARView}
      
      {/* Quiz Popup */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl rounded-3xl p-8 m-4 max-w-sm w-full border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Energy Quiz</h3>
              <p className="text-gray-600 text-center leading-relaxed">{quizQuestion}</p>
            </div>
            <div className="space-y-4">
              <Button 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-lg" 
                onClick={() => handleQuizAnswer("Kinetic")}
              >
                Kinetic Energy
              </Button>
              <Button 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg"
                onClick={() => handleQuizAnswer("Solar")}
              >
                Solar Energy
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl animate-bounce">🎉</div>
          </div>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl animate-pulse">
              +2 Bonus Points!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapAR;