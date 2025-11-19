import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Zap, Leaf, Clock, TrendingUp, Heart, Settings, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fakeUserStats, fakeHistoryPreview } from "@/services/fakeData";
import step2 from "@/assets/onboarding/step2.jpg";

const Home = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "demo-user";
  const userName = localStorage.getItem("userName") || "Friend";
  const community = JSON.parse(localStorage.getItem("userCommunity") || "{}");
  const [statsState, setStatsState] = useState(fakeUserStats);
  const displaySteps = 2345;
  const displayGoal = 5000;
  const displayDate = "26 May";
  const displayTimer = "01:09:44";
  const progress = (displaySteps / displayGoal) * 100;

  const stats = [
    { icon: Zap, label: "Energy Generated", value: "0.94", unit: "kWh", color: "text-primary" },
    { icon: Leaf, label: "CO₂ Reduced", value: "0.028", unit: "kg", color: "text-green-400" },
    { icon: Zap, label: "Earned Points", value: "300", unit: "", color: "text-yellow-400" },
    { icon: Flame, label: "Calorie", value: "230", unit: "kcal", color: "text-orange-500" },
  ];

  const [historySummary, setHistorySummary] = useState({ totalTime: "—", distance: "0 km", bpm: 0 });
  const [historyPreview, setHistoryPreview] = useState<{ date: string; distanceKm: number; kcal: number; steps: number }[]>([]);

  useEffect(() => {
    setStatsState(fakeUserStats);
    setHistoryPreview(fakeHistoryPreview.map((i) => ({ date: i.date, distanceKm: i.distanceKm, kcal: i.kcal, steps: i.steps })));
    const totalKm = fakeHistoryPreview.reduce((a, b) => a + (b.distanceKm || 0), 0).toFixed(1);
    setHistorySummary({ totalTime: "—", distance: `${totalKm} km`, bpm: 0 });
  }, [userId]);

  return (
    <div className="min-h-screen bg-hero p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
            <img src={step2} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-white text-lg font-semibold">Hello {userName} !</div>
            <div className="text-white/70 text-xs">{community?.name || "Your Community"}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Progress Circle */}
      <Card className="rounded-2xl p-4 shadow-xl border border-white/10 bg-gradient-to-br from-emerald-700/40 to-green-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-white text-xs">{displayDate}</div>
              <div className="text-white text-sm font-semibold">Today</div>
              <div className="text-white/80 text-xs">{displayTimer}</div>
            </div>
          </div>
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.15)" strokeWidth="10" fill="none" />
              <circle
                cx="56"
                cy="56"
                r="50"
                stroke="#00C675"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-sm font-semibold">{displaySteps}</div>
            </div>
            <div className="absolute -top-2 right-0 text-white/80 text-[10px]">
              {displaySteps} / {displayGoal} steps
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-2xl p-4 border border-white/10 bg-emerald-900/20 backdrop-blur shadow-xl">
              <div className="text-white/80 text-xs mb-1 drop-shadow">{stat.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-white drop-shadow">{stat.value}<span className="text-xs ml-1 text-white/80">{stat.unit}</span></div>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl overflow-hidden border border-white/10 shadow-card">
        <div className="relative h-32">
          <img src={step2} alt="challenge" className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />
          <div className="absolute inset-0 p-4 flex items-end justify-between">
            <div>
              <div className="text-white text-sm">Community challenge</div>
              <div className="text-white text-lg font-semibold">Light up the park!</div>
            </div>
            <Button variant="secondary" className="rounded-full bg-white/80 text-black text-xs px-3 py-1">
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white/90 text-base">History</h2>
          <Button variant="link" className="px-0 text-white/80" onClick={() => navigate("/app/history")}>See All</Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/5 backdrop-blur p-4 text-center shadow-card border border-white/10">
            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-base font-bold text-white">{historySummary.totalTime}</div>
            <div className="text-xs text-white/70">Total Time</div>
          </Card>
          <Card className="bg-white/5 backdrop-blur p-4 text-center shadow-card border border-white/10">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-base font-bold text-white">{historySummary.distance}</div>
            <div className="text-xs text-white/70">Distance</div>
          </Card>
          <Card className="bg-white/5 backdrop-blur p-4 text-center shadow-card border border-white/10">
            <Heart className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-base font-bold text-white">{historySummary.bpm}</div>
            <div className="text-xs text-white/70">Heart Beat</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
