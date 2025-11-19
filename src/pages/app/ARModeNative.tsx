import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { AR } from '@/plugins/ARPlugin';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Zap, 
  Target, 
  Trophy, 
  X,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface Coin {
  anchorId: string;
  position: { x: number; y: number; z: number };
  collected: boolean;
  screenX?: number;
  screenY?: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  points: number;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: "What is the primary benefit of walking for energy generation?",
    options: ["Reduces carbon footprint", "Increases muscle mass", "Improves sleep", "Burns calories"],
    correct: 0,
    points: 100
  },
  {
    question: "How does kinetic energy harvesting work?",
    options: ["Solar panels", "Piezoelectric materials", "Wind turbines", "Battery storage"],
    correct: 1,
    points: 150
  },
  {
    question: "What's the most efficient walking speed for energy generation?",
    options: ["2 mph", "3 mph", "4 mph", "5 mph"],
    correct: 2,
    points: 200
  }
];

export default function ARModeNative() {
  const navigate = useNavigate();
  const [isARActive, setIsARActive] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [score, setScore] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [arError, setArError] = useState<string | null>(null);
  
  const arRef = useRef<any>(null);
  const frameCallbackRef = useRef<string | null>(null);
  const sessionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize AR
  const initializeAR = useCallback(async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        setArError('Native AR is only available on mobile devices');
        return;
      }

      // Attach AR view behind WebView
      await AR.attachViewBehindWebView();
      
      // Start AR session
      await AR.startSession();
      
      // Spawn coins in AR space
      await spawnCoins();
      
      setIsARActive(true);
      setIsSessionRunning(true);
      setArError(null);
      
      // Start frame updates
      startFrameUpdates();
      
      // Start session timer
      startSessionTimer();
      
      toast.success('AR session started successfully!');
    } catch (error) {
      console.error('AR initialization failed:', error);
      setArError('Failed to initialize AR: ' + (error as Error).message);
      toast.error('AR initialization failed');
    }
  }, []);

  // Spawn coins in AR space
  const spawnCoins = async () => {
    try {
      const positions: { x: number; y: number; z: number }[] = Array.from({ length: 20 }, (_, i) => ({ 
        x: (Math.random() - 0.5) * 4, 
        y: -0.5, 
        z: -(1.5 * (i + 1)) 
      }));
      
      const newCoins: Coin[] = [];
      
      for (const pos of positions) {
        const result = await AR.addAnchor({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          attachToPlane: true
        });
        
        newCoins.push({
          anchorId: result.anchorId,
          position: pos,
          collected: false
        });
      }
      
      setCoins(newCoins);
    } catch (error) {
      console.error('Failed to spawn coins:', error);
      toast.error('Failed to spawn coins');
    }
  };

  // Start frame updates for AR tracking
  const startFrameUpdates = async () => {
    try {
      const result = await AR.onFrame();
      frameCallbackRef.current = result.callbackId;
      
      // Update coin positions based on camera movement
      updateCoinPositions();
    } catch (error) {
      console.error('Failed to start frame updates:', error);
    }
  };

  // Update coin positions on screen
  const updateCoinPositions = async () => {
    if (!isARActive || coins.length === 0) return;
    
    try {
      // Get camera pose for distance calculations
      const cameraPose = await AR.getCameraPose();
      const cameraPos = cameraPose.position;
      
      // Update each coin's screen position and check collection
      const updatedCoins = coins.map(coin => {
        if (coin.collected) return coin;
        
        // Calculate distance from camera to coin
        const distance = Math.sqrt(
          Math.pow(cameraPos[0] - coin.position.x, 2) +
          Math.pow(cameraPos[1] - coin.position.y, 2) +
          Math.pow(cameraPos[2] - coin.position.z, 2)
        );
        
        // Check if coin should be collected (within 0.4m radius)
        if (distance < 0.4) {
          collectCoin(coin);
          return { ...coin, collected: true };
        }
        
        return coin;
      });
      
      setCoins(updatedCoins);
    } catch (error) {
      console.error('Failed to update coin positions:', error);
    }
  };

  // Collect coin
  const collectCoin = async (coin: Coin) => {
    try {
      // Remove anchor from AR
      await AR.removeAnchor({ anchorId: coin.anchorId });
      
      // Update score
      setScore(prev => prev + 10);
      
      // Show collection animation
      toast.success('Coin collected! +10 points');
      
      // Check if it's time for a quiz (every 4 coins)
      const collectedCount = coins.filter(c => c.collected).length + 1;
      if (collectedCount % 4 === 0) {
        triggerQuiz();
      }
    } catch (error) {
      console.error('Failed to collect coin:', error);
    }
  };

  // Trigger quiz
  const triggerQuiz = () => {
    const randomQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setShowQuiz(true);
    setIsSessionRunning(false); // Pause AR session during quiz
  };

  // Handle quiz answer
  const handleQuizAnswer = (selectedOption: number) => {
    if (!currentQuestion) return;
    
    const isCorrect = selectedOption === currentQuestion.correct;
    
    if (isCorrect) {
      setQuizScore(prev => prev + currentQuestion.points);
      setScore(prev => prev + currentQuestion.points);
      toast.success(`Correct! +${currentQuestion.points} points`);
    } else {
      toast.error('Incorrect answer');
    }
    
    setShowQuiz(false);
    setIsSessionRunning(true); // Resume AR session
  };

  // Start session timer
  const startSessionTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  // Stop AR session
  const stopARSession = async () => {
    try {
      setIsARActive(false);
      setIsSessionRunning(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (frameCallbackRef.current) {
        await AR.removeFrameCallback({ callbackId: frameCallbackRef.current });
      }
      
      // Remove all anchors
      for (const coin of coins) {
        if (!coin.collected) {
          await AR.removeAnchor({ anchorId: coin.anchorId });
        }
      }
      
      await AR.stopSession();
      
      toast.success('AR session ended');
      
      // Show final results
      const totalScore = score + quizScore;
      toast.success(`Session completed! Total score: ${totalScore} points`);
      
    } catch (error) {
      console.error('Failed to stop AR session:', error);
    }
  };

  // Format session time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (isARActive) {
        stopARSession();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* AR Camera View - Behind WebView */}
      <div className="absolute inset-0 bg-black">
        {/* AR content will be rendered in the native AR container */}
      </div>

      {/* Main AR UI */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/app')}
              className="pointer-events-auto p-2 bg-black/50 rounded-full text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">{score + quizScore}</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full">
                <Target className="w-4 h-4" />
                <span>{coins.filter(c => c.collected).length}/{coins.length}</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>{formatTime(sessionTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-white/50 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white/70 rounded-full"></div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-center space-x-4">
            {!isARActive ? (
              <button
                onClick={initializeAR}
                className="pointer-events-auto flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full text-white font-semibold"
              >
                <Play className="w-5 h-5" />
                <span>Start AR Session</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsSessionRunning(!isSessionRunning)}
                  className="pointer-events-auto p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
                >
                  {isSessionRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={stopARSession}
                  className="pointer-events-auto p-3 bg-red-600 hover:bg-red-700 rounded-full text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* AR Error Message */}
        {arError && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white p-4 rounded-lg text-center">
            <p className="font-semibold">{arError}</p>
            <button
              onClick={() => setArError(null)}
              className="mt-2 px-4 py-2 bg-white/20 rounded hover:bg-white/30"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && currentQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-800">Energy Quiz!</h3>
                <p className="text-gray-600">Answer correctly for bonus points</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {currentQuestion.question}
                </h4>
                
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      className="w-full p-3 text-left bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p>Quiz Score: {quizScore} points</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}