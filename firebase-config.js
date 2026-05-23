/**
 * ============================================================
 * VORQ Fordon - firebase-config.js
 * ------------------------------------------------------------
 * Central Firebase client configuration for the VORQ Fordon web app.
 *
 * Owner:
 * VORQ Group
 * Email: info@vorq.group
 * Slogan: Vision • Operations • Reach • Quality
 *
 * Security notes:
 * 1. Firebase Web Config is public by design. It is NOT an Admin secret.
 * 2. Never place service-account keys, Admin SDK credentials, or server secrets here.
 * 3. Real protection must be enforced with Firebase Auth, Firestore Rules,
 *    Storage Rules, App Check, authorized domains, and Google Cloud API-key restrictions.
 * ============================================================
 */

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getFirestore,
    connectFirestoreEmulator,
    enableIndexedDbPersistence
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

const HOSTNAME = String(window.location.hostname || "").toLowerCase();
const PROTOCOL = String(window.location.protocol || "").toLowerCase();

const IS_LOCALHOST =
    HOSTNAME === "localhost" ||
    HOSTNAME === "127.0.0.1" ||
    HOSTNAME === "0.0.0.0";

const IS_FIREBASE_HOSTING =
    HOSTNAME.endsWith(".web.app") ||
    HOSTNAME.endsWith(".firebaseapp.com");

const IS_GITHUB_PAGES = HOSTNAME.endsWith(".github.io");
const IS_SECURE_CONTEXT = PROTOCOL === "https:" || IS_LOCALHOST;
const IS_PRODUCTION = !IS_LOCALHOST;

/**
 * Local emulators should stay false on the published website.
 */
const USE_FIREBASE_EMULATORS = false;

/**
 * Put only the reCAPTCHA Enterprise SITE KEY here after enabling Firebase App Check.
 * Never put a secret key in frontend code.
 */
const APP_CHECK_RECAPTCHA_ENTERPRISE_SITE_KEY = "";

/**
 * Optional: after deployment, add your exact production domains here.
 * Empty array means no frontend host-blocking is applied.
 * Security must still be enforced by Firebase Rules and Google Cloud restrictions.
 */
const ALLOWED_FRONTEND_HOSTS = Object.freeze([
    "bilmarknad-hk.web.app",
    "bilmarknad-hk.firebaseapp.com"
]);

/**
 * ============================================================
 * 2. Firebase web config
 * ============================================================
 *
 * Important:
 * Do not change these Firebase values unless you create a new Firebase project.
 * These values are connected to the existing Firebase project.
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
    NAME: "VORQ Fordon",
    LONG_NAME: "VORQ Fordon",
    OWNER_NAME: "VORQ Group",
    OWNER_EMAIL: "info@vorq.group",
    OWNER_SLOGAN: "Vision • Operations • Reach • Quality",
    DEFAULT_LANGUAGE: "sv",
    DEFAULT_COUNTRY: "SE",
    HOSTNAME,
    PROTOCOL,
    IS_LOCALHOST,
    IS_FIREBASE_HOSTING,
    IS_GITHUB_PAGES,
    IS_SECURE_CONTEXT,
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
    MAX_PHONE_LENGTH: 30,
    MAX_EMAIL_LENGTH: 120,
    MAX_PATH_SEGMENT_LENGTH: 120,
    MAX_FILE_NAME_LENGTH: 160
});

export const ALLOWED_IMAGE_TYPES = Object.freeze([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif"
]);

export const ALLOWED_IMAGE_EXTENSIONS = Object.freeze([
    "jpg",
    "jpeg",
    "png",
    "webp",
    "avif"
]);

/**
 * ============================================================
 * 4. Validate config and browser context before initialization
 * ============================================================
 */

validateBrowserContext();
validateFirebaseConfig(firebaseConfig);

/**
 * ============================================================
 * 5. Initialize Firebase safely
 * ============================================================
 */

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * ============================================================
 * 6. Initialize Firebase services
 * ============================================================
 */

