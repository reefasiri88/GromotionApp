import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";

export async function initFirestore() {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  initializeApp({
    credential: serviceAccountPath ? cert(serviceAccountPath) : applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  const db = getFirestore();

  const collections = [
    "users",
    "steps_history",
    "energy_generated",
    "challenges",
    "leaderboard",
    "ar_sessions",
    "user_profile",
    "community_locations",
    "iot_devices",
    "analytics",
  ];
  for (const name of collections) {
    const ref = db.collection(name).doc("__bootstrap__");
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ createdAt: new Date() });
    }
  }

  console.log("Firestore initialized with base collections.");
}

// Execute when run directly
initFirestore().then(() => process.exit(0));