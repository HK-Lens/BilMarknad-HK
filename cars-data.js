/**
 * cars-data.js
 * ============================================================
 * VORQ Fordon - Central Car Data Module
 * ------------------------------------------------------------
 * Owned and operated by VORQ Group
 * Contact: info@vorq.group
 * Vision • Operations • Reach • Quality
 * ------------------------------------------------------------
 * Central source for car brands and models used by:
 * add-car.html, sell.html, edit-car.html, filter.html, results.html,
 * dashboard.html and account pages.
 *
 * Security/design notes:
 * - This file contains public car metadata only.
 * - It never writes to Firebase and never trusts user-provided text.
 * - UI helpers use textContent/value, not innerHTML.
 * - Brand/model matching is normalized for accents, case and spacing.
 * - The public API is kept compatible with existing pages.
 * ============================================================
 */

export const CAR_DATA_CONFIG = Object.freeze({
    DEFAULT_BRAND_PLACEHOLDER: "Välj märke...",
    DEFAULT_MODEL_PLACEHOLDER: "Välj modell...",
    MODEL_DISABLED_PLACEHOLDER: "Välj märke först...",
    OTHER_BRAND_KEY: "Annat",
    OTHER_MODEL_VALUE: "Övrigt",
    LOCALE: "sv-SE",
    MIN_SEARCH_LENGTH: 1,
    MAX_SEARCH_LENGTH: 80,
    MAX_RESULTS: 100
});

