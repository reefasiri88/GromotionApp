import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Trophy, Map, Flag, User } from "lucide-react";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: "/app", icon: Home, label: "Home" },
    { path: "/app/map", icon: Map, label: "Map/AR" },
    { path: "/app/challenges", icon: Flag, label: "Challenges" },
    { path: "/app/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/app/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0">
        <div className="max-w-md mx-auto mb-3 px-4">
          <div className="bg-white/10 backdrop-blur rounded-3xl shadow-xl flex justify-around items-center h-14 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    active ? "bg-primary/20 text-primary ring-2 ring-primary/40" : "bg-white/10 text-white/80"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
