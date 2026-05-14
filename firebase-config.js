/**
 * BILHK - النواة المركزية لإعدادات Firebase
 * الإصدار المحترف: V10.8.0 Modular SDK
 * ---------------------------------------------------------
 * هذا الملف يدير الاتصال بـ:
 * 1. Firebase Auth (نظام المصادقة)
 * 2. Firestore DB (قاعدة بيانات السيارات والمحادثات)
 * 3. Firebase Storage (مخزن صور السيارات)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    enableIndexedDbPersistence, 
    initializeFirestore, 
    CACHE_SIZE_UNLIMITED 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, 
    setPersistence, 
    browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// --- 1. مفاتيح الربط الفنية (Credentials) ---
const firebaseConfig = {
    apiKey: "AIzaSyDCsMbG5pT3y6MC6b05LEdFoByWM1nT7NY",
    authDomain: "bilmarknad-hk.firebaseapp.com",
    projectId: "bilmarknad-hk",
    storageBucket: "bilmarknad-hk.firebasestorage.app",
    appId: "1:284008879407:web:66bee60b51ec277e8dbdda"
};

// --- 2. تهيئة التطبيق الأساسي ---
const app = initializeApp(firebaseConfig);

// --- 3. تهيئة نظام المصادقة (Authentication) ---
const auth = getAuth(app);

/**
 * ضبط استمرارية الجلسة (Persistence):
 * نستخدم browserLocalPersistence لضمان بقاء المستخدم مسجلاً لدخوله 
 * حتى بعد إغلاق المتصفح أو إعادة تشغيل الجهاز.
 */
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("BILHK Auth: Persistence established (Local).");
    })
    .catch((error) => {
        console.error("BILHK Auth Error: Could not set persistence.", error.message);
    });

// --- 4. تهيئة قاعدة البيانات (Firestore) مع إعدادات متقدمة ---
/**
 * نستخدم initializeFirestore بدلاً من getFirestore لتخصيص حجم الذاكرة المؤقتة.
 * ضبط الكاش ليكون غير محدود (UNLIMITED) يسمح بتصفح أسرع للإعلانات المحملة مسبقاً.
 */
const db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

/**
 * تفعيل ميزة العمل بدون إنترنت (Offline Persistence):
 * تسمح هذه الميزة للمستخدمين برؤية إعلانات السيارات التي تصفحوها سابقاً 
 * وإرسال الرسائل التي سيتم مزامنتها فور عودة الاتصال.
 */
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // يحدث هذا الخطأ إذا فتح المستخدم الموقع في عدة تبويبات متزامنة
        console.warn("Firestore Persistence: Multiple tabs detected, offline mode active in one tab only.");
    } else if (err.code === 'unimplemented') {
        // يحدث إذا كان المتصفح قديماً ولا يدعم تقنيات التخزين الحديثة
        console.warn("Firestore Persistence: Browser does not support offline storage.");
    }
});

// --- 5. تهيئة مخزن الملفات (Cloud Storage) ---
const storage = getStorage(app);

// --- 6. التصدير البرمجي (Exports) ---
/**
 * تصدير المراجع لاستخدامها في ملفات المشروع الأخرى:
 * - app.js: لعرض السيارات والفلترة.
 * - dashboard.html: لإدارة الحساب.
 * - sell.html: لرفع صور السيارات الجديدة.
 */
export { 
    app, 
    auth, 
    db, 
    storage,
    firebaseConfig 
};

// التصدير الافتراضي لتسهيل الاستدعاء السريع
export default firebaseConfig;

console.log("BILHK Firebase Infrastructure: Online & Optimized.");