const RAW_CAR_DATA = Object.freeze({
    "Volvo": ["S60","S90","V40","V60","V70","V90","XC40","XC60","XC90","C40 Recharge","EX30","EX40","EX90","240","740","850"],
    "Volkswagen": ["Polo","Golf","Passat","Arteon","Tiguan","Touareg","T-Roc","T-Cross","Touran","Sharan","Beetle","Scirocco","ID.3","ID.4","ID.5","ID.7","Caddy","Transporter"],
    "BMW": ["1-serie","2-serie","3-serie","4-serie","5-serie","6-serie","7-serie","8-serie","X1","X2","X3","X4","X5","X6","X7","i3","i4","i5","i7","iX","M2","M3","M4","M5","Z4"],
    "Mercedes-Benz": ["A-Klass","B-Klass","C-Klass","E-Klass","S-Klass","CLA","CLS","GLA","GLB","GLC","GLE","GLS","EQA","EQB","EQC","EQE","EQS","V-Klass","SL","Sprinter","Vito"],
    "Audi": ["A1","A3","A4","A5","A6","A7","A8","Q2","Q3","Q4 e-tron","Q5","Q7","Q8","e-tron","TT","R8","S3","S4","S5","RS3","RS4","RS5","RS6"],
    "Porsche": ["911","718 Cayman","718 Boxster","Cayenne","Macan","Panamera","Taycan"],
    "Polestar": ["Polestar 1","Polestar 2","Polestar 3","Polestar 4"],
    "Saab": ["9-3","9-5","9-3X","900","9000"],
    "Skoda": ["Fabia","Scala","Octavia","Superb","Kamiq","Karoq","Kodiaq","Enyaq","Roomster","Yeti"],
    "Seat": ["Ibiza","Leon","Arona","Ateca","Tarraco","Alhambra"],
    "Cupra": ["Born","Leon","Formentor","Ateca","Tavascan"],
    "Peugeot": ["107","108","206","207","208","2008","307","308","3008","407","508","5008","Partner","Expert"],
    "Renault": ["Clio","Megane","Talisman","Captur","Kadjar","Austral","Scenic","Espace","Zoe","Kangoo","Trafic"],
    "Citroën": ["C1","C3","C4","C5","C5 Aircross","Berlingo","Jumpy"],
    "Fiat": ["500","500e","500X","Panda","Punto","Tipo","Doblo","Ducato"],
    "Alfa Romeo": ["Giulia","Giulietta","Stelvio","Tonale","MiTo"],
    "Opel": ["Corsa","Astra","Insignia","Mokka","Crossland","Grandland","Zafira","Vivaro"],
    "Dacia": ["Sandero","Logan","Duster","Jogger","Spring"],
    "Ferrari": ["488","F8","812 Superfast","Roma","Portofino","SF90","Purosangue"],
    "Lamborghini": ["Huracán","Aventador","Urus","Revuelto"],
    "Maserati": ["Ghibli","Quattroporte","Levante","Grecale","GranTurismo"],
    "Toyota": ["Aygo","Yaris","Auris","Corolla","Avensis","Camry","Prius","C-HR","RAV4","Highlander","Land Cruiser","Hilux","GR Yaris","bZ4X"],
    "Honda": ["Jazz","Civic","Accord","HR-V","CR-V","Honda e","ZR-V"],
    "Nissan": ["Micra","Juke","Qashqai","X-Trail","Ariya","Leaf","Navara","370Z","GT-R"],
    "Mazda": ["Mazda2","Mazda3","Mazda6","CX-3","CX-30","CX-5","CX-60","MX-30","MX-5"],
    "Lexus": ["CT","IS","ES","GS","LS","UX","NX","RX","RZ","LC"],
    "Subaru": ["Impreza","Legacy","Outback","Forester","XV","Solterra","BRZ"],
    "Mitsubishi": ["Space Star","ASX","Eclipse Cross","Outlander","Outlander PHEV","L200","Pajero"],
    "Suzuki": ["Swift","Ignis","Baleno","Vitara","S-Cross","Jimny"],
    "Hyundai": ["i10","i20","i30","Bayon","Kona","Tucson","Santa Fe","Ioniq","Ioniq 5","Ioniq 6"],
    "Kia": ["Picanto","Rio","Ceed","XCeed","Niro","Sportage","Sorento","Stinger","EV3","EV6","EV9"],
    "BYD": ["Atto 3","Dolphin","Seal","Seal U","Han","Tang"],
    "MG": ["MG3","MG4","MG5","ZS","ZS EV","Marvel R","EHS"],
    "Aiways": ["U5","U6"],
    "Nio": ["ET5","ET7","EL6","EL7"],
    "XPeng": ["P7","G6","G9"],
    "Tesla": ["Model 3","Model S","Model X","Model Y","Cybertruck"],
    "Ford": ["Fiesta","Focus","Mondeo","Puma","Kuga","Explorer","Mustang","Mustang Mach-E","Ranger","F-150","Transit"],
    "Chevrolet": ["Spark","Cruze","Malibu","Camaro","Corvette","Bolt","Silverado","Tahoe","Suburban"],
    "Jeep": ["Renegade","Compass","Cherokee","Grand Cherokee","Wrangler","Avenger"],
    "Cadillac": ["CT4","CT5","XT4","XT5","Escalade","Lyriq"],
    "Dodge": ["Charger","Challenger","Durango","Ram"],
    "Land Rover": ["Defender","Discovery","Discovery Sport","Range Rover","Range Rover Evoque","Range Rover Sport","Range Rover Velar"],
    "Jaguar": ["XE","XF","XJ","E-Pace","F-Pace","I-Pace","F-Type"],
    "Mini": ["Cooper","Cooper S","Countryman","Clubman","Paceman"],
    "Bentley": ["Bentayga","Continental GT","Flying Spur","Mulsanne"],
    "Rolls-Royce": ["Ghost","Phantom","Wraith","Dawn","Cullinan"],
    "Aston Martin": ["Vantage","DB11","DB12","DBX","Rapide"],
    "McLaren": ["570S","720S","Artura","GT","P1"],
    "Annat": ["Övrigt"]
});

export const carData = deepFreeze(normalizeCarData(RAW_CAR_DATA));

export function getAllBrands(options = {}) {
    const includeOther = options.includeOther !== false;
    const brands = Object.keys(carData);
    return includeOther ? [...brands] : brands.filter((brand) => brand !== CAR_DATA_CONFIG.OTHER_BRAND_KEY);
}

export function getModelsByBrand(brand, options = {}) {
    const normalizedBrand = resolveBrandName(brand);

    if (!normalizedBrand || !Array.isArray(carData[normalizedBrand])) {
        return [];
    }

    const includeOtherModel = options.includeOtherModel !== false;
    const models = carData[normalizedBrand];

    return includeOtherModel
        ? [...models]
        : models.filter((model) => model !== CAR_DATA_CONFIG.OTHER_MODEL_VALUE);
}

