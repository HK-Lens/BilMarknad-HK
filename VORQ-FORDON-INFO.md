# VORQ-FORDON-INFO

Living project reference for the VORQ Fordon / VORQ Digital project.

Last updated: 2026-05-26

## 1. Approved identity

- Platform name: **VORQ Fordon**.
- Old names must not appear in visible UI/legal text: **BILHK**, **BilMarknad**, **HK Global** when used as the vehicle platform identity.
- Business/umbrella brand: **VORQ Digital**.
- Legal/operator wording:
  - **Haitham Kojar – VORQ Digital**
  - **VORQ Digital, Inhaber: Haitham Kojar**
- Do not use **VORQ Digital** alone in legal pages, invoices, contracts, or official legal statements.

## 2. Legal registration facts to keep consistent

- Legal form: **nicht eingetragenes gewerbliches Einzelunternehmen**.
- Owner/operator: **Haitham Kojar**.
- Registered operator address: **Ziegelstraße 26, 42289 Wuppertal, Deutschland**.
- Registered activity wording to use where needed: **IT-Dienstleistungen, Webdesign, Webentwicklung und Betrieb von Internetportalen**.
- The site is **directed to the Swedish market / den svenska marknaden**. Avoid wording that implies VORQ Fordon is itself a Swedish legal entity.

## 3. Platform role and liability wording

Use a consistent platform-liability statement:

- VORQ Fordon is a vehicle-ad platform / technical intermediary.
- VORQ Digital / Haitham Kojar does **not** sell, own, inspect, store, control, guarantee, or broker vehicles.
- Advertisers are responsible for ad content, vehicle data, images, price, contact information, and legal accuracy.
- Buyer/seller agreements, payment, inspection, vehicle transfer, and disputes are handled directly between users.
- Users must not share BankID, card data, passwords, registration certificates, private documents, or sensitive personal data in ads or messages.

## 4. Terms acceptance and Firestore proof

Approved terms version:

```text
vorq-fordon-terms-2026-05
```

When an ad is published, the ad document should store:

- `termsAccepted: true`
- `termsAcceptedAt`
- `termsVersion: "vorq-fordon-terms-2026-05"`
- `termsUrl`
- `termsAcceptedBy`
- `termsAcceptedEmail`
- `termsAcceptedPlatform`
- `listingConsentAccepted`
- `listingConsentAcceptedAt`
- `legalConsentVersion`
- `adId`
- `annonsnummer`

The publish button must remain disabled unless the user is logged in and the terms checkbox is checked.

## 5. Reporting / Notice & Action

- Visible reporting wording should be **Rapportera**.
- Avoid **Anmäl annons** in visible UI when possible.
- Official report page: `notice-action.html`.
- Swedish alias/bridge page: `rapportera.html`.
- Report links from ad cards should pass:
  - `adId`
  - `annonsnummer`
  - `source`
- Report forms should ask for **Annonsnummer / adId**.

## 6. Legal/support pages and route names

Keep these pages available and linked from important pages:

- `impressum.html`
- `foretagsinfo.html`
- `legal.html`
- `privacy.html`
- `cookies.html`
- `terms.html`
- `notice-action.html`
- `rapportera.html`
- `404.html`

Prefer `foretagsinfo.html` as the safe route name rather than relying only on special characters like `företagsinfo.html`.

## 7. Firebase note

The Firebase project/backend identifier may still include old technical names such as `bilmarknad-hk`. Treat this as a technical backend identifier only. Do not change it unless the Firebase project is actually migrated.

## 8. Security-by-design notes

- Avoid `innerHTML` with user-controlled data.
- Prefer DOM creation methods such as `textContent`, `appendChild`, and `replaceChildren`.
- Report buttons and dynamic ad cards must safely encode query parameters.
- Firestore rules should keep private user data, messages, and favorites accessible only to the correct authenticated users.

## 9. Completed file updates in this repair sequence

1. `404.html`
   - Fixed white/broken page issue.
   - Normalized identity to VORQ Fordon.
   - Added legal/footer links.

2. `app.js`
   - Added visible `Annonsnummer` to ad cards.
   - Added `Rapportera` links.
   - Report links pass `adId`, `annonsnummer`, and `source=listing`.

3. `details.html`
   - Added visible `Annonsnummer`.
   - Added `Rapportera` button.
   - Report link passes `adId`, `annonsnummer`, and `source=details`.
   - Corrected visible identity to VORQ Fordon.

4. `impressum.html`
   - Updated German Impressum with Wuppertal legal address.
   - Added operator/legal form/platform-liability wording.

5. `foretagsinfo.html`
   - Updated Swedish company/operator information.
   - Used German operator address and legal form.

6. `legal.html`
   - Updated legal platform role and liability text.

