/**
 * ============================================================
 * BILHK - firebase-config.js
 * ------------------------------------------------------------
 * Central Firebase client configuration for the BILHK web app.
 *
 * This file is used by public frontend pages:
 * - index.html
 * - results.html
 * - details.html
 * - add-car.html
 * - edit-car.html
 * - my-account.html
 * - messages.html
 * - login.html
 * - register.html
 * - confirm.html
 *
 * Security notes:
 * 1. Firebase Web Config is public by design.
 * 2. Do NOT place server secrets here.
 * 3. Do NOT place Firebase Admin SDK credentials here.
 * 4. Real protection must be enforced with:
 *    - Firebase Authentication
 *    - Firestore Security Rules
 *    - Storage Security Rules
 *    - Firebase App Check
 *    - Google Cloud API key restrictions
 * ============================================================
 */

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getFirestore,
    connectFirestoreEmulator
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
    connectAuthEmulator
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getStorage,
    connectStorageEmulator
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

import {
    initializeAppCheck,
    ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";

/**
 * ============================================================
 * 1. Environment mode
 * ============================================================
 */

const HOSTNAME = window.location.hostname;

const IS_LOCALHOST =
    HOSTNAME === "localhost" ||
    HOSTNAME === "127.0.0.1" ||
    HOSTNAME === "0.0.0.0";

const IS_FIREBASE_HOSTING =
    HOSTNAME.endsWith(".web.app") ||
    HOSTNAME.endsWith(".firebaseapp.com");

const IS_GITHUB_PAGES =
    HOSTNAME.endsWith(".github.io");

const IS_PRODUCTION = !IS_LOCALHOST;

/**
 * أثناء التطوير المحلي فقط يمكن تشغيل Firebase Emulators.
 * اتركيها false الآن حتى لا يتعطل الموقع المنشور.
 */
const USE_FIREBASE_EMULATORS = false;

/**
 * Firebase App Check:
 * ضعي هنا reCAPTCHA Enterprise Site Key فقط عندما تفعّلين App Check من Firebase Console.
 * لا تضعي secret key هنا أبدًا.
 */
const APP_CHECK_RECAPTCHA_ENTERPRISE_SITE_KEY = "";

/**
 * ============================================================
 * 2. Firebase web config
 * ============================================================
 *
 * تم الحفاظ على بيانات مشروعك القديمة بدل placeholder.
 * هذه ليست Admin secrets، لكنها يجب أن تُحمى من سوء الاستخدام عبر:
 * - Authorized domains
 * - Firestore Rules
 * - Storage Rules
 * - API key restrictions من Google Cloud
 */

const firebaseConfig = Object.freeze({
    apiKey: "AIzaSyDCsMbG5pT3y6MC6b05LEdFoByWM1nT7NY",
    authDomain: "bilmarknad-hk.firebaseapp.com",
    projectId: "bilmarknad-hk",
    storageBucket: "bilmarknad-hk.firebasestorage.app",
    messagingSenderId: "284008879407",
    appId: "1:284008879407:web:66bee60b51ec277e8dbdda"
});

/**
 * ============================================================
 * 3. Shared app constants
 * ============================================================
 */

export const APP_META = Object.freeze({
    NAME: "BILHK",
    LONG_NAME: "BILHK Bilmarknad",
    DEFAULT_LANGUAGE: "sv",
    DEFAULT_COUNTRY: "SE",
    HOSTNAME,
    IS_LOCALHOST,
    IS_FIREBASE_HOSTING,
    IS_GITHUB_PAGES,
    IS_PRODUCTION
});

export const COLLECTIONS = Object.freeze({
    USERS: "users",
    CARS: "cars",
    MESSAGES: "messages",
    CHATS: "chats",
    REPORTS: "reports",
    FAVORITES: "favorites",
    NOTIFICATIONS: "notifications"
});

export const STORAGE_PATHS = Object.freeze({
    CAR_IMAGES: "cars",
    USER_AVATARS: "users",
    TEMP_UPLOADS: "tmp"
});

export const APP_LIMITS = Object.freeze({
    MAX_CAR_IMAGES: 12,
    MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_TITLE_LENGTH: 160,
    MAX_MESSAGE_LENGTH: 2000,
    MAX_PROFILE_NAME_LENGTH: 80,
    MAX_PHONE_LENGTH: 30
});

export const ALLOWED_IMAGE_TYPES = Object.freeze([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif"
]);

/**
 * ============================================================
 * 4. Validate config before Firebase initialization
 * ============================================================
 */

validateFirebaseConfig(firebaseConfig);

/**
 * ============================================================
 * 5. Initialize Firebase safely
 * ============================================================
 *
 * getApps().length يمنع الخطأ:
 * Firebase App named '[DEFAULT]' already exists
 */

const firebaseApp = getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

/**
 * ============================================================
 * 6. Initialize Firebase services
 * ============================================================
 */

const firebaseDb = getFirestore(firebaseApp);
const firebaseAuth = getAuth(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);

firebaseAuth.languageCode = APP_META.DEFAULT_LANGUAGE;

/**
 * حفظ جلسة المستخدم في المتصفح.
 */
setPersistence(firebaseAuth, browserLocalPersistence).catch((error) => {
    console.error("[BILHK Firebase] Could not set auth persistence:", {
        code: error?.code,
        message: error?.message
    });
});

/**
 * ============================================================
 * 7. Google Auth Provider
 * ============================================================
 */

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});

