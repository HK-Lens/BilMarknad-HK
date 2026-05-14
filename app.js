import { db, auth } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    onSnapshot,
    where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/**
 * ============================================================
 * BILHK - app.js
 * ------------------------------------------------------------
 * الملف المركزي لعرض إعلانات السيارات، البحث، الفلترة،
 * وتحديث واجهة المستخدم حسب حالة تسجيل الدخول.
 *
 * أهداف هذا الإصلاح:
 * 1. منع XSS بعدم استخدام innerHTML مع بيانات المستخدمين.
 * 2. تنظيف وتوحيد بيانات السيارات القادمة من Firestore.
 * 3. جعل الفلترة أكثر أمانًا ولا تتعطل بسبب الحقول الناقصة.
 * 4. مراقبة الرسائل غير المقروءة مع إلغاء الاشتراك بشكل صحيح.
 * 5. تحسين حالات التحميل، الخطأ، وعدم وجود نتائج.
 * 6. إبقاء التوافق مع صفحات المشروع الحالية مثل:
 *    index.html, results.html, details.html, my-account.html.
 * ============================================================
 */


/**
 * ============================================================
 * 1. إعدادات عامة
 * ============================================================
 */

const APP_CONFIG = {
    COLLECTIONS: {
        CARS: "cars",
        MESSAGES: "messages"
    },

    ROUTES: {
        HOME: "index.html",
        LOGIN: "login.html",
        ACCOUNT: "my-account.html",
        MESSAGES: "messages.html",
        DETAILS: "details.html",
        RESULTS: "results.html",
        PLACEHOLDER_IMAGE: "placeholder.jpg"
    },

    QUERY_KEYS: {
        BRAND: "brand",
        MODEL: "model",
        BODY_TYPE_SHORT: "kar",
        BODY_TYPE: "bodyType",
        MIN_PRICE: "minP",
        MAX_PRICE: "maxP",
        MIN_YEAR: "minY",
        MAX_YEAR: "maxY",
        MIN_MILEAGE: "minM",
        MAX_MILEAGE: "maxM",
        FUEL_SHORT: "fuel",
        FUEL_TYPE: "fuelType",
        TRANSMISSION_SHORT: "gear",
        TRANSMISSION: "transmission",
        TEXT: "text"
    },

    LIMITS: {
        SEARCH_TEXT_MAX_LENGTH: 120,
        CARD_DESCRIPTION_MAX_LENGTH: 120,
        MIN_YEAR: 1900,
        MAX_YEAR: 2030,
        MIN_PRICE: 0,
        MAX_PRICE: 20000000,
        MIN_MILEAGE: 0,
        MAX_MILEAGE: 2000000
    },

    UI: {
        GRID_ID: "carsGrid",
        RESULT_TITLE_ID: "resultTitle",
        AUTH_BUTTON_ID: "authButton",
        MESSAGE_LINK_ID: "msgLink",
        MESSAGE_BADGE_ID: "msgBadge"
    }
};


/**
 * ============================================================
 * 2. حالة التطبيق
 * ============================================================
 */

const appState = {
    allCars: [],
    filteredCars: [],
    currentUser: null,
    unreadMessagesUnsubscribe: null,
    hasLoadedCars: false,
    isLoadingCars: false
};


/**
 * ============================================================
 * 3. عناصر الصفحة
 * ============================================================
 */

const elements = {
    get carsGrid() {
        return document.getElementById(APP_CONFIG.UI.GRID_ID);
    },

    get resultTitle() {
        return document.getElementById(APP_CONFIG.UI.RESULT_TITLE_ID);
    },

    get authButton() {
        return document.getElementById(APP_CONFIG.UI.AUTH_BUTTON_ID);
    },

    get msgLink() {
        return document.getElementById(APP_CONFIG.UI.MESSAGE_LINK_ID);
    },

    get msgBadge() {
        return document.getElementById(APP_CONFIG.UI.MESSAGE_BADGE_ID);
    }
};


