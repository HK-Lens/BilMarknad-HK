import { db, auth } from './firebase-config.js';

import {
    collection,
    getDocs,
    query,
    orderBy,
    onSnapshot,
    where,
    limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


// ========================================
// Global Variables
// ========================================

let allCars = [];
let currentUser = null;


// ========================================
// Auth State Observer
// ========================================

onAuthStateChanged(auth, (user) => {

    const authBtn = document.getElementById('authButton');
    const msgLink = document.getElementById('msgLink');
    const msgBadge = document.getElementById('msgBadge');

    if (user) {

        currentUser = user;

        if (authBtn) {
            authBtn.textContent = "Mitt Konto";
            authBtn.href = "dashboard.html";
        }

        if (msgLink) {
            msgLink.style.display = "flex";
        }

        // Unread messages counter
        const unreadQuery = query(
            collection(db, "messages"),
            where("receiverId", "==", user.uid),
            where("read", "==", false)
        );

        onSnapshot(unreadQuery, (snapshot) => {

            if (!msgBadge) return;

            if (snapshot.size > 0) {

                msgBadge.innerText = snapshot.size;
                msgBadge.style.display = "block";

            } else {

                msgBadge.style.display = "none";

            }

        });

    } else {

        currentUser = null;

        if (authBtn) {
            authBtn.textContent = "Logga in";
            authBtn.href = "login.html";
        }

        if (msgLink) {
            msgLink.style.display = "none";
        }

        if (msgBadge) {
            msgBadge.style.display = "none";
        }

    }

});


// ========================================
// Initialize App
// ========================================

async function initApp() {

    const grid = document.getElementById('carsGrid');

    if (grid) {

        grid.innerHTML = `
            <p style="grid-column: 1/-1; text-align: center;">
                Laddar fordon...
            </p>
        `;

    }

    try {

        const carsQuery = query(
            collection(db, "cars"),
            orderBy("createdAt", "desc"),
            limit(100)
        );

        const snapshot = await getDocs(carsQuery);

        allCars = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(car =>
                car &&
                car.brand &&
                car.model
            );

        const urlParams = new URLSearchParams(window.location.search);

        const hasSearch =
            urlParams.has('brand') ||
            urlParams.has('model') ||
            urlParams.has('kar') ||
            urlParams.has('fuel') ||
            urlParams.has('gear') ||
            urlParams.has('text') ||
            urlParams.has('minP') ||
            urlParams.has('maxP') ||
            urlParams.has('minY') ||
            urlParams.has('maxY') ||
            urlParams.has('minM') ||
            urlParams.has('maxM');

        if (hasSearch) {

            applyDeepSearch(urlParams);

        } else {

            render(allCars);

        }

    } catch (error) {

        console.error("Error fetching cars:", error);

        if (grid) {

            grid.innerHTML = `
                <p style="grid-column: 1/-1; text-align: center;">
                    Kunde inte ladda fordon.
                </p>
            `;

        }

    }

}


// ========================================
// Deep Search
// ========================================

function applyDeepSearch(params) {

    const filtered = allCars.filter(car => {

        // Brand
        const brandMatch =
            !params.get('brand') ||
            params.get('brand') === 'all' ||
            String(car.brand || "") === params.get('brand');

        // Model
        const modelMatch =
            !params.get('model') ||
            params.get('model') === 'all' ||
            String(car.model || "") === params.get('model');

        // Body Type
        const bodyMatch =
            !params.get('kar') ||
            params.get('kar') === 'all' ||
            String(car.bodyType || "") === params.get('kar');

        // Price
        const minPrice =
            Number(params.get('minP')) || 0;

        const maxPrice =
            Number(params.get('maxP')) || Infinity;

        const currentPrice =
            Number(car.price) || 0;

        const priceMatch =
            currentPrice >= minPrice &&
            currentPrice <= maxPrice;

        // Year
        const minYear =
            Number(params.get('minY')) || 0;

        const maxYear =
            Number(params.get('maxY')) || Infinity;

        const currentYear =
            Number(car.year) || 0;

        const yearMatch =
            currentYear >= minYear &&
            currentYear <= maxYear;

        // Mileage
        const minMileage =
            Number(params.get('minM')) || 0;

        const maxMileage =
            Number(params.get('maxM')) || Infinity;

        const currentMileage =
            Number(car.mileage) || 0;

        const mileageMatch =
            currentMileage >= minMileage &&
            currentMileage <= maxMileage;

        // Fuel Type
        const fuelMatch =
            !params.get('fuel') ||
            params.get('fuel') === 'all' ||
            String(car.fuelType || "") === params.get('fuel');

        // Transmission
        const transmissionMatch =
            !params.get('gear') ||
            params.get('gear') === 'all' ||
            String(car.transmission || "") === params.get('gear');

        // Free Text Search
        const searchText =
            String(params.get('text') || "")
            .toLowerCase()
            .trim();

        const brandText =
            String(car.brand || "")
            .toLowerCase();

        const modelText =
            String(car.model || "")
            .toLowerCase();

        const descriptionText =
            String(car.description || "")
            .toLowerCase();

        const textMatch =
            !searchText ||
            brandText.includes(searchText) ||
            modelText.includes(searchText) ||
            descriptionText.includes(searchText);

        return (
            brandMatch &&
            modelMatch &&
            bodyMatch &&
            priceMatch &&
            yearMatch &&
            mileageMatch &&
            fuelMatch &&
            transmissionMatch &&
            textMatch
        );

    });

    render(filtered);

    const resultTitle = document.getElementById('resultTitle');

    if (resultTitle) {

        resultTitle.innerText =
            filtered.length > 0
                ? `Hittade ${filtered.length} bilar som matchar din sökning`
                : "Inga bilar matchade din sökning";

    }

}


// ========================================
// Render Cars
// ========================================

function render(data) {

    const grid = document.getElementById('carsGrid');

    if (!grid) return;

    if (!Array.isArray(data) || data.length === 0) {

        grid.innerHTML = `
            <p style="grid-column: 1/-1; text-align: center;">
                Inga fordon hittades.
            </p>
        `;

        return;

    }

    grid.innerHTML = data.map(car => {

        const image =
            car.images?.[0] ||
            car.image ||
            "placeholder.jpg";

        const price =
            Number(car.price || 0).toLocaleString();

        const brand =
            String(car.brand || "");

        const model =
            String(car.model || "");

        const year =
            String(car.year || "");

        const mileage =
            String(car.mileage || "");

        const fuelType =
            String(car.fuelType || "");

        return `

            <div class="car-card"
                 onclick="window.location.href='details.html?id=${car.id}'">

                <img
                    src="${image}"
                    alt="${brand} ${model}"
                    loading="lazy"
                    onerror="this.src='placeholder.jpg'"
                >

                <div class="card-content">

                    <div class="price-tag">
                        ${price} kr
                    </div>

                    <div class="car-title">
                        ${brand} ${model}
                    </div>

                    <div class="car-meta">
                        ${year} • ${mileage} mil • ${fuelType}
                    </div>

                </div>

            </div>

        `;

    }).join('');

}


// ========================================
// Start App
// ========================================

initApp();
