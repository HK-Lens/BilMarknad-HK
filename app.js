import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, limit, onSnapshot, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let selectedBodyType = null;
let allCars = [];

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const money = (n) => Number(n || 0).toLocaleString('sv-SE');

function ensureHeaderButtons(user) {
  const authStatus = document.getElementById('authStatus') || document.getElementById('authStatusContainer') || document.getElementById('authButtonBox');
  const authButton = document.getElementById('authButton');

  const html = user
    ? `<a href="dashboard.html" class="top-link"><i class="fa-solid fa-user"></i> Min sida</a>`
    : `<a href="login.html" class="top-link">Logga in</a>`;

  if (authStatus) authStatus.innerHTML = html;
  if (authButton) {
    authButton.textContent = user ? 'Min sida' : 'Logga in';
    authButton.href = user ? 'dashboard.html' : 'login.html';
  }

  const msgLink = document.getElementById('msgLink');
  if (msgLink) msgLink.style.display = user ? 'flex' : 'none';

  if (user) {
    const msgBadge = document.getElementById('msgBadge');
    if (msgBadge) {
      const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
      onSnapshot(q, (snap) => {
        msgBadge.innerText = snap.size || '';
        msgBadge.style.display = snap.size ? 'block' : 'none';
      });
    }
  }
}

onAuthStateChanged(auth, (user) => ensureHeaderButtons(user));

function buildSearchUrl() {
  const params = new URLSearchParams();
  const fields = [
    ['brand', 'brandSelect'], ['model', 'modelInput'], ['maxP', 'maxPrice'], ['yFrom', 'yearFrom'],
    ['yTo', 'yearTo'], ['fuel', 'fuelSelect'], ['gear', 'gearSelect'], ['milTo', 'maxMileage']
  ];
  fields.forEach(([param, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const value = (el.value || '').trim();
    if (value && value !== 'all') params.set(param, value);
  });
  if (selectedBodyType) params.set('body', selectedBodyType);
  window.location.href = `results.html?${params.toString()}`;
}

function renderCars(cars) {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!cars.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#64748b;padding:40px;">Inga annonser hittades.</p>`;
    return;
  }

  cars.forEach((car) => {
    const sold = car.status === 'sold';
    const title = `${escapeHtml(car.brand)} ${escapeHtml(car.model)}`;
    grid.insertAdjacentHTML('beforeend', `
      <article class="car-card" onclick="window.location.href='details.html?id=${encodeURIComponent(car.id)}'">
        ${sold ? '<div class="sold-badge">SÅLD</div>' : ''}
        <img loading="lazy" src="${escapeHtml(car.images?.[0] || 'placeholder.jpg')}" alt="${title}" style="width:100%;height:190px;object-fit:cover;${sold ? 'opacity:.6;' : ''}">
        <div style="padding:20px;${sold ? 'opacity:.75;' : ''}">
          <h3 style="color:var(--primary);font-size:22px;font-weight:900;">${money(car.price)} kr</h3>
          <p style="font-weight:800;margin-top:4px;">${title}</p>
          <p style="color:#64748b;font-size:13px;margin-top:6px;">${escapeHtml(car.year || '-')} | ${escapeHtml(car.mileage || car.mil || '-')} mil | ${escapeHtml(car.fuel || car.fuelType || '-')}</p>
          <p style="color:#64748b;font-size:12px;margin-top:6px;">Säljare: ${escapeHtml(car.sellerDisplayName || car.sellerName || 'BILHK-användare')}</p>
        </div>
      </article>
    `);
  });
}

async function fetchRecentCars() {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;
  grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:30px;">Laddar bilar...</p>`;
  try {
    const snap = await getDocs(query(collection(db, 'cars'), limit(120)));
    allCars = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .filter((c) => c.active !== false)
      .sort((a, b) => {
        const da = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dbb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dbb - da;
      })
      .slice(0, 12);
    renderCars(allCars);
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#ef4444;padding:30px;">Kunde inte ladda annonser.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.body-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.body-btn').forEach((b) => b.classList.remove('active'));
      if (selectedBodyType === btn.dataset.type) selectedBodyType = null;
      else {
        selectedBodyType = btn.dataset.type;
        btn.classList.add('active');
      }
    });
  });

  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) searchBtn.addEventListener('click', buildSearchUrl);
  fetchRecentCars();
});
