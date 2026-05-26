# VORQ Fordon 🚗

**VORQ Fordon** är en fordonsannonsplattform riktad till den svenska marknaden. Användare kan publicera, söka, spara och hantera fordonsannonser samt kontakta andra användare via webbplatsens funktioner.

Projektet drivs under:

**VORQ Digital, Inhaber: Haitham Kojar**  
**Ziegelstraße 26, 42289 Wuppertal, Deutschland**

Juridisk form: **nicht eingetragenes gewerbliches Einzelunternehmen**.  
Registrerad verksamhet: **IT-Dienstleistungen, Webdesign, Webentwicklung und Betrieb von Internetportalen**.

VORQ Fordon är en annonsplattform. Plattformen säljer inte fordon, äger inte fordon, förvarar inte fordon, kontrollerar inte fordonens tekniska skick, hanterar inte betalning och är inte part i avtal mellan annonsörer, köpare eller säljare.

---

## 🌍 Languages / اللغات

- [Svenska](#om-projektet-svenska)
- [English](#about-the-project-english)
- [العربية](#عن-المشروع-arabic)

---

## Om projektet (Svenska)

**VORQ Fordon** är en webbplats för fordonsannonser riktad till den svenska marknaden. Plattformen drivs juridiskt från Tyskland under VORQ Digital, Inhaber: Haitham Kojar.

Plattformen innehåller bland annat:

- **Användarkonto:** registrering, inloggning och kontohantering.
- **Publicera annons:** annonsörer kan lägga till fordon med bilder, pris, miltal, plats och tekniska detaljer.
- **Avancerad sökning:** filtrering efter märke, modell, län, pris, miltal, bränsle, växellåda, karosstyp och utrustning.
- **Favoriter:** inloggade användare kan spara intressanta annonser.
- **Meddelanden:** användare kan kontakta varandra via webbplatsens meddelandefunktion.
- **Rapportera annons:** användare och besökare kan rapportera felaktiga, misstänkta eller olagliga annonser.

### Ansvarsbegränsning för annonser

Användare ansvarar själva för innehåll de publicerar, inklusive bilder, beskrivningar, pris, kontaktuppgifter och uppgifter om fordonets skick, ägande, registrering och historik.

VORQ Fordon kan ta bort, begränsa eller granska annonser, konton eller innehåll som misstänks bryta mot användarvillkor, lag, tredje parts rättigheter eller plattformens säkerhetsregler.

---

## About the project (English)

**VORQ Fordon** is a vehicle listing platform directed to the Swedish market. The platform is legally operated from Germany under VORQ Digital, Inhaber: Haitham Kojar.

The project is operated under:

**VORQ Digital, Inhaber: Haitham Kojar**  
**Ziegelstraße 26, 42289 Wuppertal, Germany**

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

**VORQ Fordon** هي منصة إعلانات مركبات موجهة للسوق السويدي. المشغّل القانوني للمنصة موجود في ألمانيا تحت اسم:

**VORQ Digital, Inhaber: Haitham Kojar**  
**Ziegelstraße 26, 42289 Wuppertal, Deutschland**

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
- **Storage:** Firebase Storage, when enabled for user images
- **Hosting:** Firebase Hosting / static hosting
- **PWA:** manifest, service worker, offline page and install support when enabled

---

## 📁 Main files

- `index.html` — startsida och annonsöversikt
- `results.html` — annonsresultat
- `details.html` — fordonsdetaljer
- `sell.html` — publicera annons med villkorsgodkännande
- `add-car.html` — länk-/bryggsida till `sell.html`
- `edit-car.html` — redigera annons
- `confirm.html` — bekräftelse efter publicering eller ändring
- `my-account.html` — användarkonto
- `manage.html` — hantera egna annonser
- `messages.html` — meddelanden
- `notice-action.html` — rapportering av annonser eller innehåll
- `rapportera.html` — svensk genväg/omdirigering till rapportering
- `privacy.html` — integritetspolicy
- `terms.html` — användarvillkor
- `cookies.html` — information om cookies och lokal lagring
- `legal.html` — rättslig information
- `foretagsinfo.html` — svensk företagsinformation
- `impressum.html` — tysk företagsinformation / Impressum
- `404.html` — felsida
- `offline.html` — offline-sida
- `manifest.webmanifest` — PWA-manifest
- `service-worker.js` — offline/cache-funktioner
- `pwa-register.js` — registrering av PWA-funktioner
- `firebase-config.js` — Firebase client configuration
- `firestore.rules.txt` — Firestore security rules, ska inte publiceras som webbsida
- `firebase.json` — Firebase Hosting configuration, används vid deploy och ska inte visas som publik webbsida
- `VORQ-FORDON-INFO.md` — levande intern projektöversikt och beslutslogg

---

## 🔐 Security and abuse prevention

Plattformen ska användas på ett lagligt och säkert sätt. Det är inte tillåtet att publicera:

- falska eller vilseledande annonser,
- annonser för stulna fordon,
- bilder eller text som användaren inte har rätt att använda,
- bedrägligt eller manipulerat innehåll,
- skadliga länkar eller försök till phishing,
- BankID-uppgifter, kortuppgifter, lösenord eller engångskoder,
- känsliga dokument eller onödiga personuppgifter,
- innehåll som bryter mot lag, tredje parts rättigheter eller plattformens villkor.

Misstänkta annonser kan rapporteras via funktionen **Rapportera** eller via `notice-action.html`.

---

## ✅ Terms acceptance and reporting

När en användare publicerar en annons ska `sell.html` kräva uttryckligt godkännande av `terms.html` innan annonsen publiceras. Annonsdokumentet i Firestore ska innehålla bland annat:

- `termsAccepted: true`
- `termsAcceptedAt`
- `termsVersion: "vorq-fordon-terms-2026-05"`
- `listingConsentAccepted: true`
- `adId`
- `annonsnummer`

Annonskort och detaljsidor ska visa **Annonsnummer** och ha en tydlig **Rapportera**-länk som skickar `adId`, `annonsnummer` och `source` till `notice-action.html`.

---

## 🚀 Deployment notes

Vid Firebase Hosting ska publika webbplatsfiler ligga i hosting-mappen.

Filer som inte ska visas som publika webbsidor bör inte placeras i den publika hosting-mappen, till exempel:

- `firebase.json`
- `.firebaserc`
- `firestore.rules` / `firestore.rules.txt`
- `storage.rules`, if used later
- `.env`
- privata nycklar
- service-account-filer
- Admin SDK-filer
- interna arbetsanteckningar

Firebase Web Config i `firebase-config.js` är publik klientkonfiguration och är inte samma sak som Admin SDK-nycklar eller service-account-filer. Säkerheten ska styras med Firebase Auth, Firestore Rules, Storage Rules, App Check och domän-/API-begränsningar.

Om användaruppladdade bilder används med Firebase Storage bör Storage-regler finnas i Firebase Console eller i ett separat `storage.rules`-flöde.

---

## 📬 Contact and legal information

Kontaktuppgifter och rättslig information ska finnas på webbplatsens juridiska sidor, till exempel:

- `impressum.html`
- `foretagsinfo.html`
- `legal.html`
- `privacy.html`
- `terms.html`
- `cookies.html`
- `notice-action.html`

För juridiska och officiella sammanhang ska namnet användas som:

**VORQ Digital, Inhaber: Haitham Kojar**

Officiell operatörsadress:

**Ziegelstraße 26, 42289 Wuppertal, Deutschland**

---

© 2026 VORQ Fordon. Operated under VORQ Digital, Inhaber: Haitham Kojar. All rights reserved.
