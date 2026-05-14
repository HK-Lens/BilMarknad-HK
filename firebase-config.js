/**
 * BILHK - Firebase Core Configuration & Initialization
 * الإصدار الاحترافي: V10.8.0 Modular SDK
 * هذا الملف هو المحرك الأساسي لربط التطبيق بقاعدة البيانات ونظام المصادقة.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// --- 1. إعدادات الاتصال (Credentials) ---
const firebaseConfig = {
    apiKey: "AIzaSyDCsMbG5pT3y6MC6b05LEdFoByWM1nT7NY",
    authDomain: "bilmarknad-hk.firebaseapp.com",
    projectId: "bilmarknad-hk",
    storageBucket: "bilmarknad-hk.firebasestorage.app",
    appId: "1:284008879407:web:66bee60b51ec277e8dbdda"
};

// --- 2. تهيئة التطبيق (Initialization) ---
const app = initializeApp(firebaseConfig);

// --- 3. تهيئة نظام المصادقة (Authentication) ---
const auth = getAuth(app);

// ضبط استمرارية الجلسة: يبقى المستخدم مسجلاً للدخول حتى لو أغلق المتصفح
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Firebase Auth: Persistence set to local.");
    })
    .catch((error) => {
        console.error("Firebase Auth Error:", error.message);
    });

// --- 4. تهيئة قاعدة البيانات (Firestore) ---
const db = getFirestore(app);

// تفعيل ميزة التخزين المؤقت (Offline Persistence) 
// لتمكين الموقع من العمل وتصفح السيارات حتى في حال ضعف الإنترنت
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // تحدث عادة عند فتح الموقع في عدة تبويبات متزامنة
        console.warn("Firestore Persistence failed: Multiple tabs open.");
    } else if (err.code == 'unimplemented') {
        // المتصفح لا يدعم هذه الميزة
        console.warn("Firestore Persistence: Browser not supported.");
    }
});

// --- 5. تهيئة نظام تخزين الملفات (Storage) ---
const storage = getStorage(app);

// --- 6. تصدير المراجع البرمجية (Exports) ---
/**
 * نقوم بتصدير هذه المراجع ليتم استخدامها في الملفات الأخرى مثل:
 * index.html, dashboard.html, sell.html, app.js
 */
export { 
    app, 
    auth, 
    db, 
    storage,
    firebaseConfig // مفيد أحياناً للتحقق من الإعدادات برمجياً
};

// التصدير الافتراضي للإعدادات الخام
export default firebaseConfig;

console.log("BILHK Firebase Engine: System Online.");