provider.addScope("email");
provider.addScope("profile");

/**
 * ============================================================
 * 8. Optional Firebase App Check
 * ============================================================
 *
 * لا يعمل إلا إذا وضعت Site Key صحيح.
 * App Check يساعد في تقليل سوء الاستخدام، لكنه لا يغني عن Security Rules.
 */

let appCheck = null;

if (IS_PRODUCTION && APP_CHECK_RECAPTCHA_ENTERPRISE_SITE_KEY) {
    try {
        appCheck = initializeAppCheck(firebaseApp, {
            provider: new ReCaptchaEnterpriseProvider(
                APP_CHECK_RECAPTCHA_ENTERPRISE_SITE_KEY
            ),
            isTokenAutoRefreshEnabled: true
        });
    } catch (error) {
        console.error("[BILHK Firebase] App Check initialization failed:", {
            code: error?.code,
            message: error?.message
        });
    }
}

/**
 * ============================================================
 * 9. Optional local emulators
 * ============================================================
 */

if (IS_LOCALHOST && USE_FIREBASE_EMULATORS) {
    try {
        connectFirestoreEmulator(firebaseDb, "127.0.0.1", 8080);

        connectAuthEmulator(firebaseAuth, "http://127.0.0.1:9099", {
            disableWarnings: true
        });

        connectStorageEmulator(firebaseStorage, "127.0.0.1", 9199);
    } catch (error) {
        console.warn("[BILHK Firebase] Emulator connection warning:", {
            code: error?.code,
            message: error?.message
        });
    }
}

/**
 * ============================================================
 * 10. Public helper functions
 * ============================================================
 */

export function getFirebaseProjectId() {
    return firebaseConfig.projectId;
}

export function getFirebaseAuthDomain() {
    return firebaseConfig.authDomain;
}

export function getFirebaseStorageBucket() {
    return firebaseConfig.storageBucket;
}

export function isFirebaseReady() {
    return Boolean(firebaseApp && firebaseDb && firebaseAuth && firebaseStorage);
}

export function isUserLoggedIn() {
    return Boolean(firebaseAuth.currentUser);
}

export function getCurrentUserId() {
    return firebaseAuth.currentUser?.uid || null;
}

export function getCurrentUserEmail() {
    return firebaseAuth.currentUser?.email || null;
}