/**
 * ============================================================
 * 4. تشغيل التطبيق
 * ============================================================
 */

initializeApplication();

function initializeApplication() {
    attachAuthObserver();
    attachGlobalErrorProtection();
    initApp();
}


/**
 * ============================================================
 * 5. مراقبة تسجيل الدخول والهيدر
 * ============================================================
 */

function attachAuthObserver() {
    onAuthStateChanged(auth, (user) => {
        cleanupUnreadMessagesListener();

        if (user) {
            appState.currentUser = user;
            updateHeaderForLoggedInUser(user);
            startUnreadMessagesListener(user.uid);
            return;
        }

        appState.currentUser = null;
        updateHeaderForGuestUser();
    });
}

function updateHeaderForLoggedInUser(user) {
    const authBtn = elements.authButton;
    const msgLink = elements.msgLink;

    if (authBtn) {
        authBtn.textContent = "Mitt Konto";
        authBtn.setAttribute("href", APP_CONFIG.ROUTES.ACCOUNT);
        authBtn.setAttribute("aria-label", "Gå till mitt konto");
    }

    if (msgLink) {
        msgLink.style.display = "flex";
        msgLink.setAttribute("href", APP_CONFIG.ROUTES.MESSAGES);
        msgLink.setAttribute("aria-label", "Öppna meddelanden");
    }

    updateUnreadBadge(0);
}

function updateHeaderForGuestUser() {
    const authBtn = elements.authButton;
    const msgLink = elements.msgLink;

    if (authBtn) {
        authBtn.textContent = "Logga in";
        authBtn.setAttribute("href", APP_CONFIG.ROUTES.LOGIN);
        authBtn.setAttribute("aria-label", "Logga in");
    }

    if (msgLink) {
        msgLink.style.display = "none";
    }

    updateUnreadBadge(0);
}

function startUnreadMessagesListener(userId) {
    if (!userId) {
        updateUnreadBadge(0);
        return;
    }

    try {
        const unreadMessagesQuery = query(
            collection(db, APP_CONFIG.COLLECTIONS.MESSAGES),
            where("receiverId", "==", userId),
            where("read", "==", false)
        );

        appState.unreadMessagesUnsubscribe = onSnapshot(
            unreadMessagesQuery,
            (snapshot) => {
                updateUnreadBadge(snapshot.size);
            },
            (error) => {
                console.error("Unread messages listener error:", error);
                updateUnreadBadge(0);
            }
        );
    } catch (error) {
        console.error("Could not start unread messages listener:", error);
        updateUnreadBadge(0);
    }
}

function cleanupUnreadMessagesListener() {
    if (typeof appState.unreadMessagesUnsubscribe === "function") {
        appState.unreadMessagesUnsubscribe();
        appState.unreadMessagesUnsubscribe = null;
    }
}

function updateUnreadBadge(count) {
    const msgBadge = elements.msgBadge;

    if (!msgBadge) {
        return;
    }

    const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0;

    msgBadge.textContent = "";

    if (safeCount > 0) {
        msgBadge.textContent = safeCount > 99 ? "99+" : String(safeCount);
        msgBadge.style.display = "block";
        msgBadge.setAttribute("aria-label", `${safeCount} olästa meddelanden`);
    } else {
        msgBadge.style.display = "none";
        msgBadge.setAttribute("aria-label", "Inga olästa meddelanden");
    }
}


/**
 * ============================================================
 * 6. جلب السيارات من Firestore
 * ============================================================
 */

