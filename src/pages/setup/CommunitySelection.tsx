import { useState } from "react";
import { useNavigate } from "react-router-dom";

const communities = ["Sedra", "Warefa", "Alarous", "Almanar", "Aldanah"];

const CommunitySelection = () => {

  const navigate = useNavigate();
  const [selected, setSelected] = useState("");

  const handleSelect = (name: string) => {
    setSelected(name);
    const community = { name, members: 0, energy: "0 MWh" };
    localStorage.setItem("userCommunity", JSON.stringify(community));
    localStorage.setItem("hasCompletedSetup", "true");
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-hero flex flex-col items-center p-6">
      <h1
        className="text-xl font-bold text-center"
        style={{ color: "#fff", marginTop: 40, marginBottom: 45 }}
      >
        Which ROSHN Community Do You Call Home ?
      </h1>
      <div className="w-full flex flex-col items-center">
        {communities.map((name) => {
          const isSelected = selected === name;
          return (
            <button
              key={name}
              onClick={() => handleSelect(name)}
              style={{
                width: "90%",
                height: 65,
                backgroundColor: isSelected ? "#072D21" : "#1A1A1A",
                borderWidth: isSelected ? 2.5 : 1.5,
                borderColor: isSelected ? "#00C675" : "#2E2E2E",
                borderRadius: 40,
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                marginBottom: 16,
                boxShadow: isSelected ? "0 0 10px rgba(0,198,117,0.35)" : "none",
              }}
            >
              <span style={{ color: "#fff" }}>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CommunitySelection;