7. `cookies.html`
   - Created/updated Swedish cookies/local-storage page.
   - Clarified no marketing cookies/tracking in the current version unless later added with consent.

8. `privacy.html`
   - Created/updated Swedish privacy policy.
   - Added account, ad, messages, favorites, reports, logs, Firebase/Google, and GDPR-rights sections.

9. `notice-action.html`
   - Created/updated official reporting page.
   - Stores reports in Firestore `reports` with `adId`, `annonsnummer`, `source`, `category`, `description`, `reporterEmail`, `status`, `priority`, and `createdAt`.

10. `rapportera.html`
    - Created/updated Swedish bridge page to `notice-action.html`.
    - Preserves ad ID query parameters.

11. `sell.html`
    - Added mandatory terms checkbox before publishing.
    - Stores terms proof fields in the Firestore ad document.
    - Stores `adId` and `annonsnummer`.
    - Uses `Rapportera` and passes `source=sell`.

12. `terms.html`
    - Matched terms version with `sell.html`: `vorq-fordon-terms-2026-05`.
    - Added visible `Villkorsversion` and proof-of-acceptance wording.
    - Uses platform wording directed to the Swedish market, not a Swedish legal entity.

13. `index.html`
    - Corrected market/legal wording.
    - Fixed `cookies.html` route.
    - Added `Annonsnummer` and `Rapportera` to ad cards.
    - Report links pass `adId`, `annonsnummer`, and `source=index`.

14. `filter.html`
    - Corrected market/legal wording.
    - Uses `Rapportera`.
    - Added compact legal/safety section and legal links.
    - No `Annonsnummer` needed because this page does not render ad cards.

15. `results.html`
    - Corrected market/legal wording.
    - Added `Annonsnummer` to result ad cards.
    - Report links pass `adId`, `annonsnummer`, and `source=results`.

16. `edit-car.html`
    - Uses `Rapportera`.
    - Shows `Annonsnummer` in the edit side panel.
    - Preserves/normalizes `adId` and `annonsnummer` on update.
    - Report link passes `source=edit`.

17. `add-car.html`
    - Kept as redirect/bridge page to `sell.html`.
    - Uses `Rapportera`.
    - Explains that real publishing, annonsnummer creation, and terms proof happen in `sell.html`.

18. `dashboard.html`
    - Uses `Rapportera`.
    - Corrected market/legal wording.
    - Added German operator address and legal links.
    - No `Annonsnummer` needed because it does not render ad cards.

19. `my-account.html`
    - Uses `Rapportera`.
    - Adds `Annonsnummer` in user ad/favorite cards.
    - Report links pass `adId`, `annonsnummer`, and `source=my-account`.

20. `messages.html`
    - Uses `Rapportera`.
    - Stores and displays `Annonsnummer` when chats are created from ads.
    - Active chat report link passes `adId`, `annonsnummer`, and `source=messages`.
    - Removed `innerHTML` use from edited UI rendering.

21. `signup.html`
    - Corrected wording from Swedish legal entity style to: platform directed to the Swedish market.
    - Replaced visible `Anmäl annons` with `Rapportera`.
    - Added German operator address in visible owner/footer notes.
    - Added legal links: `cookies.html`, `foretagsinfo.html`, `legal.html`.
    - Updated account proof fields to `accountTermsVersion: "vorq-fordon-terms-2026-05"` and `privacyVersion: "vorq-fordon-privacy-2026-05"`.
    - Added operator address, legal form, registered activity, and platform market to the user profile document.
    - Removed `innerHTML` usage from the edited signup logic.

## 10. Latest login/registration updates

22. `login.html`
    - Corrected wording from `fordonsannonsprojekt` to a vehicle-ad platform directed to the Swedish market.
    - Replaced visible `Anmäl annons` with `Rapportera`.
    - Added the registered German operator address: `Ziegelstraße 26, 42289 Wuppertal, Deutschland`.
    - Added legal links: `impressum.html`, `foretagsinfo.html`, `terms.html`, `privacy.html`, `cookies.html`, `legal.html`, and `notice-action.html`.
    - Login consent checkbox carries `data-terms-version="vorq-fordon-terms-2026-05"` and `data-privacy-version="vorq-fordon-privacy-2026-05"`.
    - On login, user profile update stores `loginConsentAccepted`, `loginConsentAcceptedAt`, `lastAcceptedTermsVersion`, `lastAcceptedPrivacyVersion`, `operatorAddress`, `legalForm`, `registeredActivity`, and `platformMarket`.
    - No visible `BILHK`, `BilMarknad`, `HK Global`, `cookie-policy.html`, `under uppbyggnad`, `testvillkor`, `Anmäl`, or `innerHTML` remains in the edited file.