export function isValidBrand(brand) {
    const normalizedBrand = resolveBrandName(brand);
    return Boolean(normalizedBrand && Object.prototype.hasOwnProperty.call(carData, normalizedBrand));
}

export function isValidModelForBrand(brand, model) {
    const normalizedBrand = resolveBrandName(brand);
    const normalizedModel = resolveModelName(normalizedBrand, model);
    return Boolean(normalizedBrand && normalizedModel && carData[normalizedBrand].includes(normalizedModel));
}

export function findBrandByModel(model) {
    const normalizedSearchModel = normalizeForSearch(model);

    if (!normalizedSearchModel) {
        return null;
    }

    for (const brand of Object.keys(carData)) {
        const foundModel = carData[brand].find((currentModel) => {
            return normalizeForSearch(currentModel) === normalizedSearchModel;
        });

        if (foundModel) {
            return brand;
        }
    }

    return null;
}

export function resolveBrandName(brand) {
    const normalizedSearchBrand = normalizeForSearch(brand);

    if (!normalizedSearchBrand) {
        return "";
    }

    const exactBrand = Object.keys(carData).find((currentBrand) => {
        return normalizeForSearch(currentBrand) === normalizedSearchBrand;
    });

    return exactBrand || "";
}

export function resolveModelName(brand, model) {
    const normalizedBrand = resolveBrandName(brand);
    const normalizedSearchModel = normalizeForSearch(model);

    if (!normalizedBrand || !normalizedSearchModel) {
        return "";
    }

    const exactModel = carData[normalizedBrand].find((currentModel) => {
        return normalizeForSearch(currentModel) === normalizedSearchModel;
    });

    return exactModel || "";
}

export function searchBrandsAndModels(searchText, options = {}) {
    const queryText = String(searchText ?? "").slice(0, CAR_DATA_CONFIG.MAX_SEARCH_LENGTH);
    const searchQuery = normalizeForSearch(queryText);

    if (searchQuery.length < CAR_DATA_CONFIG.MIN_SEARCH_LENGTH) {
        return { brands: [], models: [], totalMatches: 0 };
    }

    const requestedMax = Number(options.maxResults);
    const maxResults = Number.isFinite(requestedMax)
        ? clampInteger(requestedMax, 1, CAR_DATA_CONFIG.MAX_RESULTS)
        : 50;

    const includeOther = options.includeOther !== false;
    const includeOtherModel = options.includeOtherModel !== false;
    const brandMatches = [];
    const modelMatches = [];

    for (const brand of getAllBrands({ includeOther })) {
        const normalizedBrand = normalizeForSearch(brand);

        if (normalizedBrand.includes(searchQuery)) {
            brandMatches.push(Object.freeze({ type: "brand", brand, label: brand }));
        }

        for (const model of getModelsByBrand(brand, { includeOtherModel })) {
            const normalizedModel = normalizeForSearch(model);
            const combined = normalizeForSearch(`${brand} ${model}`);

            if (normalizedModel.includes(searchQuery) || combined.includes(searchQuery)) {
                modelMatches.push(Object.freeze({ type: "model", brand, model, label: `${brand} ${model}` }));
            }
        }
    }

    const limitedBrands = brandMatches.slice(0, maxResults);
    const remainingSlots = Math.max(0, maxResults - limitedBrands.length);
    const limitedModels = modelMatches.slice(0, remainingSlots);

    return Object.freeze({
        brands: limitedBrands,
        models: limitedModels,
        totalMatches: limitedBrands.length + limitedModels.length
    });
}

export function getCarDataStats() {
    const brands = Object.keys(carData);
    const modelCount = brands.reduce((total, brand) => total + carData[brand].length, 0);

    return Object.freeze({
        brandCount: brands.length,
        modelCount,
        hasOtherBrand: Boolean(carData[CAR_DATA_CONFIG.OTHER_BRAND_KEY])
    });
}