const firebaseDb = getFirestore(firebaseApp);
const firebaseAuth = getAuth(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);

firebaseAuth.languageCode = APP_META.DEFAULT_LANGUAGE;

setPersistence(firebaseAuth, browserLocalPersistence).catch((error) => {
    safeConsole("warn", "[VORQ Fordon Firebase] Could not set auth persistence", error);
});

if (IS_SECURE_CONTEXT) {
    enableIndexedDbPersistence(firebaseDb).catch((error) => {
        const code = error?.code || "";
        if (code !== "failed-precondition" && code !== "unimplemented") {
            safeConsole("warn", "[VORQ Fordon Firebase] Offline persistence warning", error);
        }
    });
}

/**
 * ============================================================
 * 7. Google Auth Provider
 * ============================================================
 */

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
provider.addScope("email");
provider.addScope("profile");

/**
 * ============================================================
 * 8. Optional Firebase App Check
 * ============================================================
 */

let appCheck = null;

if (IS_PRODUCTION && APP_CHECK_RECAPTCHA_ENTERPRISE_SITE_KEY && IS_SECURE_CONTEXT) {
    try {
        appCheck = initializeAppCheck(firebaseApp, {
            provider: new ReCaptchaEnterpriseProvider(APP_CHECK_RECAPTCHA_ENTERPRISE_SITE_KEY),
            isTokenAutoRefreshEnabled: true
        });
    } catch (error) {
        safeConsole("error", "[VORQ Fordon Firebase] App Check initialization failed", error);
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
        connectAuthEmulator(firebaseAuth, "http://127.0.0.1:9099", { disableWarnings: true });
        connectStorageEmulator(firebaseStorage, "127.0.0.1", 9199);
    } catch (error) {
        safeConsole("warn", "[VORQ Fordon Firebase] Emulator connection warning", error);
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
    const safeFolder = sanitizePathSegment(folder || STORAGE_PATHS.TEMP_UPLOADS);
    const safeFileName = sanitizeFileName(fileName || "file");
    const timestamp = Date.now();
    const random = cryptoRandomId();
    return `${safeFolder}/${timestamp}_${random}_${safeFileName}`;
}

export function buildCarImagePath(userId, fileName, carId = "") {
    const safeUserId = sanitizePathSegment(userId || "unknown-user");
    const safeCarId = carId ? `/${sanitizePathSegment(carId)}` : "";
    const safeFileName = sanitizeFileName(fileName || "car-image.jpg");
    const timestamp = Date.now();
    const random = cryptoRandomId();
    return `${STORAGE_PATHS.CAR_IMAGES}/${safeUserId}${safeCarId}/${timestamp}_${random}_${safeFileName}`;
}

export function isAllowedImageFile(file) {
    return getImageValidationError(file) === "";
}

export function getImageValidationError(file) {
    if (!file) {
        return "Ingen fil valdes.";
    }

    if (!ALLOWED_IMAGE_TYPES.includes(String(file.type || "").toLowerCase())) {
        return "Endast JPG, PNG, WEBP eller AVIF är tillåtna.";
    }

    if (!hasAllowedImageExtension(file.name)) {
        return "Filnamnet måste sluta med JPG, PNG, WEBP eller AVIF.";
    }

    if (!Number.isFinite(file.size) || file.size <= 0) {
        return "Bilden verkar vara tom eller skadad.";
    }

    if (file.size > APP_LIMITS.MAX_IMAGE_SIZE_BYTES) {
        return "Bilden är för stor. Maxstorlek är 5 MB.";
    }

    return "";
}

export function normalizeText(value, maxLength = 300) {
    return String(value ?? "")
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength);
}

