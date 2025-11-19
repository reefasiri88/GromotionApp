import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, query, where, orderBy, limit, setDoc, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { getUserStats, fakeStepsHistory, fakeChallenges, fakeLeaderboard } from "./fake";

export type UserStats = {
  calories: number;
  points: number;
  energyKwh: number;
  co2SavedKg: number;
  todaySteps: number;
  goalSteps: number;
};

export type HistoryEntry = {
  date: string;
  distanceKm: number;
  kcal: number;
  steps: number;
  bpm?: number;
};

export const listenUserStats = (userId: string, cb: (s: UserStats) => void) => {
  const ref = doc(db, "users", userId);
  return onSnapshot(ref, (snap) => {
    const d = snap.data();
    if (!d) {
      cb(getUserStats(userId));
      return;
    }
    cb({
      calories: d.calories || 0,
      points: d.points || 0,
      energyKwh: d.energyKwh || 0,
      co2SavedKg: d.co2SavedKg || 0,
      todaySteps: d.todaySteps || 0,
      goalSteps: d.goalSteps || 5000,
    });
  }, (_err) => {
    cb(getUserStats(userId));
  });
};

export const listenUserHistoryPreview = (userId: string, cb: (items: HistoryEntry[]) => void) => {
  const q = query(
    collection(db, "steps_history"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(3)
  );
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      const items: HistoryEntry[] = fakeStepsHistory.slice(-3).map((x) => ({
        date: x.date,
        distanceKm: x.distanceKm,
        kcal: x.kcal,
        steps: x.steps,
        bpm: x.bpm,
      }));
      cb(items);
      return;
    }
    const items: HistoryEntry[] = snap.docs.map((d) => {
      const x = d.data();
      return {
        date: x.date || new Date(x.timestamp?.toDate?.() || Date.now()).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
        distanceKm: x.distanceKm || 0,
        kcal: x.kcal || 0,
        steps: x.steps || 0,
        bpm: x.bpm || undefined,
      };
    });
    cb(items);
  }, (_err) => {
    const items: HistoryEntry[] = fakeStepsHistory.slice(-3).map((x) => ({
      date: x.date,
      distanceKm: x.distanceKm,
      kcal: x.kcal,
      steps: x.steps,
      bpm: x.bpm,
    }));
    cb(items);
  });
};

export const listenUserHistoryFull = (userId: string, cb: (items: any[]) => void) => {
  const q = query(
    collection(db, "steps_history"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      cb(fakeStepsHistory);
      return;
    }
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (_err) => cb(fakeStepsHistory));
};

export const listenChallenges = (cb: (items: any[]) => void) => {
  const q = query(collection(db, "challenges"), orderBy("startAt", "asc"));
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      cb(fakeChallenges);
      return;
    }
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (_err) => cb(fakeChallenges));
};

export const listenLeaderboard = (cb: (items: any[]) => void) => {
  const q = query(collection(db, "leaderboard"), orderBy("points", "desc"));
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      cb(fakeLeaderboard);
      return;
    }
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (_err) => cb(fakeLeaderboard));
};

export const logArSession = async (userId: string, payload: any) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/ar/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...payload,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to log AR session:', error);
    // Fallback to local Firestore if backend is not available
    await addDoc(collection(db, "ar_sessions"), {
      userId,
      ...payload,
      createdAt: serverTimestamp(),
    });
  }
};

export const ensureUserProfile = async (userId: string) => {
  const ref = doc(db, "user_profile", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { createdAt: serverTimestamp() });
  }
};