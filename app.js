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
 * VORQ Fordon - app.js
 * ------------------------------------------------------------
 * Central file for car listing display, filtering, search,
 * safe navigation, and header state.
 *
 * Security and consistency goals:
 * 1. Do not inject Firestore user data through innerHTML.
 * 2. Normalize modern and legacy car schema names safely.
 * 3. Support old and new query parameter names.
 * 4. Keep existing routes and visual classes used by pages.
 * 5. Handle missing/invalid data without breaking the page.
 * 6. Clean up Firestore listeners correctly.
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
        BRAND: ["brand"],
        MODEL: ["model"],
        BODY_TYPE: ["bodyType", "karosseri", "kar", "body"],
        FUEL_TYPE: ["fuelType", "fuel", "drivmedel"],
        TRANSMISSION: ["transmission", "gear", "gearbox", "vaxellada", "växellåda"],
        DRIVETRAIN: ["drivetrain", "drive", "drivning"],
        COUNTY: ["county", "lan", "län"],
        LOCATION: ["location", "city", "stad", "place"],
        CONDITION: ["condition", "skick"],
        COLOR: ["color", "farg", "färg"],
        DOORS: ["doors", "dorrar", "dörrar"],
        SEATS: ["seats", "saten", "säten"],
        FEATURES: ["features", "feature", "equipment", "utrustning"],
        TEXT: ["text", "q", "query", "search"],
        MIN_PRICE: ["minPrice", "minP", "priceMin"],
        MAX_PRICE: ["maxPrice", "maxP", "priceMax"],
        MIN_YEAR: ["minYear", "minY", "yearMin"],
        MAX_YEAR: ["maxYear", "maxY", "yearMax"],
        MIN_MILEAGE: ["minMileage", "minM", "mileageMin"],
        MAX_MILEAGE: ["maxMileage", "maxM", "mileageMax"],
        MIN_HP: ["minHp", "minHorsepower", "hpMin"],
        MAX_HP: ["maxHp", "maxHorsepower", "hpMax"]
    },

    LIMITS: {
        SEARCH_TEXT_MAX_LENGTH: 120,
        FILTER_TEXT_MAX_LENGTH: 100,
        CARD_DESCRIPTION_MAX_LENGTH: 120,
        MIN_YEAR: 1900,
        MAX_YEAR: 2030,
        MIN_PRICE: 0,
        MAX_PRICE: 20000000,
        MIN_MILEAGE: 0,
        MAX_MILEAGE: 2000000,
        MIN_HP: 0,
        MAX_HP: 2500,
        MAX_FEATURES_FILTERS: 30,
        MAX_CARDS_RENDERED: 500
    },

    UI: {
        GRID_ID: "carsGrid",
        RESULT_TITLE_ID: "resultTitle",
        AUTH_BUTTON_ID: "authButton",
        MESSAGE_LINK_ID: "msgLink",
        MESSAGE_BADGE_ID: "msgBadge"
    },

    SAFE_IMAGE_PROTOCOLS: ["http:", "https:"],
    SAFE_IMAGE_EXTENSIONS: ["jpg", "jpeg", "png", "webp", "avif", "gif"]
};

const appState = {
    allCars: [],
    filteredCars: [],
    currentUser: null,
    unreadMessagesUnsubscribe: null,
    hasLoadedCars: false,
    isLoadingCars: false,
    lastFilters: null
};

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

initializeApplication();

function initializeApplication() {
    attachGlobalErrorProtection();
    attachAuthObserver();
    initApp();
}

function attachAuthObserver() {
    onAuthStateChanged(auth, (user) => {
        cleanupUnreadMessagesListener();

        if (user) {
            appState.currentUser = user;
            updateHeaderForLoggedInUser();
            startUnreadMessagesListener(user.uid);
            return;
        }

        appState.currentUser = null;
        updateHeaderForGuestUser();
    });
}

function updateHeaderForLoggedInUser() {
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
        msgLink.removeAttribute("href");
    }

    updateUnreadBadge(0);
}

