import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function login(email, password){
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout(){
  await signOut(auth);
}

export async function getRoleByEmail(email){
  const snap = await getDoc(doc(db, "roles", email));
  if(!snap.exists()) return null;
  return snap.data().role || null;
}

export async function loginAndRedirect(){
  const email = prompt("Email :");
  if (!email) return;

  const password = prompt("Mot de passe :");
  if (!password) return;

  const user = await login(email, password);
  const role = await getRoleByEmail(user.email);

  if(role === "admin"){
    window.location.href = "admin/index.html";
    return;
  }
  if(role === "jat"){
    window.location.href = "jat/index.html";
    return;
  }

  alert("Connecté, mais rôle non défini (roles/{email}.role manquant).");
}
