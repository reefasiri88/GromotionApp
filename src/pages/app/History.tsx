import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fakeHistoryFull } from "@/services/fakeData";

const History = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "demo-user";
  const [items, setItems] = useState<any[]>([]);
  const totalDistance = `${items.reduce((a, b) => a + (b.distanceKm || 0), 0).toFixed(1)} km`;
  const totalTime = "—";
  const avgBpm = Math.round(items.reduce((a, b) => a + (b.bpm || 0), 0) / (items.length || 1));

  useEffect(() => {
    setItems(fakeHistoryFull);
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-dark p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Activity History</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card p-4 text-center shadow-card">
          <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
          <div className="text-lg font-bold">{totalTime}</div>
          <div className="text-xs text-muted-foreground">Total Time</div>
        </Card>
        
        <Card className="bg-card p-4 text-center shadow-card">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
          <div className="text-lg font-bold">{totalDistance}</div>
          <div className="text-xs text-muted-foreground">Distance</div>
        </Card>
        
        <Card className="bg-card p-4 text-center shadow-card">
          <Heart className="w-5 h-5 text-primary mx-auto mb-2" />
          <div className="text-lg font-bold">{avgBpm}</div>
          <div className="text-xs text-muted-foreground">Avg BPM</div>
        </Card>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {items.map((activity, index) => (
          <Card key={index} className="bg-card p-4 shadow-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-lg">{activity.date || new Date(activity.timestamp?.toDate?.() || Date.now()).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">{activity.time || ""}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">{(activity.distanceKm || 0).toFixed(1)} km</div>
                <div className="text-sm text-muted-foreground">{activity.bpm || 0} bpm</div>
              </div>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Calories: </span>
                <span className="font-medium">{activity.kcal || 0} kcal</span>
              </div>
              <div>
                <span className="text-muted-foreground">Steps: </span>
                <span className="font-medium">{(activity.steps || 0).toLocaleString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default History;
