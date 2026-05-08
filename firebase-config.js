// استيراد المكتبات الأساسية من الإصدار 10.8.0
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// إعدادات مشروع BilMarknad-HK الخاص بك
const firebaseConfig = {
    apiKey: "AIzaSyDCsMbG5pT3y6MC6b05LEdFoByWM1nT7NY",
    authDomain: "bilmarknad-hk.firebaseapp.com",
    projectId: "bilmarknad-hk",
    storageBucket: "bilmarknad-hk.firebasestorage.app",
    appId: "1:284008879407:web:66bee60b51ec277e8dbdda"
};

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);

/**
 * تصدير الأدوات لاستخدامها في بقية الملفات
 * ملاحظة: يجب استدعاء هذه الملفات في HTML باستخدام type="module"
 */

// قاعدة البيانات (Firestore) - لتخزين السيارات والرسائل
export const db = getFirestore(app);

// نظام الحماية والمستخدمين (Auth)
export const auth = getAuth(app);

// خدمة رفع الملفات (Storage) - لصور السيارات
export const storage = getStorage(app);

// مزود خدمة الدخول عبر جوجل
export const googleProvider = new GoogleAuthProvider();

// تصدير الإعدادات كافتراضي لزيادة التوافق
export default firebaseConfig;