export function populateBrandSelect(selectElement, options = {}) {
    assertSelectElement(selectElement, "populateBrandSelect");

    const {
        placeholder = CAR_DATA_CONFIG.DEFAULT_BRAND_PLACEHOLDER,
        includeOther = true,
        selectedBrand = "",
        clearExisting = true,
        disabled = false
    } = options;

    const selectedNormalized = normalizeForSearch(selectedBrand);

    if (clearExisting) {
        clearSelect(selectElement);
    }

    appendOption(selectElement, "", placeholder, { selected: !selectedNormalized });

    getAllBrands({ includeOther }).forEach((brand) => {
        appendOption(selectElement, brand, brand, {
            selected: normalizeForSearch(brand) === selectedNormalized
        });
    });

    selectElement.disabled = Boolean(disabled);
}

export function populateModelSelect(selectElement, brand, options = {}) {
    assertSelectElement(selectElement, "populateModelSelect");

    const {
        placeholder = CAR_DATA_CONFIG.DEFAULT_MODEL_PLACEHOLDER,
        disabledPlaceholder = CAR_DATA_CONFIG.MODEL_DISABLED_PLACEHOLDER,
        selectedModel = "",
        includeOtherModel = true,
        clearExisting = true
    } = options;

    const selectedNormalized = normalizeForSearch(selectedModel);
    const resolvedBrand = resolveBrandName(brand);

    if (clearExisting) {
        clearSelect(selectElement);
    }

    if (!resolvedBrand) {
        appendOption(selectElement, "", disabledPlaceholder, { selected: true });
        selectElement.disabled = true;
        return;
    }

    appendOption(selectElement, "", placeholder, { selected: !selectedNormalized });

    getModelsByBrand(resolvedBrand, { includeOtherModel }).forEach((model) => {
        appendOption(selectElement, model, model, {
            selected: normalizeForSearch(model) === selectedNormalized
        });
    });

    selectElement.disabled = false;
}

export function attachBrandModelSelects(brandSelect, modelSelect, options = {}) {
    assertSelectElement(brandSelect, "attachBrandModelSelects brandSelect");
    assertSelectElement(modelSelect, "attachBrandModelSelects modelSelect");

    const safeOptions = { ...options };
    const selectedBrand = safeOptions.selectedBrand || brandSelect.value || "";
    const selectedModel = safeOptions.selectedModel || modelSelect.value || "";

    populateBrandSelect(brandSelect, {
        selectedBrand,
        includeOther: safeOptions.includeOther !== false
    });

    populateModelSelect(modelSelect, selectedBrand, {
        selectedModel,
        includeOtherModel: safeOptions.includeOtherModel !== false
    });

    const handleBrandChange = () => {
        populateModelSelect(modelSelect, brandSelect.value, {
            includeOtherModel: safeOptions.includeOtherModel !== false
        });
        emitChange(safeOptions, brandSelect, modelSelect);
    };

    const handleModelChange = () => {
        emitChange(safeOptions, brandSelect, modelSelect);
    };

    brandSelect.addEventListener("change", handleBrandChange);
    modelSelect.addEventListener("change", handleModelChange);

    return function detachBrandModelSelects() {
        brandSelect.removeEventListener("change", handleBrandChange);
        modelSelect.removeEventListener("change", handleModelChange);
    };
}

