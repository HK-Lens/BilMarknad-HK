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

let allCars = [];
let currentUser = null;
let unreadUnsubscribe = null;

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getField(car, primary, fallback = '') {
    return car?.[primary] ?? car?.[fallback] ?? '';
}

onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('authButton');
    const msgLink = document.getElementById('msgLink');
    const msgBadge = document.getElementById('msgBadge');

    if (unreadUnsubscribe) {
        unreadUnsubscribe();
        unreadUnsubscribe = null;
    }

    if (user) {
        currentUser = user;

        if (authBtn) {
            authBtn.textContent = 'Mitt Konto';
            authBtn.href = 'dashboard.html';
        }

        if (msgLink) {
            msgLink.style.display = 'flex';
        }

        if (msgBadge) {
            try {
                const chatsQuery = query(
                    collection(db, 'chats'),
                    where('participants', 'array-contains', user.uid)
                );

                unreadUnsubscribe = onSnapshot(chatsQuery, (snapshot) => {
                    let count = 0;
                    snapshot.forEach((docSnap) => {
                        const chat = docSnap.data();
                        const unreadFor = chat.unreadFor || [];
                        if (Array.isArray(unreadFor) && unreadFor.includes(user.uid)) count++;
                    });

                    if (count > 0) {
                        msgBadge.innerText = count;
                        msgBadge.style.display = 'block';
                    } else {
                        msgBadge.style.display = 'none';
                    }
                });
            } catch (error) {
                console.warn('Unread counter could not be loaded:', error);
                msgBadge.style.display = 'none';
            }
        }
    } else {
        currentUser = null;

        if (authBtn) {
            authBtn.textContent = 'Logga in';
            authBtn.href = 'login.html';
        }

        if (msgLink) msgLink.style.display = 'none';
        if (msgBadge) msgBadge.style.display = 'none';
    }
});

async function initApp() {
    const grid = document.getElementById('carsGrid');

    if (grid) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Laddar fordon...</p>`;
    }

    try {
        const carsQuery = query(
            collection(db, 'cars'),
            orderBy('createdAt', 'desc'),
            limit(100)
        );

        const snapshot = await getDocs(carsQuery);

        allCars = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((car) => car && car.brand && car.model);

        const urlParams = new URLSearchParams(window.location.search);
        const hasSearch = [
            'brand', 'model', 'kar', 'body', 'fuel', 'gear', 'text',
            'minP', 'maxP', 'minY', 'maxY', 'yFrom', 'yTo',
            'minM', 'maxM', 'mil', 'milFrom', 'milTo'
        ].some((key) => urlParams.has(key));

        if (hasSearch) applyDeepSearch(urlParams);
        else render(allCars);
    } catch (error) {
        console.error('Error fetching cars:', error);
        if (grid) {
            grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Kunde inte ladda fordon.</p>`;
        }
    }
}

function applyDeepSearch(params) {
    const filtered = allCars.filter((car) => {
        const brandParam = params.get('brand');
        const modelParam = params.get('model');
        const bodyParam = params.get('kar') || params.get('body');
        const fuelParam = params.get('fuel');
        const gearParam = params.get('gear');

        const brand = String(car.brand || '');
        const model = String(car.model || '');
        const body = String(car.karosseri || car.bodyType || car.carType || '');
        const fuel = String(car.fuel || car.fuelType || '');
        const gear = String(car.gear || car.transmission || '');

        const brandMatch = !brandParam || brandParam === 'all' || brand === brandParam;
        const modelMatch = !modelParam || modelParam === 'all' || model.toLowerCase().includes(modelParam.toLowerCase());
        const bodyMatch = !bodyParam || bodyParam === 'all' || body === bodyParam;
        const fuelMatch = !fuelParam || fuelParam === 'all' || fuel === fuelParam;
        const gearMatch = !gearParam || gearParam === 'all' || gear === gearParam;

        const minPrice = Number(params.get('minP')) || 0;
        const maxPrice = Number(params.get('maxP')) || Infinity;
        const price = Number(car.price) || 0;
        const priceMatch = price >= minPrice && price <= maxPrice;

        const minYear = Number(params.get('minY') || params.get('yFrom')) || 0;
        const maxYear = Number(params.get('maxY') || params.get('yTo')) || Infinity;
        const year = Number(car.year) || 0;
        const yearMatch = year >= minYear && year <= maxYear;

        const minMileage = Number(params.get('minM') || params.get('milFrom')) || 0;
        const maxMileage = Number(params.get('maxM') || params.get('milTo') || params.get('mil')) || Infinity;
        const mileage = Number(car.mileage || car.mil) || 0;
        const mileageMatch = mileage >= minMileage && mileage <= maxMileage;

        const searchText = String(params.get('text') || '').toLowerCase().trim();
        const description = String(car.description || '').toLowerCase();
        const textMatch = !searchText || brand.toLowerCase().includes(searchText) || model.toLowerCase().includes(searchText) || description.includes(searchText);

        return brandMatch && modelMatch && bodyMatch && priceMatch && yearMatch && mileageMatch && fuelMatch && gearMatch && textMatch;
    });

    render(filtered);

    const resultTitle = document.getElementById('resultTitle');
    if (resultTitle) {
        resultTitle.innerText = filtered.length > 0
            ? `Hittade ${filtered.length} bilar som matchar din sökning`
            : 'Inga bilar matchade din sökning';
    }
}

function render(data) {
    const grid = document.getElementById('carsGrid');
    if (!grid) return;

    if (!Array.isArray(data) || data.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Inga fordon hittades.</p>`;
        return;
    }

    grid.innerHTML = data.map((car) => {
        const image = escapeHTML(car.images?.[0] || car.image || 'placeholder.jpg');
        const price = Number(car.price || 0).toLocaleString('sv-SE');
        const brand = escapeHTML(car.brand || '');
        const model = escapeHTML(car.model || '');
        const year = escapeHTML(car.year || '');
        const mileage = escapeHTML(car.mileage || car.mil || '');
        const fuel = escapeHTML(car.fuel || car.fuelType || '');
        const carId = encodeURIComponent(car.id);
        const isSold = car.status === 'sold';

        return `
            <div class="car-card ${isSold ? 'is-sold' : ''}" onclick="window.location.href='details.html?id=${carId}'">
                ${isSold ? '<div class="sold-badge">SÅLD</div>' : ''}
                <img src="${image}" alt="${brand} ${model}" loading="lazy" onerror="this.src='placeholder.jpg'">
                <div class="card-content">
                    <div class="price-tag">${price} kr</div>
                    <div class="car-title">${brand} ${model}</div>
                    <div class="car-meta">${year} • ${mileage} mil • ${fuel}</div>
                </div>
            </div>
        `;
    }).join('');
}

initApp();