export function normalizeLongText(value, maxLength = APP_LIMITS.MAX_DESCRIPTION_LENGTH) {
    return String(value ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim()
        .slice(0, maxLength);
}

export function normalizeEmail(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .slice(0, APP_LIMITS.MAX_EMAIL_LENGTH);
}

export function normalizePhone(value) {
    return String(value ?? "")
        .replace(/[^\d+\-\s()]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, APP_LIMITS.MAX_PHONE_LENGTH);
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

export function createPublicUserPayload(user, extra = {}) {
    return removeUndefinedFields({
        uid: user?.uid || null,
        name: normalizeText(extra.name || user?.displayName || "VORQ Fordon-användare", APP_LIMITS.MAX_PROFILE_NAME_LENGTH),
        email: normalizeEmail(extra.email || user?.email || ""),
        role: "user",
        active: true,
        emailVerified: Boolean(user?.emailVerified),
        ...extra
    });
}

/**
 * ============================================================
 * 11. Internal helpers
 * ============================================================
 */

function validateBrowserContext() {
    if (!IS_SECURE_CONTEXT) {
        console.warn("[VORQ Fordon Firebase] The app should run over HTTPS in production.");
    }

    if (
        IS_PRODUCTION &&
        ALLOWED_FRONTEND_HOSTS.length > 0 &&
        !ALLOWED_FRONTEND_HOSTS.includes(HOSTNAME) &&
        !IS_GITHUB_PAGES
    ) {
        console.warn("[VORQ Fordon Firebase] Current hostname is not listed in ALLOWED_FRONTEND_HOSTS:", HOSTNAME);
    }
}

function validateFirebaseConfig(config) {
    const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "appId"];
    const missingFields = requiredFields.filter((field) => !config[field] || String(config[field]).includes("PUT_YOUR"));

    if (missingFields.length > 0) {
        console.warn(`[VORQ Fordon Firebase] Missing or placeholder Firebase config fields: ${missingFields.join(", ")}`);
    }

    if (config.apiKey && !String(config.apiKey).startsWith("AIza") && !String(config.apiKey).includes("PUT_YOUR")) {
        console.warn("[VORQ Fordon Firebase] apiKey format looks unusual. Please verify it from Firebase Console.");
    }

    if (!String(config.authDomain || "").endsWith(".firebaseapp.com")) {
        console.warn("[VORQ Fordon Firebase] authDomain looks unusual. Please verify it from Firebase Console.");
    }

    if (config.projectId !== "bilmarknad-hk") {
        console.warn("[VORQ Fordon Firebase] projectId does not match the expected Firebase project.");
    }
}

function sanitizePathSegment(value) {
    return String(value ?? "")
        .trim()
        .replace(/[\\/]/g, "_")
        .replace(/\.\.+/g, ".")
        .replace(/[^A-Za-z0-9_.-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^\.+|\.+$/g, "")
        .slice(0, APP_LIMITS.MAX_PATH_SEGMENT_LENGTH) || "unknown";
}

function sanitizeFileName(fileName) {
    const cleanName = String(fileName ?? "file")
        .trim()
        .replace(/[\\/]/g, "_")
        .replace(/\.\.+/g, ".")
        .replace(/[^A-Za-z0-9_.\-()]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^\.+|\.+$/g, "")
        .slice(0, APP_LIMITS.MAX_FILE_NAME_LENGTH);

    if (!cleanName) {
        return "file";
    }

    return cleanName;
}

function hasAllowedImageExtension(fileName) {
    const extension = String(fileName || "").split(".").pop().toLowerCase();
    return ALLOWED_IMAGE_EXTENSIONS.includes(extension);
}

function cryptoRandomId() {
    if (window.crypto?.getRandomValues) {
        const array = new Uint32Array(3);
        window.crypto.getRandomValues(array);
        return Array.from(array).map((value) => value.toString(36)).join("");
    }

    return Math.random().toString(36).slice(2, 14);
}

function safeConsole(level, message, error) {
    const payload = {
        code: error?.code || "unknown",
        message: error?.message || String(error || "")
    };

    if (level === "error") {
        console.error(message, payload);
        return;
    }

    console.warn(message, payload);
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
