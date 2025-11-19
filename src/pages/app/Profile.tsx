import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { fakeUserProfile, fakeEnergyTotals } from "@/services/fakeData";
import { User, Trophy, Zap, Settings, LogOut, History, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const userName = fakeUserProfile.name;
  const userEmail = fakeUserProfile.email;
  
  const stats = [
    { label: "Total Energy", value: `${fakeEnergyTotals.totalEnergyKwh} kWh`, icon: Zap },
    { label: "Total Points", value: `${fakeEnergyTotals.totalPoints}`, icon: Trophy },
    { label: "Activities", value: `${fakeEnergyTotals.activitiesCount}`, icon: History },
  ];

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/welcome");
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
          <User className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-1">{userName}</h1>
        <p className="text-muted-foreground">{userEmail}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card p-4 text-center shadow-card">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          size="lg"
          onClick={() => toast.info("Settings coming soon")}
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Button>

        <Button
          variant="destructive"
          className="w-full justify-start"
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </Button>
      </div>

      {/* Version Info */}
      <div className="text-center text-sm text-muted-foreground pt-8">
        GroMotion v1.0.0
      </div>
    </div>
  );
};

export default Profile;