export function normalizeForSearch(value) {
    return normalizeDisplayText(value)
        .toLocaleLowerCase(CAR_DATA_CONFIG.LOCALE)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[’']/g, "")
        .replace(/[^\p{L}\p{N}\s.+-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function emitChange(options, brandSelect, modelSelect) {
    if (typeof options.onChange !== "function") {
        return;
    }

    options.onChange({
        brand: brandSelect.value,
        model: modelSelect.value,
        validBrand: isValidBrand(brandSelect.value),
        validModel: modelSelect.value ? isValidModelForBrand(brandSelect.value, modelSelect.value) : false
    });
}

function normalizeCarData(rawData) {
    const normalizedEntries = [];

    for (const [rawBrand, rawModels] of Object.entries(rawData || {})) {
        const brand = normalizeDisplayText(rawBrand);

        if (!brand || !Array.isArray(rawModels)) {
            continue;
        }

        const models = normalizeModelList(rawModels);

        if (models.length === 0) {
            continue;
        }

        normalizedEntries.push([brand, models]);
    }

    normalizedEntries.sort((a, b) => {
        const aIsOther = a[0] === CAR_DATA_CONFIG.OTHER_BRAND_KEY;
        const bIsOther = b[0] === CAR_DATA_CONFIG.OTHER_BRAND_KEY;

        if (aIsOther && !bIsOther) return 1;
        if (!aIsOther && bIsOther) return -1;

        return a[0].localeCompare(b[0], CAR_DATA_CONFIG.LOCALE, {
            numeric: true,
            sensitivity: "base"
        });
    });

    const normalizedObject = {};

    normalizedEntries.forEach(([brand, models]) => {
        normalizedObject[brand] = models;
    });

    if (!normalizedObject[CAR_DATA_CONFIG.OTHER_BRAND_KEY]) {
        normalizedObject[CAR_DATA_CONFIG.OTHER_BRAND_KEY] = [CAR_DATA_CONFIG.OTHER_MODEL_VALUE];
    }

    return normalizedObject;
}

function normalizeModelList(models) {
    const uniqueModelsMap = new Map();

    models.forEach((model) => {
        const cleanModel = normalizeDisplayText(model);

        if (!cleanModel) {
            return;
        }

        const key = normalizeForSearch(cleanModel);

        if (!uniqueModelsMap.has(key)) {
            uniqueModelsMap.set(key, cleanModel);
        }
    });

    return Array.from(uniqueModelsMap.values()).sort((a, b) => {
        const aIsOther = a === CAR_DATA_CONFIG.OTHER_MODEL_VALUE;
        const bIsOther = b === CAR_DATA_CONFIG.OTHER_MODEL_VALUE;

        if (aIsOther && !bIsOther) return 1;
        if (!aIsOther && bIsOther) return -1;

        return a.localeCompare(b, CAR_DATA_CONFIG.LOCALE, {
            numeric: true,
            sensitivity: "base"
        });
    });
}

function normalizeDisplayText(value) {
    return String(value ?? "")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, CAR_DATA_CONFIG.MAX_SEARCH_LENGTH);
}

function clearSelect(selectElement) {
    while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild);
    }
}

function appendOption(selectElement, value, label, options = {}) {
    const option = document.createElement("option");
    option.value = String(value ?? "");
    option.textContent = String(label ?? "");

    if (options.selected) {
        option.selected = true;
    }

    if (options.disabled) {
        option.disabled = true;
    }

    selectElement.appendChild(option);
}

function assertSelectElement(value, functionName) {
    if (!isHTMLSelectElement(value)) {
        throw new TypeError(`${functionName} expected an HTMLSelectElement.`);
    }
}

function isHTMLSelectElement(value) {
    return typeof HTMLSelectElement !== "undefined" && value instanceof HTMLSelectElement;
}

function clampInteger(value, min, max) {
    const number = Math.floor(Number(value));

    if (!Number.isFinite(number)) {
        return min;
    }

    return Math.min(max, Math.max(min, number));
}

function deepFreeze(value, seen = new WeakSet()) {
    if (value === null || typeof value !== "object") {
        return value;
    }

    if (seen.has(value)) {
        return value;
    }

    seen.add(value);

    Reflect.ownKeys(value).forEach((key) => {
        const propertyValue = value[key];

        if (propertyValue && (typeof propertyValue === "object" || typeof propertyValue === "function")) {
            deepFreeze(propertyValue, seen);
        }
    });

    return Object.freeze(value);
}

const carDataModule = Object.freeze({
    config: CAR_DATA_CONFIG,
    carData,
    getAllBrands,
    getModelsByBrand,
    isValidBrand,
    isValidModelForBrand,
    findBrandByModel,
    resolveBrandName,
    resolveModelName,
    searchBrandsAndModels,
    getCarDataStats,
    populateBrandSelect,
    populateModelSelect,
    attachBrandModelSelects,
    normalizeForSearch
});

export default carDataModule;