function startUnreadMessagesListener(userId) {
    const safeUserId = normalizePlainId(userId);

    if (!safeUserId) {
        updateUnreadBadge(0);
        return;
    }

    try {
        const unreadMessagesQuery = query(
            collection(db, APP_CONFIG.COLLECTIONS.MESSAGES),
            where("receiverId", "==", safeUserId),
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

    const safeCount = clampNumber(toSafeNumber(count, 0), 0, 9999);
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

async function initApp() {
    const grid = elements.carsGrid;

    if (!grid) {
        return;
    }

    if (appState.isLoadingCars) {
        return;
    }

    setLoadingState("Laddar fordon...");
    appState.isLoadingCars = true;

    try {
        const snapshot = await fetchCarsSnapshot();

        const cars = snapshot.docs
            .map((documentSnapshot) => normalizeCarDocument(documentSnapshot.id, documentSnapshot.data()))
            .filter((car) => shouldDisplayCar(car));

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

async function fetchCarsSnapshot() {
    try {
        const carsQuery = query(
            collection(db, APP_CONFIG.COLLECTIONS.CARS),
            orderBy("createdAt", "desc")
        );

        return await getDocs(carsQuery);
    } catch (error) {
        console.warn("Ordered cars query failed; falling back to unordered query:", error);
        return await getDocs(collection(db, APP_CONFIG.COLLECTIONS.CARS));
    }
}

function normalizeCarDocument(id, data) {
    const source = isPlainObject(data) ? data : {};
    const rawImages = getImageArray(source);
    const imageUrls = rawImages.map((url) => normalizeURL(url)).filter(Boolean);

    const brand = normalizeText(source.brand);
    const model = normalizeText(source.model);
    const year = clampNumber(toSafeNumber(source.year, 0), 0, APP_CONFIG.LIMITS.MAX_YEAR);
    const price = clampNumber(toSafeNumber(source.price, 0), APP_CONFIG.LIMITS.MIN_PRICE, APP_CONFIG.LIMITS.MAX_PRICE);
    const mileage = clampNumber(toSafeNumber(source.mileage, 0), APP_CONFIG.LIMITS.MIN_MILEAGE, APP_CONFIG.LIMITS.MAX_MILEAGE);

    const fuelType = normalizeText(firstDefined(source.fuelType, source.fuel, source.drivmedel));
    const transmission = normalizeText(firstDefined(source.transmission, source.gearbox, source.gear, source.vaxellada, source["växellåda"]));
    const drivetrain = normalizeText(firstDefined(source.drivetrain, source.drive, source.drivning));
    const bodyType = normalizeText(firstDefined(source.bodyType, source.karosseri, source.kar, source.body));
    const horsepower = clampNullableNumber(firstDefined(source.horsepower, source.hp, source.hastkrafter, source["hästkrafter"]), APP_CONFIG.LIMITS.MIN_HP, APP_CONFIG.LIMITS.MAX_HP);
    const inspectionUntil = normalizeText(firstDefined(source.inspectionUntil, source.besiktning, source.inspection));

    const comfortFeatures = normalizeTextArray(source.comfortFeatures);
    const safetyFeatures = normalizeTextArray(source.safetyFeatures);
    const equipmentFeatures = normalizeTextArray(source.equipmentFeatures);
    const genericFeatures = normalizeTextArray(source.features);
    const features = uniqueStrings([...genericFeatures, ...comfortFeatures, ...safetyFeatures, ...equipmentFeatures]);

    const normalizedId = normalizeDocumentId(id);

    return {
        id: normalizedId,
        rawId: String(id ?? ""),
        schemaVersion: toSafeNumber(source.schemaVersion, 1),

        brand,
        model,
        title: normalizeText(source.title) || buildCarTitle(brand, model, year),

        year,
        price,
        mileage,

        fuelType,
        fuel: fuelType,
        transmission,
        gearbox: transmission,
        drivetrain,
        drive: drivetrain,
        bodyType,
        karosseri: bodyType,
        horsepower,
        hp: horsepower,
        inspectionUntil,
        besiktning: inspectionUntil,

        color: normalizeText(source.color),
        condition: normalizeText(source.condition),
        county: normalizeText(firstDefined(source.county, source.lan, source["län"])),
        location: normalizeText(firstDefined(source.location, source.city, source.stad, source.place)),
        owners: clampNullableNumber(source.owners, 0, 100),
        doors: normalizeText(source.doors),
        seats: normalizeText(source.seats),
        engineSize: clampNullableNumber(source.engineSize, 0, 30),
        batteryRange: clampNullableNumber(source.batteryRange, 0, 2000),
        interiorColor: normalizeText(source.interiorColor),
        upholstery: normalizeText(source.upholstery),
        tax: clampNullableNumber(source.tax, 0, 1000000),

        description: normalizeText(source.description),

        comfortFeatures,
        safetyFeatures,
        equipmentFeatures,
        features,
        featureKeywords: normalizeTextArray(source.featureKeywords).map(normalizeForSearch).filter(Boolean),

        images: imageUrls,
        imageFiles: Array.isArray(source.imageFiles) ? source.imageFiles : [],
        mainImage: normalizeURL(source.mainImage) || imageUrls[0] || APP_CONFIG.ROUTES.PLACEHOLDER_IMAGE,

        sellerId: normalizePlainId(source.sellerId),
        sellerEmail: normalizeText(source.sellerEmail),
        sellerName: normalizeText(source.sellerName),

        active: source.active !== false,
        status: normalizeText(source.status || "active"),
        isDeleted: source.isDeleted === true,

        views: toSafeNumber(source.views, 0),
        favoritesCount: toSafeNumber(source.favoritesCount, 0),
        createdAt: source.createdAt || null,
        updatedAt: source.updatedAt || null,

        searchKeywords: normalizeTextArray(source.searchKeywords).map(normalizeForSearch).filter(Boolean)
    };
}

function getImageArray(source) {
    if (Array.isArray(source.images)) {
        return source.images;
    }

    if (Array.isArray(source.imageUrls)) {
        return source.imageUrls;
    }

    if (source.image) {
        return [source.image];
    }

    if (source.mainImage) {
        return [source.mainImage];
    }

    return [];
}

function shouldDisplayCar(car) {
    if (!car || !car.id) {
        return false;
    }

    if (car.isDeleted === true || car.active === false) {
        return false;
    }

    const status = normalizeForSearch(car.status || "active");

    if (status && !["active", "published", "publicerad"].includes(status)) {
        return false;
    }

    if (!car.brand && !car.model && !car.title) {
        return false;
    }

    return true;
}

function hasSearchParameters(params) {
    const supportedKeys = Object.values(APP_CONFIG.QUERY_KEYS).flat();
    return supportedKeys.some((key) => {
        const value = params.get(key);
        return value !== null && normalizeText(value) !== "";
    });
}

function applyDeepSearch(params) {
    const filters = extractFiltersFromParams(params);
    appState.lastFilters = filters;

    const filtered = appState.allCars.filter((car) => doesCarMatchFilters(car, filters));
    appState.filteredCars = filtered;

    render(filtered);
    updateResultTitleForSearch(filtered.length);
}

function extractFiltersFromParams(params) {
    const features = getAllParamValues(params, APP_CONFIG.QUERY_KEYS.FEATURES)
        .flatMap((value) => splitFilterList(value))
        .map(normalizeFilterValue)
        .filter(Boolean)
        .slice(0, APP_CONFIG.LIMITS.MAX_FEATURES_FILTERS);

    return {
        brand: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.BRAND)),
        model: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.MODEL)),
        bodyType: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.BODY_TYPE)),
        fuelType: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.FUEL_TYPE)),
        transmission: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.TRANSMISSION)),
        drivetrain: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.DRIVETRAIN)),
        county: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.COUNTY)),
        location: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.LOCATION)),
        condition: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.CONDITION)),
        color: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.COLOR)),
        doors: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.DOORS)),
        seats: normalizeFilterValue(getFirstParam(params, APP_CONFIG.QUERY_KEYS.SEATS)),
        features,

        minPrice: normalizeNumericFilter(getFirstParam(params, APP_CONFIG.QUERY_KEYS.MIN_PRICE), APP_CONFIG.LIMITS.MIN_PRICE, APP_CONFIG.LIMITS.MIN_PRICE, APP_CONFIG.LIMITS.MAX_PRICE),
        maxPrice: normalizeNumericFilter(getFirstParam(params, APP_CONFIG.QUERY_KEYS.MAX_PRICE), APP_CONFIG.LIMITS.MAX_PRICE, APP_CONFIG.LIMITS.MIN_PRICE, APP_CONFIG.LIMITS.MAX_PRICE),
        minYear: normalizeNumericFilter(getFirstParam(params, APP_CONFIG.QUERY_KEYS.MIN_YEAR), APP_CONFIG.LIMITS.MIN_YEAR, APP_CONFIG.LIMITS.MIN_YEAR, APP_CONFIG.LIMITS.MAX_YEAR),
        maxYear: normalizeNumericFilter(getFirstParam(params, APP_CONFIG.QUERY_KEYS.MAX_YEAR), APP_CONFIG.LIMITS.MAX_YEAR, APP_CONFIG.LIMITS.MIN_YEAR, APP_CONFIG.LIMITS.MAX_YEAR),
        minMileage: normalizeNumericFilter(getFirstParam(params, APP_CONFIG.QUERY_KEYS.MIN_MILEAGE), APP_CONFIG.LIMITS.MIN_MILEAGE, APP_CONFIG.LIMITS.MIN_MILEAGE, APP_CONFIG.LIMITS.MAX_MILEAGE),
        maxMileage: normalizeNumericFilter(getFirstParam(params, APP_CONFIG.QUERY_KEYS.MAX_MILEAGE), APP_CONFIG.LIMITS.MAX_MILEAGE, APP_CONFIG.LIMITS.MIN_MILEAGE, APP_CONFIG.LIMITS.MAX_MILEAGE),
        minHp: normalizeNumericFilter(getFirstParam(params, APP_CONFIG.QUERY_KEYS.MIN_HP), APP_CONFIG.LIMITS.MIN_HP, APP_CONFIG.LIMITS.MIN_HP, APP_CONFIG.LIMITS.MAX_HP),
        maxHp: normalizeNumericFilter(getFirstParam(params, APP_CONFIG.QUERY_KEYS.MAX_HP), APP_CONFIG.LIMITS.MAX_HP, APP_CONFIG.LIMITS.MIN_HP, APP_CONFIG.LIMITS.MAX_HP),

        text: normalizeSearchText(getFirstParam(params, APP_CONFIG.QUERY_KEYS.TEXT))
    };
}

