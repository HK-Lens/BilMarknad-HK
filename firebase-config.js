import {
initializeApp,
getApps,
getApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
getFirestore
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
getAuth,
GoogleAuthProvider,
setPersistence,
browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
getStorage
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {

apiKey:
"AIzaSyDCsMbG5pT3y6MC6b05LEdFoByWM1nT7NY",

authDomain:
"bilmarknad-hk.firebaseapp.com",

projectId:
"bilmarknad-hk",

storageBucket:
"bilmarknad-hk.appspot.com",

messagingSenderId:
"284008879407",

appId:
"1:284008879407:web:66bee60b51ec277e8dbdda"

};

/* =====================================================
   INITIALIZE APP SAFELY
===================================================== */

const app =
getApps().length
? getApp()
: initializeApp(firebaseConfig);

/* =====================================================
   SERVICES
===================================================== */

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app);

const googleProvider =
new GoogleAuthProvider();

/* =====================================================
   AUTH SETTINGS
===================================================== */

googleProvider.setCustomParameters({
prompt: "select_account"
});

setPersistence(
auth,
browserLocalPersistence
).catch((error)=>{

console.error(
"Auth persistence error:",
error
);

});

/* =====================================================
   EXPORTS
===================================================== */

export {
app,
db,
auth,
storage,
googleProvider
};
