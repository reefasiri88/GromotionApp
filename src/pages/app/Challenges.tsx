import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, Clock, Users, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { fakeChallenges } from "@/services/fakeData";

const useChallenges = () => {
  const [items, setItems] = useState<any[]>(fakeChallenges);
  useEffect(() => {
    setItems(fakeChallenges);
  }, []);
  return items;
};

const Challenges = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-dark p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Challenges</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/app/leaderboard")}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Leaderboard
        </Button>
      </div>

      <div className="space-y-4">
        {useChallenges().map((challenge) => (
          <Card key={challenge.id} className="bg-card overflow-hidden shadow-card">
            <div className="h-40 p-4 flex items-end bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(${challenge.image})` }}>
              <div className="w-full">
                <div className="text-white/70 text-sm">{challenge.day || ""}, {challenge.date || ""}</div>
                <h3 className="text-xl font-bold text-white drop-shadow-lg">{challenge.title}</h3>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{challenge.timeLeft || ""} left</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{challenge.participants || 0} joined</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Reward</div>
                  <div className="text-lg font-bold text-primary">
                    {challenge.reward}
                  </div>
                </div>
                <Button className="pill px-6">Join</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Challenges;
