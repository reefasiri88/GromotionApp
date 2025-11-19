import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { z } from "zod";
import cron from "node-cron";
import { computeDailyAnalytics } from "./analytics";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const projectId = process.env.FIREBASE_PROJECT_ID;
try {
  if (!projectId) {
    console.warn("[GroMotion] FIREBASE_PROJECT_ID is not set. Backend will run in degraded mode.");
  }
  const credential = serviceAccountPath
    ? cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf8")))
    : applicationDefault();
  initializeApp({ credential, projectId });
} catch (e) {
  console.error("[GroMotion] Firebase Admin init failed:", e);
}
const db = getFirestore();
let ready = true;

// Admin key for privileged operations
const adminKey = process.env.ADMIN_KEY || "";

// Simple API key middleware for IoT devices
const iotAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = (req.headers["authorization"] || req.headers["x-device-key"] || "").toString().replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "missing device token" });
  db.collection("iot_devices").doc(token).get().then((snap) => {
    if (!snap.exists) return res.status(401).json({ error: "invalid device token" });
    (req as any).device = { id: token, ...snap.data() };
    next();
  }).catch((e) => res.status(500).json({ error: "auth check failed", details: String(e) }));
};

// Schemas
const stepsSchema = z.object({
  userId: z.string().min(1),
  steps: z.number().int().nonnegative(),
  kcal: z.number().nonnegative().optional(),
  distanceKm: z.number().nonnegative().optional(),
  bpm: z.number().optional(),
  timestamp: z.number().optional(),
});

const energySchema = z.object({
  userId: z.string().min(1),
  tileId: z.string().optional(),
  kwh: z.number().nonnegative(),
  co2SavedKg: z.number().nonnegative().optional(),
  timestamp: z.number().optional(),
});

const arSessionSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["started", "ended"]),
  coinsCollected: z.number().nonnegative().optional(),
  distance: z.number().nonnegative().optional(),
  energy: z.number().nonnegative().optional(),
  duration: z.number().nonnegative().optional(),
  timestamp: z.string().optional(),
});

// IoT endpoints
app.post("/iot/tiles/log-steps", iotAuth, async (req, res) => {
  if (!ready) return res.status(503).json({ error: "service unavailable" });
  const parsed = stepsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });
  const payload = parsed.data;
  await db.collection("steps_history").add({
    userId: payload.userId,
    steps: payload.steps,
    kcal: payload.kcal ?? Math.round(payload.steps * 0.05),
    distanceKm: payload.distanceKm ?? +(payload.steps * 0.0008).toFixed(2),
    bpm: payload.bpm ?? null,
    source: "iot",
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
  });
  res.json({ ok: true });
});

app.post("/iot/tiles/log-energy", iotAuth, async (req, res) => {
  if (!ready) return res.status(503).json({ error: "service unavailable" });
  const parsed = energySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });
  const payload = parsed.data;
  await db.collection("energy_generated").add({
    userId: payload.userId,
    tileId: payload.tileId ?? null,
    kwh: payload.kwh,
    co2SavedKg: payload.co2SavedKg ?? +(payload.kwh * 0.7).toFixed(3),
    source: "iot",
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
  });
  res.json({ ok: true });
});

app.get("/iot/tiles/status", iotAuth, async (req, res) => {
  res.json({ ok: true, device: (req as any).device });
});

// User APIs
app.get("/api/users/:userId/history", async (req, res) => {
  if (!ready) return res.status(503).json({ error: "service unavailable" });
  const userId = req.params.userId;
  const snap = await db.collection("steps_history").where("userId", "==", userId).orderBy("timestamp", "desc").limit(100).get();
  res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
});

app.get("/api/leaderboard", async (_req, res) => {
  if (!ready) return res.status(503).json({ error: "service unavailable" });
  const snap = await db.collection("leaderboard").orderBy("points", "desc").limit(100).get();
  res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
});

app.get("/api/challenges", async (_req, res) => {
  if (!ready) return res.status(503).json({ error: "service unavailable" });
  const snap = await db.collection("challenges").orderBy("startAt", "asc").get();
  res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
});

// AR Session logging
app.post("/api/ar/sessions", async (req, res) => {
  if (!ready) return res.status(503).json({ error: "service unavailable" });
  const parsed = arSessionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });
  const payload = parsed.data;
  
  await db.collection("ar_sessions").add({
    userId: payload.userId,
    status: payload.status,
    coinsCollected: payload.coinsCollected ?? 0,
    distance: payload.distance ?? 0,
    energy: payload.energy ?? 0,
    duration: payload.duration ?? 0,
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
  });
  
  // Update user stats if session ended
  if (payload.status === "ended" && payload.coinsCollected && payload.energy) {
    const userRef = db.collection("users").doc(payload.userId);
    const userSnap = await userRef.get();
    
    if (userSnap.exists) {
      const userData: any = userSnap.data() || {};
      await userRef.update({
        totalCoins: (userData.totalCoins || 0) + payload.coinsCollected,
        totalEnergy: (userData.totalEnergy || 0) + payload.energy,
        totalDistance: (userData.totalDistance || 0) + (payload.distance || 0),
        lastARSession: new Date(),
      });
    } else {
      await userRef.set({
        totalCoins: payload.coinsCollected,
        totalEnergy: payload.energy,
        totalDistance: payload.distance || 0,
        lastARSession: new Date(),
        createdAt: new Date(),
      });
    }
  }
  
  res.json({ ok: true });
});

// Get AR session history
app.get("/api/ar/sessions/:userId", async (req, res) => {
  if (!ready) return res.status(503).json({ error: "service unavailable" });
  const userId = req.params.userId;
  const snap = await db.collection("ar_sessions").where("userId", "==", userId).orderBy("timestamp", "desc").limit(50).get();
  res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
});

// Admin analytics
app.get("/api/admin/analytics", async (_req, res) => {
  if (!ready) return res.status(503).json({ error: "service unavailable" });
  const users = await db.collection("users").get();
  const communities = await db.collection("community_locations").get();
  const insights = await computeDailyAnalytics(db);
  res.json({
    totalUsers: users.size,
    communities: communities.docs.map((d) => ({ id: d.id, ...d.data() })),
    insights,
  });
});

// Admin: register IoT device token
app.post("/api/admin/iot/devices", async (req, res) => {
  const key = req.headers["x-admin-key"]?.toString() || "";
  if (!adminKey || key !== adminKey) return res.status(401).json({ error: "unauthorized" });
  const token = (req.body?.token as string) || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const meta = { tileId: req.body?.tileId || null, createdAt: new Date(), active: true };
  await db.collection("iot_devices").doc(token).set(meta);
  res.json({ token, meta });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, ready });
});

// Analytics job (daily at 03:00)
cron.schedule("0 3 * * *", async () => {
  await recomputeLeaderboard();
  await computeDailyAnalytics(db);
});

async function recomputeLeaderboard() {
  const usersSnap = await db.collection("users").get();
  const leaderboard = usersSnap.docs.map((d) => {
    const u = d.data() as any;
    return { id: d.id, name: u.name || "User", points: (u.points || 0) + Math.round((u.energyKwh || 0) * 100) };
  }).sort((a, b) => b.points - a.points);
  const batch = db.batch();
  leaderboard.forEach((u, idx) => {
    const ref = db.collection("leaderboard").doc(u.id);
    batch.set(ref, { name: u.name, points: u.points, rank: idx + 1, badge: idx === 0 ? "gold" : idx === 1 ? "silver" : idx === 2 ? "bronze" : null }, { merge: true });
  });
  await batch.commit();
}

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`GroMotion API running on http://localhost:${port}`);
});