23. `register.html`
    - Corrected wording from `svensk fordonsannonsplattform` / `fordonsannonser i Sverige` to a vehicle-ad platform directed to the Swedish market.
    - Replaced visible `Anmäl annons` with `Rapportera`.
    - Added the registered German operator address in the visible header/footer: `Ziegelstraße 26, 42289 Wuppertal, Deutschland`.
    - Added legal footer links: `impressum.html`, `foretagsinfo.html`, `terms.html`, `privacy.html`, `cookies.html`, `legal.html`, and `notice-action.html`.
    - Registration consent checkbox carries `data-terms-version="vorq-fordon-terms-2026-05"` and `data-privacy-version="vorq-fordon-privacy-2026-05"`.
    - User profile creation now stores `accountTermsAccepted`, `accountTermsAcceptedAt`, `accountTermsVersion: "vorq-fordon-terms-2026-05"`, `privacyAccepted`, `privacyAcceptedAt`, `privacyVersion: "vorq-fordon-privacy-2026-05"`, `operatorLegalName`, `operatorAddress`, `legalForm`, `registeredActivity`, and `platformMarket`.
    - No visible `BILHK`, `BilMarknad`, `HK Global`, `cookie-policy.html`, `under uppbyggnad`, `testvillkor`, `Anmäl`, or `innerHTML` remains in the edited file.

## 11. Next planned files

The login/registration group still has this possible next file:

- `register.html` was completed in this update; if there are other account pages, review them next.
- Suggested next checks: `firebase.json`, `manifest.json`, service worker/cache file, Firebase Rules, and final full-site scan after all latest files are re-uploaded together.



24. `confirm.html`
    - Corrected visible reporting wording from `Anmäl annons` to `Rapportera` in the header/footer links.
    - Corrected wording from `svensk inriktad plattform` to a vehicle-ad platform directed to the Swedish market.
    - Added the registered German operator address in the visible footer: `Ziegelstraße 26, 42289 Wuppertal, Deutschland`.
    - Expanded legal/footer links to include `privacy.html`, `terms.html`, `cookies.html`, `legal.html`, `foretagsinfo.html`, `impressum.html`, and `notice-action.html`.
    - Added legal metadata constants for terms/privacy versions, operator legal name, operator address, legal form, registered activity, and platform market.
    - New and updated user profiles created through the email-link confirmation flow now store operator/legal context metadata: `operatorLegalName`, `operatorAddress`, `legalForm`, `registeredActivity`, `platformMarket`, `accountTermsVersion`, and `privacyVersion`.
    - `bilmarknad-hk` remains only in Firebase technical identifiers when applicable; it is not a visible platform name.
    - After this update, no visible `BILHK`, `BilMarknad`, `HK Global`, `cookie-policy.html`, `under uppbyggnad`, `testvillkor`, or `Anmäl` remains in `confirm.html`.

## 12. Remaining business recommendation

Because the operator is a non-registered sole proprietorship with unlimited personal liability, professional IT liability insurance (**IT-Berufshaftpflichtversicherung**) remains strongly recommended before operating at scale.


## Update – firebase-config.js completed

- `firebase-config.js` was refined for internal legal/branding consistency.
- Public/legal wording changed from implying a Swedish legal platform to: vehicle-advertising platform directed to the Swedish market.
- Added/kept clear operator metadata: `VORQ Digital, Inhaber: Haitham Kojar`.
- Added internal metadata: `LEGAL_ADDRESS`, `LEGAL_FORM`, `REGISTERED_ACTIVITY`, and `PLATFORM_MARKET`.
- Kept `bilmarknad-hk` Firebase project values unchanged because they are technical backend identifiers connected to the existing Firebase project. Changing them without migrating Firebase would break Auth/Firestore/Storage.
- No visible old brand names such as `BILHK`, `BilMarknad`, or `HK Global` should be used as platform branding.


## Update — firestore.rules.txt
- `firestore.rules.txt` has been updated to match the latest VORQ Fordon frontend changes.
- Added rules for `reports` so `notice-action.html` can create DSA-style reports while public reading/updating/deleting reports remains blocked.
- Updated chat rules to allow `adId` and `annonsnummer` in chats/messages, matching the latest `messages.html` behavior.
- Added/kept private `users/{userId}` access for the signed-in owner of the user document.
- Updated `cars/{carId}` creation rules to require future listings to include `adId`, `annonsnummer`, and legal terms proof: `termsAccepted`, `listingConsentAccepted`, and `termsVersion: "vorq-fordon-terms-2026-05"`.
- `storage.rules` is not present in the GitHub repo screenshot. If car images are stored in Firebase Storage, Storage security rules must be configured from Firebase Console or added later as a separate rules file.

