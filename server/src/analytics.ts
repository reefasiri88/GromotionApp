import { Firestore } from "firebase-admin/firestore";

export async function computeDailyAnalytics(db: Firestore) {
  const stepsSnap = await db.collection("steps_history").get();
  const energySnap = await db.collection("energy_generated").get();
  const usersSnap = await db.collection("users").get();
  const communitiesSnap = await db.collection("community_locations").get();

  const userActivity: Record<string, { steps: number; sessions: number; energy: number }> = {};
  stepsSnap.forEach((d) => {
    const u = d.data().userId as string;
    userActivity[u] = userActivity[u] || { steps: 0, sessions: 0, energy: 0 };
    userActivity[u].steps += (d.data().steps as number) || 0;
    userActivity[u].sessions += 1;
  });
  energySnap.forEach((d) => {
    const u = d.data().userId as string;
    userActivity[u] = userActivity[u] || { steps: 0, sessions: 0, energy: 0 };
    userActivity[u].energy += (d.data().kwh as number) || 0;
  });

  const mostActiveUserId = Object.entries(userActivity).sort((a, b) => b[1].steps - a[1].steps)[0]?.[0] || null;
  const mostActiveUser = mostActiveUserId ? (await db.collection("users").doc(mostActiveUserId).get()).data() : null;

  const hours: Record<number, number> = {};
  stepsSnap.forEach((d) => {
    const ts = (d.data().timestamp as any)?.toDate?.() || new Date();
    const h = new Date(ts).getHours();
    hours[h] = (hours[h] || 0) + ((d.data().steps as number) || 0);
  });
  const peakHour = Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const communities = communitiesSnap.docs.map((c) => ({ id: c.id, ...c.data() }));
  const topCommunities = communities.slice(0, 5);

  const totalEnergy = energySnap.docs.reduce((a, d) => a + (((d.data().kwh as number) || 0)), 0);
  const totalCO2 = energySnap.docs.reduce((a, d) => a + (((d.data().co2SavedKg as number) || 0)), 0);

  const weekly = await computeWeeklyTrends(db);

  const analytics = {
    mostActiveUser: mostActiveUser ? { id: mostActiveUserId, name: (mostActiveUser as any).name || "User" } : null,
    peakWalkingHour: peakHour,
    topCommunities,
    totalEnergy,
    totalCO2,
    weekly,
  };

  await db.collection("analytics").doc("global").set({ ...analytics, updatedAt: new Date() }, { merge: true });
  return analytics;
}

async function computeWeeklyTrends(db: Firestore) {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const stepsSnap = await db.collection("steps_history").where("timestamp", ">=", since).get();
  const days: Record<string, { steps: number; energy: number }> = {};
  stepsSnap.forEach((d) => {
    const dt = (d.data().timestamp as any)?.toDate?.() || new Date();
    const key = new Date(dt).toISOString().slice(0, 10);
    days[key] = days[key] || { steps: 0, energy: 0 };
    days[key].steps += (d.data().steps as number) || 0;
  });
  const energySnap = await db.collection("energy_generated").where("timestamp", ">=", since).get();
  energySnap.forEach((d) => {
    const dt = (d.data().timestamp as any)?.toDate?.() || new Date();
    const key = new Date(dt).toISOString().slice(0, 10);
    days[key] = days[key] || { steps: 0, energy: 0 };
    days[key].energy += (d.data().kwh as number) || 0;
  });
  return Object.entries(days).sort((a, b) => a[0].localeCompare(b[0])).map(([date, v]) => ({ date, ...v }));
}