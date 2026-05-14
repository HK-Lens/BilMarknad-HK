import { db, auth } from './firebase-config.js';

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

        // Real-time unread messages counter
        const qMsg = query(
            collection(db, "messages"),
            where("receiverId", "==", user.uid),
            where("read", "==", false)
        );

        onSnapshot(qMsg, (snapshot) => {

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

        const q = query(
            collection(db, "cars"),
            orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        allCars = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));


        const urlParams = new URLSearchParams(window.location.search);

        const hasSearch =
            urlParams.has('brand') ||
            urlParams.has('text') ||
            urlParams.has('maxP') ||
            urlParams.has('fuel') ||
            urlParams.has('gear');

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
            car.brand === params.get('brand');

        // Model
        const modelMatch =
            !params.get('model') ||
            params.get('model') === 'all' ||
            car.model === params.get('model');

        // Body Type
        const bodyMatch =
            !params.get('kar') ||
            params.get('kar') === 'all' ||
            car.bodyType === params.get('kar');

        // Price
        const minPrice =
            Number(params.get('minP')) || 0;

        const maxPrice =
            Number(params.get('maxP')) || Infinity;

        const priceMatch =
            Number(car.price) >= minPrice &&
            Number(car.price) <= maxPrice;

        // Year
        const minYear =
            Number(params.get('minY')) || 0;

        const maxYear =
            Number(params.get('maxY')) || Infinity;

        const yearMatch =
            Number(car.year) >= minYear &&
            Number(car.year) <= maxYear;

        // Mileage
        const minMileage =
            Number(params.get('minM')) || 0;

        const maxMileage =
            Number(params.get('maxM')) || Infinity;

        const mileageMatch =
            Number(car.mileage) >= minMileage &&
            Number(car.mileage) <= maxMileage;

        // Fuel Type
        const fuelMatch =
            !params.get('fuel') ||
            params.get('fuel') === 'all' ||
            car.fuelType === params.get('fuel');

        // Transmission
        const transmissionMatch =
            !params.get('gear') ||
            params.get('gear') === 'all' ||
            car.transmission === params.get('gear');

        // Free Text Search
        const searchText =
            params.get('text')?.toLowerCase().trim() || "";

        const brandText =
            car.brand?.toLowerCase() || "";

        const modelText =
            car.model?.toLowerCase() || "";

        const descriptionText =
            car.description?.toLowerCase() || "";

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

    if (data.length === 0) {

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
            car.brand || "";

        const model =
            car.model || "";

        const year =
            car.year || "";

        const mileage =
            car.mileage || "";

        const fuelType =
            car.fuelType || "";

        return `

            <div class="car-card"
                 onclick="window.location.href='details.html?id=${car.id}'">

                <img
                    src="${image}"
                    alt="${brand} ${model}"
                    loading="lazy"
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
