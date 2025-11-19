import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Zap, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

const Map = () => {
  const navigate = useNavigate();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const community = JSON.parse(localStorage.getItem("userCommunity") || "{}");

  const handleStartAR = () => {
    setShowStartDialog(false);
    navigate("/app/ar");
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Map Placeholder */}
      <div className="h-[60vh] bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MapPin className="w-16 h-16 mx-auto mb-2 text-primary" />
            <p className="text-sm">Map view will be displayed here</p>
            <p className="text-xs">GPS tracking enabled</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Community Card */}
        <Card className="bg-gradient-card p-4 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{community.name || "Your Community"}</h3>
              <p className="text-sm text-muted-foreground">
                {community.members || 0} members active
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <div>
              <Zap className="w-4 h-4 text-primary inline mr-1" />
              <span className="font-medium">{community.energy || "0 MWh"}</span>
            </div>
            <div className="text-muted-foreground">
              Generated this month
            </div>
          </div>
        </Card>

        {/* Start AR Button */}
        <Button
          onClick={() => setShowStartDialog(true)}
          className="w-full"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Start AR Mode
        </Button>
      </div>

      {/* Start Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Start generating energy!</DialogTitle>
            <DialogDescription>
              Walk or run to collect energy coins and contribute to your community's goals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Camera Access Required</div>
                <div className="text-sm text-muted-foreground">
                  To enable AR experience
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Location Tracking</div>
                <div className="text-sm text-muted-foreground">
                  To measure distance accurately
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowStartDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleStartAR} className="flex-1">
              Start Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Map;