function doesCarMatchFilters(car, filters) {
    return (
        matchesExactFilter(car.brand, filters.brand) &&
        matchesExactFilter(car.model, filters.model) &&
        matchesExactFilter(car.bodyType, filters.bodyType) &&
        matchesExactFilter(car.fuelType, filters.fuelType) &&
        matchesExactFilter(car.transmission, filters.transmission) &&
        matchesExactFilter(car.drivetrain, filters.drivetrain) &&
        matchesExactFilter(car.county, filters.county) &&
        matchesPartialFilter(car.location, filters.location) &&
        matchesExactFilter(car.condition, filters.condition) &&
        matchesExactFilter(car.color, filters.color) &&
        matchesExactFilter(car.doors, filters.doors) &&
        matchesExactFilter(car.seats, filters.seats) &&
        isNumberInRange(car.price, filters.minPrice, filters.maxPrice) &&
        isNumberInRange(car.year, filters.minYear, filters.maxYear) &&
        isNumberInRange(car.mileage, filters.minMileage, filters.maxMileage) &&
        isNullableNumberInRange(car.horsepower, filters.minHp, filters.maxHp) &&
        matchesFeatureFilters(car, filters.features) &&
        matchesFreeTextSearch(car, filters.text)
    );
}

function matchesExactFilter(value, filterValue) {
    if (!filterValue || filterValue === "all") {
        return true;
    }

    return normalizeForSearch(value) === normalizeForSearch(filterValue);
}

