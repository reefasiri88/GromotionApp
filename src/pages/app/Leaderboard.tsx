import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { fakeLeaderboard } from "@/services/fakeData";

const LeaderboardData = () => {
  const [users, setUsers] = useState<any[]>(fakeLeaderboard);
  useEffect(() => {
    setUsers(fakeLeaderboard);
  }, []);
  const topThree = users.slice(0, 3);
  const otherRanks = users.slice(3).map((u, i) => ({
    rank: u.rank ?? i + 4,
    name: u.name || "User",
    points: u.points || 0,
    badge: u.badge || null,
    avatar: (u.name || "U").split(" ").map((n: string) => n[0]).join("")
  }));
  return { topThree, otherRanks };
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const { topThree, otherRanks } = LeaderboardData();

  const getBadgeIcon = (badge: string | null, rank?: number) => {
    const r = badge ? { gold: 1, silver: 2, bronze: 3 }[badge] : rank;
    switch (r) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-8">
        {/* Second Place */}
        <Card className="bg-card p-4 text-center w-24 shadow-card">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mx-auto mb-2 text-white font-bold">
            {topThree[1]?.avatar || ""}
          </div>
            <div className="text-xs font-medium mb-1 truncate">{(topThree[1]?.name || "").split(" ")[0]}</div>
          {getBadgeIcon((topThree[1] as any)?.badge ?? null, 2)}
            <div className="text-xs text-primary font-bold">{topThree[1]?.points || 0}</div>
        </Card>

        {/* First Place */}
        <Card className="bg-gradient-primary p-4 text-center w-28 shadow-glow -mb-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-2 text-primary font-bold text-lg">
            {topThree[0]?.avatar || ""}
          </div>
            <div className="text-sm font-medium mb-1 truncate text-white">{(topThree[0]?.name || "").split(" ")[0]}</div>
          {getBadgeIcon((topThree[0] as any)?.badge ?? null, 1)}
            <div className="text-sm text-white font-bold">{topThree[0]?.points || 0}</div>
        </Card>

        {/* Third Place */}
        <Card className="bg-card p-4 text-center w-24 shadow-card">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center mx-auto mb-2 text-white font-bold">
            {topThree[2]?.avatar || ""}
          </div>
            <div className="text-xs font-medium mb-1 truncate">{(topThree[2]?.name || "").split(" ")[0]}</div>
          {getBadgeIcon((topThree[2] as any)?.badge ?? null, 3)}
            <div className="text-xs text-primary font-bold">{topThree[2]?.points || 0}</div>
        </Card>
      </div>

      {/* Rest of Rankings */}
      <div className="space-y-2">
        {otherRanks.map((user) => (
          <Card key={user.rank} className="p-4 flex items-center gap-4 shadow-card bg-card">
            <div className="w-10 text-center font-bold text-muted-foreground">
              #{user.rank}
            </div>
            
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-muted text-foreground">
              {user.avatar}
            </div>
            
            <div className="flex-1">
              <div className="font-medium">
                {user.name}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-primary">{user.points}</div>
              <div className="text-xs text-muted-foreground">points</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
