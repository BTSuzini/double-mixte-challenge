import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/**
 * Options
 */
const LAST_EMAIL_KEY = "suzini_last_email";

/**
 * Session persistante (reste connecté après fermeture)
 */
export async function ensurePersistence(){
  // Safe à appeler plusieurs fois
  await setPersistence(auth, browserLocalPersistence);
}

export function getLastEmail(){
  return localStorage.getItem(LAST_EMAIL_KEY) || "";
}

export function setLastEmail(email){
  localStorage.setItem(LAST_EMAIL_KEY, email);
}

export async function login(email, password){
  await ensurePersistence();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  setLastEmail(email);
  return cred.user;
}

export async function logout(){
  await signOut(auth);
}

export function getCurrentUser(){
  return auth.currentUser;
}

export async function getRoleByEmail(email){
  const snap = await getDoc(doc(db, "roles", email));
  if(!snap.exists()) return null;
  return snap.data().role || null; // "admin" | "jat"
}

/**
 * Routes par rôle + scope
 * Tu peux adapter les chemins quand tu créeras etape2, etc.
 */
export function resolveRoute(role, scope){
  // scope: "general" | "etape1" | "etape2" | ...
  const routes = {
    admin: {
      general: "admin/index.html",
      etape1:  "admin/index.html",      // pour l’instant : admin landing = étape 1
      etape2:  "admin/etape2.html",
      etape3:  "admin/etape3.html",
    },
    jat: {
      general: "jat/index.html",
      etape1:  "jat/index.html",        // pour l’instant : jat landing = étape 1
      etape2:  "jat/etape2.html",
      etape3:  "jat/etape3.html",
    }
  };

  const byRole = routes[role] || null;
  if(!byRole) return null;

  return byRole[scope] || byRole.general;
}

/**
 * Login UX : email prérempli + redirection selon scope
 */
export async function loginAndRedirect(scope = "general"){
  const lastEmail = getLastEmail();
  const email = prompt("Email :", lastEmail);
  if (!email) return;

  const password = prompt("Mot de passe :");
  if (!password) return;

  const user = await login(email, password);
  const role = await getRoleByEmail(user.email);

  if(!role){
    alert("Connecté, mais rôle non défini (roles/{email}.role manquant).");
    return;
  }

  const url = resolveRoute(role, scope);
  if(!url){
    alert("Rôle inconnu ou route manquante.");
    return;
  }

  window.location.href = url;
}

/**
 * Si déjà connecté : redirection directe sans prompt
 * Sinon : loginAndRedirect
 */
export async function autoLoginOrPrompt(scope = "general"){
  await ensurePersistence();

  // si déjà connecté
  if(auth.currentUser){
    const role = await getRoleByEmail(auth.currentUser.email);
    if(role){
      const url = resolveRoute(role, scope);
      if(url){
        window.location.href = url;
        return;
      }
    }
    // connecté mais pas de rôle => on laisse l’utilisateur sur place
    return;
  }

  // sinon login
  await loginAndRedirect(scope);
}

/**
 * Protect page (admin/jat)
 * usage: await requireRole(["admin"])
 */
export async function requireRole(allowedRoles = ["admin"]){
  await ensurePersistence();

  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if(!user){
        resolve({ ok:false, role:null });
        return;
      }
      const role = await getRoleByEmail(user.email);
      resolve({ ok: allowedRoles.includes(role), role });
    });
  });
}