function matchesPartialFilter(value, filterValue) {
    if (!filterValue || filterValue === "all") {
        return true;
    }

    return normalizeForSearch(value).includes(normalizeForSearch(filterValue));
}

function isNumberInRange(value, min, max) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return false;
    }

    return number >= min && number <= max;
}

function isNullableNumberInRange(value, min, max) {
    if (value === null || value === undefined || value === "") {
        return min <= 0;
    }

    return isNumberInRange(value, min, max);
}

function matchesFeatureFilters(car, featureFilters) {
    if (!Array.isArray(featureFilters) || featureFilters.length === 0) {
        return true;
    }

    const carFeatureSet = new Set([
        ...normalizeTextArray(car.features),
        ...normalizeTextArray(car.comfortFeatures),
        ...normalizeTextArray(car.safetyFeatures),
        ...normalizeTextArray(car.equipmentFeatures),
        ...normalizeTextArray(car.featureKeywords)
    ].map(normalizeForSearch));

    return featureFilters.every((feature) => carFeatureSet.has(normalizeForSearch(feature)));
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
        car.drivetrain,
        car.bodyType,
        car.color,
        car.condition,
        car.county,
        car.location,
        String(car.year || ""),
        String(car.price || ""),
        String(car.mileage || ""),
        ...normalizeTextArray(car.features),
        ...normalizeTextArray(car.searchKeywords)
    ];

    return searchableValues.some((value) => normalizeForSearch(value).includes(normalizedSearchText));
}

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
    const visibleCars = data.slice(0, APP_CONFIG.LIMITS.MAX_CARDS_RENDERED);

    visibleCars.forEach((car) => {
        const card = createCarCard(car);
        fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    if (data.length > visibleCars.length) {
        renderLimitNotice(grid, data.length, visibleCars.length);
    }
}

function createCarCard(car) {
    const card = document.createElement("article");
    card.className = "car-card";
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Visa detaljer för ${buildCarTitle(car.brand, car.model, car.year)}`);

    card.addEventListener("click", () => navigateToDetails(car.id));
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
        if (image.src !== APP_CONFIG.ROUTES.PLACEHOLDER_IMAGE) {
            image.src = APP_CONFIG.ROUTES.PLACEHOLDER_IMAGE;
        }
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

    content.append(priceTag, title, meta);

    const extraMeta = createExtraMetaRow(car);
    if (extraMeta) content.appendChild(extraMeta);

    const description = createDescriptionElement(car.description);
    if (description) content.appendChild(description);

    card.append(imageWrapper, content);
    return card;
}

function createExtraMetaRow(car) {
    const values = [
        car.transmission,
        car.bodyType,
        car.drivetrain,
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

    empty.append(icon, title, message, link);
    container.appendChild(empty);
}

function renderLimitNotice(container, totalCount, visibleCount) {
    const notice = document.createElement("div");
    notice.className = "result-limit-notice";
    notice.style.gridColumn = "1 / -1";
    notice.style.textAlign = "center";
    notice.style.padding = "18px";
    notice.style.color = "#64748b";
    notice.style.fontWeight = "700";
    notice.textContent = `Visar ${visibleCount} av ${totalCount} annonser. Förfina sökningen för snabbare resultat.`;
    container.appendChild(notice);
}

function setLoadingState(message) {
    const grid = elements.carsGrid;
    if (!grid) return;

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

    loading.append(spinner, text);
    grid.appendChild(loading);
}

function setErrorState({ title, message, actionText, onAction }) {
    const grid = elements.carsGrid;
    if (!grid) return;

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

    errorBox.append(icon, heading, paragraph);

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
    if (!resultTitle) return;

    resultTitle.textContent = count > 0
        ? `Hittade ${count} ${count === 1 ? "bil" : "bilar"} som matchar din sökning`
        : "Inga bilar matchade din sökning";
}

function updateResultTitleForDefaultView(count) {
    const resultTitle = elements.resultTitle;
    if (!resultTitle) return;

    resultTitle.textContent = count > 0 ? "Senaste annonserna" : "Inga annonser finns just nu";
}

function navigateToDetails(carId) {
    const safeId = normalizeDocumentId(carId);
    if (!safeId) return;

    window.location.href = `${APP_CONFIG.ROUTES.DETAILS}?id=${encodeURIComponent(safeId)}`;
}

function buildCarTitle(brand, model, year) {
    const parts = [normalizeText(brand), normalizeText(model)].filter(Boolean);
    const baseTitle = parts.length > 0 ? parts.join(" ") : "Okänd bil";

    if (Number.isFinite(Number(year)) && Number(year) > 0) {
        return `${baseTitle} ${Number(year)}`;
    }

    return baseTitle;
}

function buildCarMeta(car) {
    const year = Number.isFinite(Number(car.year)) && Number(car.year) > 0 ? String(car.year) : "År saknas";
    const mileage = Number.isFinite(Number(car.mileage)) ? `${formatNumber(car.mileage)} mil` : "Miltal saknas";
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
    return Number.isFinite(number) ? number.toLocaleString("sv-SE") : "";
}

function truncateText(value, maxLength) {
    const text = normalizeText(value);
    const safeMaxLength = Math.max(0, Number(maxLength) || 0);

    if (text.length <= safeMaxLength) {
        return text;
    }

    return `${text.slice(0, safeMaxLength).trim()}...`;
}

function normalizeText(value) {
    return String(value ?? "")
        .replace(/[\u0000-\u001F\u007F]/g, " ")
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
    return normalizeForSearch(value).slice(0, APP_CONFIG.LIMITS.SEARCH_TEXT_MAX_LENGTH);
}

function normalizeFilterValue(value) {
    const normalized = normalizeText(value).slice(0, APP_CONFIG.LIMITS.FILTER_TEXT_MAX_LENGTH);

    if (!normalized) {
        return "";
    }

    if (normalizeForSearch(normalized) === "all") {
        return "all";
    }

    return normalized;
}

function normalizeNumericFilter(value, fallback, min, max) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return clampNumber(number, min, max);
}

function toSafeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(Math.max(number, min), max);
}

function clampNullableNumber(value, min, max) {
    if (value === null || value === undefined || normalizeText(value) === "") {
        return null;
    }

    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return clampNumber(number, min, max);
}

function normalizeDocumentId(value) {
    const id = String(value ?? "").trim();

    if (!/^[A-Za-z0-9_-]{1,160}$/.test(id)) {
        return "";
    }

    return id;
}

function normalizePlainId(value) {
    return String(value ?? "")
        .trim()
        .replace(/[^A-Za-z0-9_.:@-]/g, "")
        .slice(0, 200);
}

function normalizeURL(value) {
    const url = normalizeText(value);

    if (!url) {
        return "";
    }

    if (url === APP_CONFIG.ROUTES.PLACEHOLDER_IMAGE) {
        return url;
    }

    if (isSafeRelativeImagePath(url)) {
        return url;
    }

    try {
        const parsedUrl = new URL(url, window.location.origin);

        if (!APP_CONFIG.SAFE_IMAGE_PROTOCOLS.includes(parsedUrl.protocol)) {
            return "";
        }

        if (["javascript:", "data:", "vbscript:", "file:"].includes(parsedUrl.protocol)) {
            return "";
        }

        return parsedUrl.href;
    } catch {
        return "";
    }
}

function isSafeRelativeImagePath(value) {
    const text = normalizeText(value);

    if (!text || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(text)) {
        return false;
    }

    if (text.includes("\\") || text.includes("..")) {
        return false;
    }

    const lower = text.toLowerCase().split(/[?#]/)[0];
    const extension = lower.includes(".") ? lower.split(".").pop() : "";

    return APP_CONFIG.SAFE_IMAGE_EXTENSIONS.includes(extension);
}

function getSafeImageURL(value) {
    return normalizeURL(value) || APP_CONFIG.ROUTES.PLACEHOLDER_IMAGE;
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function getFirstParam(params, keys) {
    const keyList = Array.isArray(keys) ? keys : [keys];

    for (const key of keyList) {
        const value = params.get(key);
        if (value !== null && normalizeText(value) !== "") {
            return value;
        }
    }

    return "";
}

function getAllParamValues(params, keys) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    const values = [];

    keyList.forEach((key) => {
        params.getAll(key).forEach((value) => {
            if (normalizeText(value)) {
                values.push(value);
            }
        });
    });

    return values;
}

function splitFilterList(value) {
    return normalizeText(value)
        .split(/[|,;]/g)
        .map((item) => item.trim())
        .filter(Boolean);
}

function normalizeTextArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return uniqueStrings(value.map(normalizeText).filter(Boolean));
}

function uniqueStrings(values) {
    const seen = new Set();
    const result = [];

    values.forEach((value) => {
        const cleanValue = normalizeText(value);
        const key = normalizeForSearch(cleanValue);

        if (cleanValue && !seen.has(key)) {
            seen.add(key);
            result.push(cleanValue);
        }
    });

    return result;
}

function firstDefined(...values) {
    return values.find((value) => value !== undefined && value !== null && normalizeText(value) !== "") ?? "";
}

function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}

function attachGlobalErrorProtection() {
    window.addEventListener("beforeunload", () => cleanupUnreadMessagesListener());

    window.addEventListener("error", (event) => {
        console.error("Global script error:", event.error || event.message);
    });

    window.addEventListener("unhandledrejection", (event) => {
        console.error("Unhandled promise rejection:", event.reason);
    });
}

const VORQ_FORDON_APP_API = Object.freeze({
    getAllCars: () => [...appState.allCars],
    getFilteredCars: () => [...appState.filteredCars],
    getLastFilters: () => ({ ...(appState.lastFilters || {}) }),
    reloadCars: () => initApp(),
    applyCurrentUrlSearch: () => applyDeepSearch(new URLSearchParams(window.location.search)),
    normalizeCarDocument: (id, data) => normalizeCarDocument(id, data)
});

window.VORQ_FORDON_APP = VORQ_FORDON_APP_API;

/* Compatibility alias for older pages that may still read window.BILHK_APP. */
window.BILHK_APP = VORQ_FORDON_APP_API;
