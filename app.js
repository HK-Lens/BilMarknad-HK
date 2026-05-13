import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, orderBy, limit, onSnapshot, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { carData, fuels, gears } from './cars-data.js';

let allCars = [];
const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const n = (v) => Number(v || 0);
const field = (car, ...names) => names.map(k => car?.[k]).find(v => v !== undefined && v !== null && v !== '') || '';
function carFuel(car){ return field(car,'fuel','fuelType','bransle'); }
function carGear(car){ return field(car,'gear','gearbox','transmission'); }
function carBody(car){ return field(car,'karosseri','body','bodyType','carType'); }
function carMileage(car){ return n(field(car,'mileage','mil','miltal')); }

onAuthStateChanged(auth, (user) => {
  const authButton = $('authButton');
  const msgLink = $('msgLink');
  if (authButton) { authButton.textContent = user ? 'Min sida' : 'Logga in'; authButton.href = user ? 'dashboard.html' : 'login.html'; }
  if (msgLink) msgLink.style.display = user ? 'inline-flex' : 'none';
  if (user) {
    const q = query(collection(db, 'chats'), where('participants','array-contains', user.uid));
    onSnapshot(q, () => {}, () => {});
  }
});

function populateSearch() {
  const b = $('brandSelect'), m = $('modelSelect'), f = $('fuelSelect'), g = $('gearSelect');
  if (b) { Object.keys(carData).sort().forEach(x => b.insertAdjacentHTML('beforeend', `<option value="${esc(x)}">${esc(x)}</option>`)); b.onchange = () => { if(!m) return; m.innerHTML = '<option value="">Alla modeller</option>'; (carData[b.value] || []).forEach(x => m.insertAdjacentHTML('beforeend', `<option value="${esc(x)}">${esc(x)}</option>`)); }; }
  if (f) fuels.forEach(x => f.insertAdjacentHTML('beforeend', `<option value="${esc(x)}">${esc(x)}</option>`));
  if (g) gears.forEach(x => g.insertAdjacentHTML('beforeend', `<option value="${esc(x)}">${esc(x)}</option>`));
  const sb = $('searchBtn');
  if (sb) sb.onclick = () => {
    const p = new URLSearchParams();
    if ($('brandSelect')?.value) p.set('brand', $('brandSelect').value);
    if ($('modelSelect')?.value) p.set('model', $('modelSelect').value);
    if ($('maxPrice')?.value) p.set('maxP', $('maxPrice').value);
    if ($('maxMileage')?.value) p.set('maxM', $('maxMileage').value);
    if ($('yearFrom')?.value) p.set('minY', $('yearFrom').value);
    if ($('fuelSelect')?.value) p.set('fuel', $('fuelSelect').value);
    if ($('gearSelect')?.value) p.set('gear', $('gearSelect').value);
    location.href = `results.html?${p.toString()}`;
  };
}

function matches(car, params){
  const brand = params.get('brand'); const model = params.get('model'); const text=(params.get('text')||'').toLowerCase();
  if (brand && field(car,'brand') !== brand) return false;
  if (model && field(car,'model') !== model && !String(field(car,'model')).toLowerCase().includes(model.toLowerCase())) return false;
  if (params.get('fuel') && carFuel(car) !== params.get('fuel')) return false;
  if (params.get('gear') && carGear(car) !== params.get('gear')) return false;
  if (params.get('body') && carBody(car) !== params.get('body')) return false;
  if (params.get('kar') && carBody(car) !== params.get('kar')) return false;
  if (params.get('minP') && n(car.price) < n(params.get('minP'))) return false;
  if (params.get('maxP') && n(car.price) > n(params.get('maxP'))) return false;
  if (params.get('minY') && n(car.year) < n(params.get('minY'))) return false;
  if (params.get('maxY') && n(car.year) > n(params.get('maxY'))) return false;
  if (params.get('minM') && carMileage(car) < n(params.get('minM'))) return false;
  if (params.get('maxM') && carMileage(car) > n(params.get('maxM'))) return false;
  if (params.get('color') && !String(field(car,'color')).toLowerCase().includes(params.get('color').toLowerCase())) return false;
  if (params.get('drive') && field(car,'drive') !== params.get('drive')) return false;
  if (params.get('minHp') && n(field(car,'hp','horsepower')) < n(params.get('minHp'))) return false;
  if (params.get('seats') && n(field(car,'seats')) !== n(params.get('seats'))) return false;
  if (params.get('doors') && n(field(car,'doors')) !== n(params.get('doors'))) return false;
  const feats = (params.get('features') || params.get('feats') || '').split(',').filter(Boolean);
  if (feats.length && !feats.every(x => (car.features || []).includes(x))) return false;
  if (text) {
    const hay = [car.brand, car.model, car.description, car.regNr, car.regNo].join(' ').toLowerCase();
    if (!hay.includes(text)) return false;
  }
  return true;
}

export function renderCars(data, targetId='carsGrid'){
  const grid=$(targetId); if(!grid) return;
  if(!data.length){ grid.innerHTML='<p style="grid-column:1/-1;text-align:center;padding:40px;color:#64748b">Inga annonser hittades.</p>'; return; }
  grid.innerHTML = data.map(car => {
    const img = (car.images && car.images[0]) || car.image || 'placeholder.jpg';
    const sold = field(car,'status') === 'sold';
    return `<article class="car-card" onclick="location.href='details.html?id=${esc(car.id)}'">${sold?'<div class="sold-badge">SÅLD</div>':''}<img src="${esc(img)}" loading="lazy" onerror="this.src='placeholder.jpg'" style="${sold?'opacity:.58':''}"><div class="body"><div class="price">${n(car.price).toLocaleString()} kr</div><h3>${esc(car.brand)} ${esc(car.model)}</h3><p class="muted">${esc(car.year)} • ${carMileage(car).toLocaleString()} mil • ${esc(carFuel(car))} • ${esc(carGear(car))}</p><p class="muted">${esc(carBody(car))}</p></div></article>`;
  }).join('');
}

async function init(){
  populateSearch();
  const grid = $('carsGrid'); if(!grid) return;
  try{
    const snap = await getDocs(query(collection(db,'cars'), orderBy('createdAt','desc'), limit(200)));
    allCars = snap.docs.map(d => ({id:d.id, ...d.data()})).filter(c => c.brand && c.model);
    const params = new URLSearchParams(location.search);
    const filtered = [...params.keys()].length ? allCars.filter(c => matches(c, params)) : allCars;
    renderCars(filtered.slice(0, 12));
  }catch(e){ console.error(e); grid.innerHTML='<p style="grid-column:1/-1;text-align:center">Kunde inte ladda annonser. Kontrollera Firebase Rules och createdAt-index.</p>'; }
}
init();