export function buildStoragePath(folder, fileName) {
    const safeFolder = sanitizePathSegment(folder);
    const safeFileName = sanitizeFileName(fileName);

    const timestamp = Date.now();
    const random = cryptoRandomId();

    return `${safeFolder}/${timestamp}_${random}_${safeFileName}`;
}

export function buildCarImagePath(userId, fileName) {
    const safeUserId = sanitizePathSegment(userId || "unknown-user");
    const safeFileName = sanitizeFileName(fileName || "car-image");

    const timestamp = Date.now();
    const random = cryptoRandomId();

    return `${STORAGE_PATHS.CAR_IMAGES}/${safeUserId}/${timestamp}_${random}_${safeFileName}`;
}

export function isAllowedImageFile(file) {
    if (!file) {
        return false;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return false;
    }

    if (file.size > APP_LIMITS.MAX_IMAGE_SIZE_BYTES) {
        return false;
    }

    return true;
}

export function getImageValidationError(file) {
    if (!file) {
        return "Ingen fil valdes.";
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return "Endast JPG, PNG, WEBP eller AVIF är tillåtna.";
    }

    if (file.size > APP_LIMITS.MAX_IMAGE_SIZE_BYTES) {
        return "Bilden är för stor. Maxstorlek är 5 MB.";
    }

    return "";
}

export function normalizeText(value, maxLength = 300) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength);
}

export function normalizeLongText(value, maxLength = APP_LIMITS.MAX_DESCRIPTION_LENGTH) {
    return String(value ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .trim()
        .slice(0, maxLength);
}

export function normalizeNumber(value, fallback = 0) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return Math.floor(number);
}

export function normalizeBoolean(value, fallback = false) {
    if (typeof value === "boolean") {
        return value;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    return fallback;
}

export function removeUndefinedFields(object) {
    const clean = {};

    Object.entries(object || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            clean[key] = value;
        }
    });

    return clean;
}

export function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/**
 * ============================================================
 * 11. Internal helpers
 * ============================================================
 */

function validateFirebaseConfig(config) {
    const requiredFields = [
        "apiKey",
        "authDomain",
        "projectId",
        "storageBucket",
        "appId"
    ];

    const missingFields = requiredFields.filter((field) => {
        return !config[field] || String(config[field]).includes("PUT_YOUR");
    });

    if (missingFields.length > 0) {
        console.warn(
            `[BILHK Firebase] Missing or placeholder Firebase config fields: ${missingFields.join(", ")}`
        );
    }

    if (
        config.apiKey &&
        config.apiKey.startsWith("AIza") === false &&
        !String(config.apiKey).includes("PUT_YOUR")
    ) {
        console.warn("[BILHK Firebase] apiKey format looks unusual. Please verify it from Firebase Console.");
    }

    if (!String(config.authDomain || "").endsWith(".firebaseapp.com")) {
        console.warn("[BILHK Firebase] authDomain looks unusual. Please verify it from Firebase Console.");
    }

    if (config.projectId !== "bilmarknad-hk") {
        console.warn("[BILHK Firebase] projectId does not match the expected BILHK project.");
    }
}

function sanitizePathSegment(value) {
    return String(value ?? "")
        .trim()
        .replace(/[^\w.-]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 120) || "unknown";
}

function sanitizeFileName(fileName) {
    const cleanName = String(fileName ?? "file")
        .trim()
        .replace(/[^\w.\-()]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 160);

    if (!cleanName) {
        return "file";
    }

    return cleanName;
}

function cryptoRandomId() {
    if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(2);
        window.crypto.getRandomValues(array);

        return `${array[0].toString(36)}${array[1].toString(36)}`;
    }

    return Math.random().toString(36).slice(2, 12);
}

/**
 * ============================================================
 * 12. Exports used by the rest of the website
 * ============================================================
 */

export const app = firebaseApp;
export const db = firebaseDb;
export const auth = firebaseAuth;
export const storage = firebaseStorage;
export const googleProvider = provider;
export const firebaseAppCheck = appCheck;
