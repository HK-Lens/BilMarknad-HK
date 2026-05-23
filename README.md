# VORQ Fordon 🚗

**VORQ Fordon** är en modern fordonsplattform för annonser i Sverige. Webbplatsen ägs och drivs av **VORQ Group**.

**VORQ Group**  
Vision • Operations • Reach • Quality  
Kontakt: **info@vorq.group**

---

## 🌍 Languages / اللغات
- [Svenska](#om-projektet-svenska)
- [English](#about-the-project-english)
- [العربية](#عن-المشروع-arabic)

---

## Om projektet (Svenska)

**VORQ Fordon** är en webbplats där användare kan publicera, söka och hantera fordonsannonser.

Plattformen innehåller bland annat:

- **Användarkonto:** registrering, inloggning och kontohantering.
- **Publicera annons:** säljare kan lägga till fordon med bilder, pris, miltal, plats och tekniska detaljer.
- **Avancerad sökning:** filtrering efter märke, modell, län, pris, miltal, bränsle, växellåda, karosstyp och utrustning.
- **Favoriter:** inloggade användare kan spara intressanta annonser.
- **Meddelanden:** köpare och säljare kan kontakta varandra via webbplatsens meddelandefunktion.

---

## About the project (English)

**VORQ Fordon** is a vehicle marketplace website for Sweden, owned and operated by **VORQ Group**.

The platform allows users to:

- **Register and log in** to manage their account.
- **Publish vehicle listings** with images, price, mileage, location and technical details.
- **Search and filter listings** by brand, model, county, price, mileage, fuel type, gearbox, body type and equipment.
- **Save favorite vehicles** when logged in.
- **Contact sellers** through the built-in messaging system.

---

## عن المشروع (Arabic)

**VORQ Fordon** هو موقع لإعلانات المركبات في السويد، مملوك ومُدار من قبل **VORQ Group**.

يوفر الموقع للمستخدمين:

- **إنشاء حساب وتسجيل الدخول** لإدارة الحساب والإعلانات.
- **نشر إعلان مركبة** مع الصور والسعر والمسافة والموقع والمواصفات.
- **البحث المتقدم** حسب الماركة والموديل والمنطقة والسعر والمسافة ونوع الوقود وناقل الحركة والتجهيزات.
- **حفظ الإعلانات المفضلة** للمستخدمين المسجلين.
- **التواصل بين المشتري والبائع** عبر نظام الرسائل داخل الموقع.

---

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Authentication:** Firebase Auth
- **Database:** Cloud Firestore
- **Storage:** Firebase Storage
- **Hosting:** Firebase Hosting / static hosting
- **PWA files:** manifest, service worker and offline page when enabled

---

## 📁 Main files

- `index.html` — startsida
- `results.html` — annonsresultat
- `details.html` — fordonsdetaljer
- `sell.html` / `add-car.html` — publicera annons
- `edit-car.html` — redigera annons
- `my-account.html` — användarkonto
- `messages.html` — meddelanden, om filen finns i projektet
- `firebase-config.js` — Firebase client configuration
- `firestore.rules` — Firestore security rules, ska inte laddas upp som publik hosting-fil
- `firebase.json` — Firebase Hosting configuration, används vid deploy och ska inte visas publikt

---

## 🚀 Deployment notes

Vid Firebase Hosting ska publika webbplatsfiler ligga i hosting-mappen. Konfigurationsfiler som `firebase.json`, `.firebaserc`, `firestore.rules`, `storage.rules`, `.env` och privata nycklar ska inte visas som publika webbsidor.

Firebase Web Config i `firebase-config.js` är publik klientkonfiguration och är inte samma sak som Admin SDK-nycklar eller service-account-filer. Säkerheten ska styras med Firebase Auth, Firestore Rules, Storage Rules, App Check och domän-/API-begränsningar.

---

## 📬 Contact

For inquiries or feedback:

**VORQ Group**  
Email: **info@vorq.group**

---

© 2026 VORQ Group. All rights reserved.