async function initApp() {
    const grid = elements.carsGrid;

    if (!grid) {
        return;
    }

    setLoadingState("Laddar fordon...");

    appState.isLoadingCars = true;

    try {
        const carsQuery = query(
            collection(db, APP_CONFIG.COLLECTIONS.CARS),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(carsQuery);

        const cars = snapshot.docs
            .map((documentSnapshot) => {
                return normalizeCarDocument(documentSnapshot.id, documentSnapshot.data());
            })
            .filter((car) => {
                return shouldDisplayCar(car);
            });

        appState.allCars = cars;
        appState.hasLoadedCars = true;

        const urlParams = new URLSearchParams(window.location.search);

        if (hasSearchParameters(urlParams)) {
            applyDeepSearch(urlParams);
        } else {
            appState.filteredCars = [...appState.allCars];
            render(appState.filteredCars);
            updateResultTitleForDefaultView(appState.filteredCars.length);
        }
    } catch (error) {
        console.error("Error fetching cars:", error);

        setErrorState({
            title: "Kunde inte ladda bilar",
            message: "Kontrollera anslutningen och försök igen.",
            actionText: "Försök igen",
            onAction: () => initApp()
        });
    } finally {
        appState.isLoadingCars = false;
    }
}

function normalizeCarDocument(id, data) {
    const rawImages = Array.isArray(data?.images) ? data.images : [];

    const imageUrls = rawImages
        .map((url) => normalizeURL(url))
        .filter(Boolean);

    const price = toSafeNumber(data?.price, 0);
    const mileage = toSafeNumber(data?.mileage, 0);
    const year = toSafeNumber(data?.year, 0);

    const brand = normalizeText(data?.brand);
    const model = normalizeText(data?.model);

    return {
        id: normalizeDocumentId(id),

        brand,
        model,
        title: normalizeText(data?.title) || buildCarTitle(brand, model, year),

        year,
        price,
        mileage,

        fuelType: normalizeText(data?.fuelType || data?.fuel),
        transmission: normalizeText(data?.transmission || data?.gear),
        bodyType: normalizeText(data?.bodyType || data?.karosseri || data?.kar),
        color: normalizeText(data?.color),
        condition: normalizeText(data?.condition),
        location: normalizeText(data?.location),

        description: normalizeText(data?.description),

        images: imageUrls,
        mainImage: normalizeURL(data?.mainImage) || imageUrls[0] || APP_CONFIG.ROUTES.PLACEHOLDER_IMAGE,

        sellerId: normalizeText(data?.sellerId),
        sellerEmail: normalizeText(data?.sellerEmail),
        sellerName: normalizeText(data?.sellerName),

        active: data?.active !== false,
        status: normalizeText(data?.status || "active"),
        isDeleted: data?.isDeleted === true,

        createdAt: data?.createdAt || null,
        updatedAt: data?.updatedAt || null,

        searchKeywords: Array.isArray(data?.searchKeywords)
            ? data.searchKeywords.map((item) => normalizeForSearch(item)).filter(Boolean)
            : []
    };
}

function shouldDisplayCar(car) {
    if (!car) {
        return false;
    }

    if (!car.id) {
        return false;
    }

    if (car.isDeleted === true) {
        return false;
    }

    if (car.active === false) {
        return false;
    }

    if (car.status && !["active", "published"].includes(normalizeForSearch(car.status))) {
        return false;
    }

    if (!car.brand && !car.model && !car.title) {
        return false;
    }

    return true;
}


/**
 * ============================================================
 * 7. البحث والفلترة
 * ============================================================
 */

function hasSearchParameters(params) {
    const supportedKeys = Object.values(APP_CONFIG.QUERY_KEYS);

    return supportedKeys.some((key) => {
        const value = params.get(key);
        return value !== null && String(value).trim() !== "";
    });
}

function applyDeepSearch(params) {
    const filters = extractFiltersFromParams(params);

    const filtered = appState.allCars.filter((car) => {
        return doesCarMatchFilters(car, filters);
    });

    appState.filteredCars = filtered;

    render(filtered);
    updateResultTitleForSearch(filtered.length);
}

function extractFiltersFromParams(params) {
    const brand = normalizeFilterValue(params.get(APP_CONFIG.QUERY_KEYS.BRAND));
    const model = normalizeFilterValue(params.get(APP_CONFIG.QUERY_KEYS.MODEL));

    const bodyType =
        normalizeFilterValue(params.get(APP_CONFIG.QUERY_KEYS.BODY_TYPE)) ||
        normalizeFilterValue(params.get(APP_CONFIG.QUERY_KEYS.BODY_TYPE_SHORT));

    const fuelType =
        normalizeFilterValue(params.get(APP_CONFIG.QUERY_KEYS.FUEL_TYPE)) ||
        normalizeFilterValue(params.get(APP_CONFIG.QUERY_KEYS.FUEL_SHORT));

    const transmission =
        normalizeFilterValue(params.get(APP_CONFIG.QUERY_KEYS.TRANSMISSION)) ||
        normalizeFilterValue(params.get(APP_CONFIG.QUERY_KEYS.TRANSMISSION_SHORT));

    const text = normalizeSearchText(params.get(APP_CONFIG.QUERY_KEYS.TEXT));

    return {
        brand,
        model,
        bodyType,
        fuelType,
        transmission,

        minPrice: normalizeNumericFilter(params.get(APP_CONFIG.QUERY_KEYS.MIN_PRICE), APP_CONFIG.LIMITS.MIN_PRICE),
        maxPrice: normalizeNumericFilter(params.get(APP_CONFIG.QUERY_KEYS.MAX_PRICE), Infinity),

        minYear: normalizeNumericFilter(params.get(APP_CONFIG.QUERY_KEYS.MIN_YEAR), APP_CONFIG.LIMITS.MIN_YEAR),
        maxYear: normalizeNumericFilter(params.get(APP_CONFIG.QUERY_KEYS.MAX_YEAR), APP_CONFIG.LIMITS.MAX_YEAR),

        minMileage: normalizeNumericFilter(params.get(APP_CONFIG.QUERY_KEYS.MIN_MILEAGE), APP_CONFIG.LIMITS.MIN_MILEAGE),
        maxMileage: normalizeNumericFilter(params.get(APP_CONFIG.QUERY_KEYS.MAX_MILEAGE), APP_CONFIG.LIMITS.MAX_MILEAGE),

        text
    };
}

function doesCarMatchFilters(car, filters) {
    const brandMatch = matchesExactFilter(car.brand, filters.brand);
    const modelMatch = matchesExactFilter(car.model, filters.model);
    const bodyTypeMatch = matchesExactFilter(car.bodyType, filters.bodyType);
    const fuelMatch = matchesExactFilter(car.fuelType, filters.fuelType);
    const transmissionMatch = matchesExactFilter(car.transmission, filters.transmission);

    const priceMatch = isNumberInRange(car.price, filters.minPrice, filters.maxPrice);
    const yearMatch = isNumberInRange(car.year, filters.minYear, filters.maxYear);
    const mileageMatch = isNumberInRange(car.mileage, filters.minMileage, filters.maxMileage);

    const textMatch = matchesFreeTextSearch(car, filters.text);

    return (
        brandMatch &&
        modelMatch &&
        bodyTypeMatch &&
        fuelMatch &&
        transmissionMatch &&
        priceMatch &&
        yearMatch &&
        mileageMatch &&
        textMatch
    );
}

function matchesExactFilter(value, filterValue) {
    if (!filterValue) {
        return true;
    }

    if (filterValue === "all") {
        return true;
    }

    return normalizeForSearch(value) === normalizeForSearch(filterValue);
}

function isNumberInRange(value, min, max) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return false;
    }

    return number >= min && number <= max;
}

