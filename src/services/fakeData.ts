import step0 from "@/assets/onboarding/step0.jpg";
import step1 from "@/assets/onboarding/step1.jpg";
import step2 from "@/assets/onboarding/step2.jpg";

export const fakeUserProfile = {
  id: "demo-user",
  name: "Gromotion User",
  email: "GromotionUser@gromotion.app",
  community: "Roshn Community",
};

export const fakeUserStats = {
  todaySteps: 4321,
  goalSteps: 6000,
  calories: 215,
  points: 1280,
  energyKwh: 1.1,
  co2SavedKg: 0.58,
};

export const fakeEnergyTotals = {
  totalEnergyKwh: 12.4,
  totalPoints: 3450,
  activitiesCount: 47,
};

export const fakeLeaderboard = [
  { id: "u1", name: "subhia", points: 5120, badge: "gold", rank: 1 },
  { id: "u2", name: "retaj", points: 4710, badge: "silver", rank: 2 },
  { id: "u3", name: "reef", points: 4365, badge: "bronze", rank: 3 },
  { id: "u4", name: "Danial", points: 3980, badge: null, rank: 4 },
  { id: "u5", name: "fai", points: 3725, badge: null, rank: 5 },
  { id: "u6", name: "Bader", points: 3510, badge: null, rank: 6 },
];

export const fakeChallenges = [
  {
    id: "c1",
    title: "Energy Hour – Walk Together for Light",
    description: "Morning boost with community.",
    day: "Mon",
    time: "07:00",
    date: "2025-11-21",
    image: step0,
    participants: 128,
    reward: "+150 pts",
    timeLeft: "2 days",
  },
  {
    id: "c2",
    title: "Sunset Steps – Evening Energy Walk",
    description: "Fast-paced sprint along green path.",
    day: "Tue",
    time: "18:00",
    date: "2025-11-24",
    image: step1,
    participants: 96,
    reward: "+200 pts",
    timeLeft: "5 days",
  },
  {
    id: "c3",
    title: "Green Friday – Community Sustainability",
    description: "Join neighbors for an evening walk.",
    day: "Fri",
    time: "20:00",
    date: "2025-12-3",
    image: step2,
    participants: 142,
    reward: "+180 pts",
    timeLeft: "1 week",
  },
];

export const fakeHistoryPreview = [
  { date: "2025-11-16", distanceKm: 2.4, kcal: 180, steps: 3200 },
  { date: "2025-11-17", distanceKm: 3.1, kcal: 220, steps: 4100 },
  { date: "2025-11-18", distanceKm: 1.8, kcal: 140, steps: 2500 },
];

export const fakeHistoryFull = [
  { date: "2025-11-10", distanceKm: 2.0, kcal: 160, steps: 2800, bpm: 92, time: "28m" },
  { date: "2025-11-11", distanceKm: 3.2, kcal: 240, steps: 4300, bpm: 96, time: "41m" },
  { date: "2025-11-12", distanceKm: 1.5, kcal: 120, steps: 2100, bpm: 88, time: "22m" },
  { date: "2025-11-13", distanceKm: 2.8, kcal: 210, steps: 3600, bpm: 94, time: "35m" },
  { date: "2025-11-14", distanceKm: 3.7, kcal: 270, steps: 4900, bpm: 98, time: "46m" },
  { date: "2025-11-15", distanceKm: 2.3, kcal: 175, steps: 3100, bpm: 91, time: "30m" },
  { date: "2025-11-16", distanceKm: 2.4, kcal: 180, steps: 3200, bpm: 92, time: "31m" },
  { date: "2025-11-17", distanceKm: 3.1, kcal: 220, steps: 4100, bpm: 95, time: "40m" },
  { date: "2025-11-18", distanceKm: 1.8, kcal: 140, steps: 2500, bpm: 89, time: "24m" },
];