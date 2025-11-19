import step0 from "@/assets/onboarding/step0.jpg";
import step1 from "@/assets/onboarding/step1.jpg";
import step2 from "@/assets/onboarding/step2.jpg";
import step4 from "@/assets/onboarding/step4.jpg";

const rnd = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1));
const rfloat = (min: number, max: number, decimals = 1) => +((min + Math.random() * (max - min)).toFixed(decimals));

export const fakeUsers = Array.from({ length: 10 }, (_, i) => {
  const stepsToday = rnd(2000, 10000);
  const stepsTotal = rnd(50000, 300000);
  const coins = rnd(40, 200);
  const energyGenerated = rfloat(0.5, 5.0, 2);
  const co2Saved = rfloat(0.1, 3.0, 2);
  return {
    id: i === 0 ? "demo-user" : `user-${i + 1}`,
    name: i === 0 ? "Friend" : `User ${i + 1}`,
    stepsToday,
    stepsTotal,
    coins,
    energyGenerated,
    co2Saved,
    rank: i + 1,
    community: "Roshn Community",
    profileImage: step0,
    calories: Math.round(stepsToday * 0.05),
    points: coins * 10,
    energyKwh: energyGenerated,
    co2SavedKg: co2Saved,
    goalSteps: 5000,
  };
});

export const fakeCommunity = {
  name: "Roshn Community",
  members: rnd(120, 350),
  energy: `${rnd(10, 40)} MWh`,
};

const dateDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export const fakeStepsHistory = Array.from({ length: 7 }, (_, i) => {
  const date = dateDaysAgo(6 - i);
  const steps = rnd(2000, 10000);
  const distanceKm = +(steps * 0.0008).toFixed(1);
  const kcal = Math.round(steps * 0.05);
  const energy = +(steps * 0.00005).toFixed(2);
  return {
    date: date.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
    steps,
    distanceKm,
    kcal,
    energy,
    points: Math.round(steps / 50),
    bpm: rnd(70, 150),
    timestamp: date,
  };
});

export const fakeChallenges = [
  { id: "c1", title: "Weekend Energy Sprint", description: "Sprint to boost your energy credits.", day: "Sat", time: "16:00", image: step1, participants: rnd(30, 160), reward: "+250 pts", timeLeft: "2 days" },
  { id: "c2", title: "Green Mile Walk", description: "Walk a mile for the planet.", day: "Sun", time: "09:00", image: step2, participants: rnd(30, 160), reward: "+150 pts", timeLeft: "1 day" },
  { id: "c3", title: "Sunset Power Run", description: "Evening run to generate power.", day: "Fri", time: "18:30", image: step4, participants: rnd(30, 160), reward: "+300 pts", timeLeft: "5 hours" },
  { id: "c4", title: "Footprint Zero Day", description: "Aim for zero footprint activities.", day: "Mon", time: "12:00", image: step1, participants: rnd(30, 160), reward: "+200 pts", timeLeft: "3 days" },
  { id: "c5", title: "Family Energy Boost", description: "Family-friendly energy activities.", day: "Wed", time: "15:00", image: step2, participants: rnd(30, 160), reward: "+180 pts", timeLeft: "1 week" },
];

export const fakeLeaderboard = fakeUsers.map((u, idx) => ({
  id: u.id,
  name: u.name,
  points: u.coins * 10 + Math.round(u.energyGenerated * 100),
  rank: idx + 1,
  badge: idx === 0 ? "gold" : idx === 1 ? "silver" : idx === 2 ? "bronze" : null,
  stepsTotal: u.stepsTotal,
  energyTotal: u.energyGenerated,
})).sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));

export const fakeArSessions = Array.from({ length: 5 }, () => ({
  userId: "demo-user",
  distance: rnd(300, 2500),
  coinsCollected: rnd(5, 40),
  energyGenerated: rfloat(0.05, 0.45, 2),
  duration: rnd(300, 3600),
  timestamp: new Date(dateDaysAgo(rnd(0, 10))).toISOString(),
}));

export const getUserStats = (userId: string) => {
  const u = fakeUsers.find((x) => x.id === userId) || fakeUsers[0];
  return {
    calories: u.calories,
    points: u.points,
    energyKwh: u.energyKwh,
    co2SavedKg: u.co2SavedKg,
    todaySteps: u.stepsToday,
    goalSteps: u.goalSteps,
  };
};