function matchesFreeTextSearch(car, searchText) {
    if (!searchText) {
        return true;
    }

    const normalizedSearchText = normalizeForSearch(searchText);

    if (!normalizedSearchText) {
        return true;
    }

    const searchableValues = [
        car.brand,
        car.model,
        car.title,
        car.description,
        car.fuelType,
        car.transmission,
        car.bodyType,
        car.color,
        car.condition,
        car.location,
        String(car.year),
        ...car.searchKeywords
    ];

    return searchableValues.some((value) => {
        return normalizeForSearch(value).includes(normalizedSearchText);
    });
}


/**
 * ============================================================
 * 8. عرض السيارات في الصفحة
 * ============================================================
 */

function render(data) {
    const grid = elements.carsGrid;

    if (!grid) {
        return;
    }

    clearElement(grid);

    if (!Array.isArray(data) || data.length === 0) {
        renderEmptyState(grid);
        return;
    }

    const fragment = document.createDocumentFragment();

    data.forEach((car) => {
        const card = createCarCard(car);
        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
}

function createCarCard(car) {
    const card = document.createElement("article");
    card.className = "car-card";
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Visa detaljer för ${buildCarTitle(car.brand, car.model, car.year)}`);

    card.addEventListener("click", () => {
        navigateToDetails(car.id);
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigateToDetails(car.id);
        }
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "car-image-wrapper";

    const image = document.createElement("img");
    image.className = "car-image";
    image.loading = "lazy";
    image.decoding = "async";
    image.alt = buildImageAltText(car);
    image.src = getSafeImageURL(car.mainImage);

    image.addEventListener("error", () => {
        image.src = APP_CONFIG.ROUTES.PLACEHOLDER_IMAGE;
    });

    imageWrapper.appendChild(image);

    const content = document.createElement("div");
    content.className = "card-content";

    const priceTag = document.createElement("div");
    priceTag.className = "price-tag";
    priceTag.textContent = formatPrice(car.price);

    const title = document.createElement("div");
    title.className = "car-title";
    title.textContent = buildCarTitle(car.brand, car.model, car.year);

    const meta = document.createElement("div");
    meta.className = "car-meta";
    meta.textContent = buildCarMeta(car);

    content.appendChild(priceTag);
    content.appendChild(title);
    content.appendChild(meta);

    const extraMeta = createExtraMetaRow(car);

    if (extraMeta) {
        content.appendChild(extraMeta);
    }

    const description = createDescriptionElement(car.description);

    if (description) {
        content.appendChild(description);
    }

    card.appendChild(imageWrapper);
    card.appendChild(content);

    return card;
}

function createExtraMetaRow(car) {
    const values = [
        car.transmission,
        car.bodyType,
        car.location
    ].filter(Boolean);

    if (values.length === 0) {
        return null;
    }

    const row = document.createElement("div");
    row.className = "car-extra-meta";
    row.textContent = values.join(" • ");

    return row;
}

function createDescriptionElement(descriptionText) {
    const cleanDescription = normalizeText(descriptionText);

    if (!cleanDescription) {
        return null;
    }

    const description = document.createElement("p");
    description.className = "car-short-description";
    description.textContent = truncateText(cleanDescription, APP_CONFIG.LIMITS.CARD_DESCRIPTION_MAX_LENGTH);

    return description;
}

function renderEmptyState(container) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.style.gridColumn = "1 / -1";
    empty.style.textAlign = "center";
    empty.style.padding = "42px 18px";

    const icon = document.createElement("div");
    icon.className = "empty-state-icon";
    icon.textContent = "🚗";
    icon.style.fontSize = "44px";
    icon.style.marginBottom = "14px";

    const title = document.createElement("h3");
    title.textContent = "Inga fordon hittades";
    title.style.fontSize = "22px";
    title.style.fontWeight = "900";
    title.style.marginBottom = "8px";
    title.style.color = "#0f172a";

    const message = document.createElement("p");
    message.textContent = "Prova att ändra filter, söka med ett annat ord eller visa alla annonser.";
    message.style.color = "#64748b";
    message.style.fontWeight = "600";
    message.style.lineHeight = "1.7";
    message.style.marginBottom = "18px";

    const link = document.createElement("a");
    link.href = APP_CONFIG.ROUTES.RESULTS;
    link.textContent = "Visa alla annonser";
    link.style.display = "inline-flex";
    link.style.alignItems = "center";
    link.style.justifyContent = "center";
    link.style.padding = "12px 18px";
    link.style.borderRadius = "999px";
    link.style.background = "#f58220";
    link.style.color = "white";
    link.style.fontWeight = "900";
    link.style.textDecoration = "none";

    empty.appendChild(icon);
    empty.appendChild(title);
    empty.appendChild(message);
    empty.appendChild(link);

    container.appendChild(empty);
}


/**
 * ============================================================
 * 9. حالات التحميل والخطأ
 * ============================================================
 */

function setLoadingState(message) {
    const grid = elements.carsGrid;

    if (!grid) {
        return;
    }

    clearElement(grid);

    const loading = document.createElement("div");
    loading.className = "loading-state";
    loading.style.gridColumn = "1 / -1";
    loading.style.textAlign = "center";
    loading.style.padding = "42px 18px";
    loading.style.color = "#64748b";
    loading.style.fontWeight = "800";

    const spinner = document.createElement("div");
    spinner.textContent = "⏳";
    spinner.style.fontSize = "38px";
    spinner.style.marginBottom = "12px";

    const text = document.createElement("p");
    text.textContent = message || "Laddar...";

    loading.appendChild(spinner);
    loading.appendChild(text);

    grid.appendChild(loading);
}

function setErrorState({ title, message, actionText, onAction }) {
    const grid = elements.carsGrid;

    if (!grid) {
        return;
    }

    clearElement(grid);

    const errorBox = document.createElement("div");
    errorBox.className = "error-state";
    errorBox.style.gridColumn = "1 / -1";
    errorBox.style.textAlign = "center";
    errorBox.style.padding = "42px 18px";

    const icon = document.createElement("div");
    icon.textContent = "⚠️";
    icon.style.fontSize = "42px";
    icon.style.marginBottom = "12px";

    const heading = document.createElement("h3");
    heading.textContent = title || "Ett fel uppstod";
    heading.style.fontSize = "22px";
    heading.style.fontWeight = "900";
    heading.style.color = "#0f172a";
    heading.style.marginBottom = "8px";

    const paragraph = document.createElement("p");
    paragraph.textContent = message || "Försök igen senare.";
    paragraph.style.color = "#64748b";
    paragraph.style.fontWeight = "600";
    paragraph.style.lineHeight = "1.7";
    paragraph.style.marginBottom = "18px";

    errorBox.appendChild(icon);
    errorBox.appendChild(heading);
    errorBox.appendChild(paragraph);

    if (typeof onAction === "function") {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = actionText || "Försök igen";
        button.style.border = "none";
        button.style.borderRadius = "999px";
        button.style.background = "#0f172a";
        button.style.color = "white";
        button.style.padding = "12px 18px";
        button.style.fontWeight = "900";
        button.style.cursor = "pointer";

        button.addEventListener("click", onAction);

        errorBox.appendChild(button);
    }

    grid.appendChild(errorBox);
}

function updateResultTitleForSearch(count) {
    const resultTitle = elements.resultTitle;

    if (!resultTitle) {
        return;
    }

    if (count > 0) {
        resultTitle.textContent = `Hittade ${count} ${count === 1 ? "bil" : "bilar"} som matchar din sökning`;
    } else {
        resultTitle.textContent = "Inga bilar matchade din sökning";
    }
}

function updateResultTitleForDefaultView(count) {
    const resultTitle = elements.resultTitle;

    if (!resultTitle) {
        return;
    }

    if (count > 0) {
        resultTitle.textContent = `Senaste annonserna`;
    } else {
        resultTitle.textContent = "Inga annonser finns just nu";
    }
}


/**
 * ============================================================
 * 10. تنقل آمن
 * ============================================================
 */

function navigateToDetails(carId) {
    const safeId = normalizeDocumentId(carId);

    if (!safeId) {
        return;
    }

    const encodedId = encodeURIComponent(safeId);
    window.location.href = `${APP_CONFIG.ROUTES.DETAILS}?id=${encodedId}`;
}


/**
 * ============================================================
 * 11. تنسيق النصوص والأرقام
 * ============================================================
 */

function buildCarTitle(brand, model, year) {
    const parts = [
        normalizeText(brand),
        normalizeText(model)
    ].filter(Boolean);

    const baseTitle = parts.length > 0 ? parts.join(" ") : "Okänd bil";

    if (Number.isFinite(Number(year)) && Number(year) > 0) {
        return `${baseTitle} ${Number(year)}`;
    }

    return baseTitle;
}

function buildCarMeta(car) {
    const year = Number.isFinite(Number(car.year)) && Number(car.year) > 0
        ? String(car.year)
        : "År saknas";

    const mileage = Number.isFinite(Number(car.mileage))
        ? `${formatNumber(car.mileage)} mil`
        : "Miltal saknas";

    const fuel = car.fuelType || "Bränsle saknas";

    return `${year} • ${mileage} • ${fuel}`;
}

function buildImageAltText(car) {
    return `Bild på ${buildCarTitle(car.brand, car.model, car.year)}`;
}

function formatPrice(price) {
    const number = Number(price);

    if (!Number.isFinite(number) || number <= 0) {
        return "Pris saknas";
    }

    return `${formatNumber(number)} kr`;
}

function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "";
    }

    return number.toLocaleString("sv-SE");
}

function truncateText(value, maxLength) {
    const text = normalizeText(value);

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength).trim()}...`;
}

function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeForSearch(value) {
    return normalizeText(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function normalizeSearchText(value) {
    return normalizeForSearch(value)
        .slice(0, APP_CONFIG.LIMITS.SEARCH_TEXT_MAX_LENGTH);
}

function normalizeFilterValue(value) {
    const normalized = normalizeText(value);

    if (!normalized) {
        return "";
    }

    if (normalized.toLowerCase() === "all") {
        return "all";
    }

    return normalized;
}

function normalizeNumericFilter(value, fallback) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return number;
}

function toSafeNumber(value, fallback = 0) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return number;
}

function normalizeDocumentId(value) {
    return String(value ?? "")
        .trim()
        .replace(/[^\w.-]/g, "");
}


/**
 * ============================================================
 * 12. حماية روابط الصور
 * ============================================================
 */

function normalizeURL(value) {
    const url = normalizeText(value);

    if (!url) {
        return "";
    }

    if (url === APP_CONFIG.ROUTES.PLACEHOLDER_IMAGE) {
        return url;
    }

    try {
        const parsedUrl = new URL(url, window.location.origin);

        const allowedProtocols = ["http:", "https:"];

        if (!allowedProtocols.includes(parsedUrl.protocol)) {
            return "";
        }

        return parsedUrl.href;
    } catch {
        return "";
    }
}

function getSafeImageURL(value) {
    const normalized = normalizeURL(value);

    if (!normalized) {
        return APP_CONFIG.ROUTES.PLACEHOLDER_IMAGE;
    }

    return normalized;
}


/**
 * ============================================================
 * 13. أدوات DOM آمنة
 * ============================================================
 */

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}


/**
 * ============================================================
 * 14. حماية عامة من أخطاء الصفحة
 * ============================================================
 */

function attachGlobalErrorProtection() {
    window.addEventListener("beforeunload", () => {
        cleanupUnreadMessagesListener();
    });

    window.addEventListener("error", (event) => {
        console.error("Global script error:", event.error || event.message);
    });

    window.addEventListener("unhandledrejection", (event) => {
        console.error("Unhandled promise rejection:", event.reason);
    });
}


/**
 * ============================================================
 * 15. إتاحة بعض الدوال للاختبار اليدوي من Console
 * ------------------------------------------------------------
 * مفيد أثناء التطوير فقط.
 * لا يعطي صلاحيات إضافية ولا يتجاوز Firebase Rules.
 * ============================================================
 */

window.BILHK_APP = Object.freeze({
    getAllCars: () => [...appState.allCars],
    getFilteredCars: () => [...appState.filteredCars],
    reloadCars: () => initApp(),
    applyCurrentUrlSearch: () => applyDeepSearch(new URLSearchParams(window.location.search))
});