## Update — manifest.webmanifest
- `manifest.webmanifest` was updated for PWA identity consistency.
- Description now says VORQ Fordon is a vehicle-ad platform directed to the Swedish market, not a Swedish legal entity or generic “svensk annonsplattform”.
- Visible shortcut wording changed from `Anmäl annons` / `Anmäl` to `Rapportera annons` / `Rapportera`.
- Report shortcut now points to `notice-action.html?source=manifest`.
- `Mina annonser` shortcut now points to the reviewed account page `my-account.html` instead of the still-unreviewed `manage.html`.
- Manifest icon paths now point to `./icons/vorq-icon-192.png` and `./icons/vorq-icon-512.png`, matching the visible `icons` folder in the GitHub repo screenshot.
- Checked after update: no visible `BILHK`, `BilMarknad`, `HK Global`, `Anmäl`, `svensk annonsplattform`, or `svensk fordonsplattform` remains in the updated manifest.

## Update — service-worker.js
- `service-worker.js` was updated after the core page/legal changes.
- Cache name changed from `vorq-fordon-pwa-v11-20260525` to `vorq-fordon-pwa-v12-20260526` so browsers stop serving old cached versions after deployment.
- Service worker wording now states that VORQ Fordon is a vehicle-ad platform directed to the Swedish market.
- App shell cache now includes reviewed legal/support pages: `404.html`, `terms.html`, `privacy.html`, `cookies.html`, `legal.html`, `foretagsinfo.html`, `impressum.html`, `notice-action.html`, and `rapportera.html`.
- Cache deletion now targets only caches beginning with `vorq-fordon-pwa-`, avoiding deletion of unrelated caches on the same origin.
- Navigation handling now uses the reviewed `404.html` page when a navigation request returns HTTP 404, and uses `offline.html` when the network is unavailable.
- Added optional message commands: `SKIP_WAITING` and `CLEAR_VORQ_CACHE` for safer PWA update control from `pwa-register.js` later if needed.

## Update — pwa-register.js
- `pwa-register.js` has been updated to work with the reviewed `service-worker.js` cache/version workflow.
- Keeps the public install function `window.VORQFordonInstallApp` for existing install buttons.
- Adds `window.VORQFordonClearPwaCache` so the app can clear only VORQ Fordon PWA caches when needed.
- Handles waiting service-worker updates by sending `SKIP_WAITING` and reloads once after controller change, helping browsers leave old cached files after deployment.
- Adds `pwa-offline` and `pwa-install-ready` classes without using `innerHTML`.
- Checked after update: no visible `BILHK`, `BilMarknad`, `HK Global`, `Anmäl`, `under uppbyggnad`, or `testvillkor` remains in the updated file.


## Update – manage.html (2026-05-26)
- `manage.html` was reviewed and updated as the owner-only ad management page.
- Visible reporting wording is standardized from `Anmäl annons` / `Anmäl` to `Rapportera`.
- User ad cards now display `Annonsnummer` using `annonsnummer`, `adId`, or the Firestore document ID as fallback.
- Report links from management cards now pass `adId`, `annonsnummer`, and `source=manage` to `notice-action.html`.
- Legal wording now describes VORQ Fordon as a vehicle-ad platform directed to the Swedish market, not as a Swedish legal entity.
- Visible operator/legal text includes `VORQ Digital, Inhaber: Haitham Kojar, Ziegelstraße 26, 42289 Wuppertal, Deutschland`.
- Footer legal links include `terms.html`, `privacy.html`, `cookies.html`, `legal.html`, `foretagsinfo.html`, `impressum.html`, and `notice-action.html`.
- No visible `BILHK`, `BilMarknad`, `HK Global`, `cookie-policy.html`, `under uppbyggnad`, `testvillkor`, `Anmäl`, or `innerHTML` remains in the edited `manage.html`.

## Update — README.md
- Latest `README.md` update is completed.
- Replaced wording that could imply VORQ Fordon is a Swedish legal entity with wording that it is a vehicle-ad platform directed to the Swedish market.
- Standardized visible reporting wording from `Anmäl annons` to `Rapportera` / `Rapportera annons`.
- Replaced old `cookie-policy.html` references with `cookies.html`.
- Added reviewed legal/support files: `legal.html`, `foretagsinfo.html`, `impressum.html`, `rapportera.html`, `404.html`, `offline.html`, `VORQ-FORDON-INFO.md`.
- Added operator facts: `VORQ Digital, Inhaber: Haitham Kojar`, `Ziegelstraße 26, 42289 Wuppertal, Deutschland`, legal form, and registered activity.
- Added project notes for terms proof fields: `termsAccepted`, `termsAcceptedAt`, `termsVersion: "vorq-fordon-terms-2026-05"`, `listingConsentAccepted`, `adId`, and `annonsnummer`.
- Clarified that `firestore.rules.txt` is not a public web page and Storage rules should be configured if Firebase Storage user uploads are used.
