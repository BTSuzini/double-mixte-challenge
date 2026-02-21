// assets/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAW66BD1V2Kr2w6ksM1_8bHGugeG6_cUI",
  authDomain: "suzini-double-mixte-challenge.firebaseapp.com",
  projectId: "suzini-double-mixte-challenge",
  storageBucket: "suzini-double-mixte-challenge.firebasestorage.app",
  messagingSenderId: "148641893645",
  appId: "1:148641893645:web:d73cb1727a7b96af3ff444"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ reste connecté sur le même appareil
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.warn("Auth persistence fallback:", e);
});

export { app, auth, db };
