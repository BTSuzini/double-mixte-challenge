// assets/js/session.js
import { auth, db } from "../../shared/firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let current = {
  user: null,
  role: "mobile" // "mobile" | "admin" | "jat"
};

export function getSession() {
  return { ...current };
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

async function resolveRole(user) {
  if (!user?.email) return "mobile";
  const email = user.email.toLowerCase();
  const ref = doc(db, "roles", email);
  const snap = await getDoc(ref);
  if (!snap.exists()) return "mobile";
  const data = snap.data() || {};
  const role = (data.role || "").toLowerCase();
  if (role === "admin" || role === "jat") return role;
  return "mobile";
}

export function onSessionChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    current.user = user || null;
    current.role = user ? await resolveRole(user) : "mobile";
    callback(getSession());
  });
}
