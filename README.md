# VORQ Fordon 🚗

**VORQ Fordon** är en svensk fordonsannonsplattform där användare kan publicera, söka och hantera fordonsannonser.

Projektet drivs under:

**VORQ Digital, Inhaber: Haitham Kojar**  
Digitala projekt, webbutveckling, IT-tjänster och drift av internetportaler.

VORQ Fordon är en annonsplattform. Plattformen säljer inte fordon, äger inte fordon, förvarar inte fordon, kontrollerar inte fordonens tekniska skick och är inte part i avtal mellan annonsörer, köpare eller säljare.

---

## 🌍 Languages / اللغات

- [Svenska](#om-projektet-svenska)
- [English](#about-the-project-english)
- [العربية](#عن-المشروع-arabic)

---

## Om projektet (Svenska)

**VORQ Fordon** är en webbplats för fordonsannonser i Sverige. Användare kan publicera, söka, spara och hantera fordonsannonser samt kontakta andra användare via webbplatsens funktioner.

Plattformen innehåller bland annat:

- **Användarkonto:** registrering, inloggning och kontohantering.
- **Publicera annons:** annonsörer kan lägga till fordon med bilder, pris, miltal, plats och tekniska detaljer.
- **Avancerad sökning:** filtrering efter märke, modell, län, pris, miltal, bränsle, växellåda, karosstyp och utrustning.
- **Favoriter:** inloggade användare kan spara intressanta annonser.
- **Meddelanden:** användare kan kontakta varandra via webbplatsens meddelandefunktion.
- **Anmäl annons:** användare och besökare kan rapportera felaktiga, misstänkta eller olagliga annonser.

### Ansvarsbegränsning för annonser

Användare ansvarar själva för innehåll de publicerar, inklusive bilder, beskrivningar, pris, kontaktuppgifter och uppgifter om fordonets skick, ägande, registrering och historik.

VORQ Fordon kan ta bort, begränsa eller granska annonser, konton eller innehåll som misstänks bryta mot användarvillkor, lag, tredje parts rättigheter eller plattformens säkerhetsregler.

---

## About the project (English)

**VORQ Fordon** is a vehicle listing platform for Sweden. Users can publish, search, save and manage vehicle advertisements and contact other users through the website’s functions.

The project is operated under:

**VORQ Digital, Inhaber: Haitham Kojar**

The platform includes:

- **User accounts:** registration, login and account management.
- **Vehicle listing publication:** advertisers can add vehicles with images, price, mileage, location and technical details.
- **Advanced search:** filtering by brand, model, county, price, mileage, fuel type, gearbox, body type and equipment.
- **Favorites:** logged-in users can save interesting listings.
- **Messages:** users can contact each other through the built-in messaging function.
- **Report ad:** users and visitors can report inaccurate, suspicious or illegal listings.

### Platform role

VORQ Fordon is an advertising platform only. It does not sell vehicles, own vehicles, store vehicles, inspect vehicles, guarantee vehicle condition, handle payment, guarantee user identity or become a party to any agreement between users.

---

## عن المشروع (Arabic)

**VORQ Fordon** هو موقع سويدي لإعلانات المركبات. يتيح للمستخدمين نشر إعلانات المركبات، البحث، حفظ الإعلانات، إدارة الحساب، والتواصل عبر وظائف الموقع.

يعمل المشروع تحت:

**VORQ Digital, Inhaber: Haitham Kojar**

يوفر الموقع للمستخدمين:

- **إنشاء حساب وتسجيل الدخول** لإدارة الحساب والإعلانات.
- **نشر إعلان مركبة** مع الصور والسعر والمسافة والموقع والمواصفات.
- **البحث المتقدم** حسب الماركة والموديل والمنطقة والسعر والمسافة ونوع الوقود وناقل الحركة والتجهيزات.
- **حفظ الإعلانات المفضلة** للمستخدمين المسجلين.
- **التواصل بين المستخدمين** عبر نظام الرسائل داخل الموقع.
- **الإبلاغ عن إعلان** عند وجود إعلان خاطئ أو مشبوه أو غير قانوني.

### دور المنصة

VORQ Fordon هي منصة إعلانات فقط. المنصة لا تبيع المركبات، لا تملكها، لا تخزنها، لا تفحصها، لا تضمن حالتها، لا تدير الدفع، ولا تصبح طرفاً في أي اتفاق بين المستخدمين. المستخدم مسؤول عن صحة المعلومات والصور التي ينشرها.

---

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Authentication:** Firebase Auth
- **Database:** Cloud Firestore
- **Storage:** Firebase Storage
- **Hosting:** Firebase Hosting / static hosting
- **PWA:** manifest, service worker, offline page and install support when enabled

---

## 📁 Main files

- `index.html` — startsida och annonsöversikt
- `results.html` — annonsresultat
- `details.html` — fordonsdetaljer
- `sell.html` / `add-car.html` — publicera annons
- `edit-car.html` — redigera annons
- `confirm.html` — bekräftelse efter publicering eller ändring
- `my-account.html` — användarkonto
- `manage.html` — hantera egna annonser
- `messages.html` — meddelanden
- `notice-action.html` — rapportering av annonser eller innehåll
- `privacy.html` — integritetspolicy
- `terms.html` — användarvillkor
- `cookie-policy.html` — information om cookies och lokal lagring
- `manifest.webmanifest` — PWA-manifest
- `service-worker.js` — offline/cache-funktioner
- `pwa-register.js` — registrering av PWA-funktioner
- `firebase-config.js` — Firebase client configuration
- `firestore.rules` — Firestore security rules, ska inte publiceras som webbsida
- `firebase.json` — Firebase Hosting configuration, används vid deploy och ska inte visas som publik webbsida

---

## 🔐 Security and abuse prevention

Plattformen ska användas på ett lagligt och säkert sätt. Det är inte tillåtet att publicera:

- falska eller vilseledande annonser,
- annonser för stulna fordon,
- bilder eller text som användaren inte har rätt att använda,
- bedrägligt eller manipulerat innehåll,
- skadliga länkar eller försök till phishing,
- BankID-uppgifter, kortuppgifter, lösenord eller känsliga dokument,
- personuppgifter som inte är nödvändiga för annonsen,
- innehåll som bryter mot lag, tredje parts rättigheter eller plattformens villkor.

Misstänkta annonser kan rapporteras via funktionen **Anmäl annons** eller via `notice-action.html`.

---

## 🚀 Deployment notes

Vid Firebase Hosting ska publika webbplatsfiler ligga i hosting-mappen.

Filer som inte ska visas som publika webbsidor bör inte placeras i den publika hosting-mappen, till exempel:

- `firebase.json`
- `.firebaserc`
- `firestore.rules`
- `storage.rules`
- `.env`
- privata nycklar
- service-account-filer
- Admin SDK-filer
- interna arbetsanteckningar

Firebase Web Config i `firebase-config.js` är publik klientkonfiguration och är inte samma sak som Admin SDK-nycklar eller service-account-filer. Säkerheten ska styras med Firebase Auth, Firestore Rules, Storage Rules, App Check och domän-/API-begränsningar.

---

## 📬 Contact and legal information

Kontaktuppgifter och rättslig information ska finnas på webbplatsens juridiska sidor, till exempel:

- `impressum.html`
- `privacy.html`
- `terms.html`
- `cookie-policy.html`
- `notice-action.html`

För juridiska och officiella sammanhang ska namnet användas som:

**VORQ Digital, Inhaber: Haitham Kojar**

---

© 2026 VORQ Fordon. Operated under VORQ Digital, Inhaber: Haitham Kojar. All rights reserved.
