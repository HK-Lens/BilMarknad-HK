import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getAuth,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDCsMbG5pT3y6MC6b05LEdFoByWM1nT7NY",
    authDomain: "bilmarknad-hk.firebaseapp.com",
    projectId: "bilmarknad-hk",
    storageBucket: "bilmarknad-hk.firebasestorage.app",
    appId: "1:284008879407:web:66bee60b51ec277e8dbdda"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence)
.catch((error) => {
    console.error("Auth persistence error:", error);
});
