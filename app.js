import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, orderBy, onSnapshot, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// متغيرات عامة لتخزين البيانات
let allCars = [];
let currentUser = null;

/**
 * 1. مراقبة حالة المستخدم وتحديث واجهة الهيدر
 */
onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('authButton');
    const msgLink = document.getElementById('msgLink');
    const msgBadge = document.getElementById('msgBadge');

    if (user) {
        currentUser = user;
        if (authBtn) {
            authBtn.textContent = "Mitt Konto";
            authBtn.href = "my-account.html";
        }
        if (msgLink) msgLink.style.display = "flex";

        // مراقبة الرسائل غير المقروءة لحظياً
        const qMsg = query(
            collection(db, "messages"), 
            where("receiverId", "==", user.uid), 
            where("read", "==", false)
        );
        
        onSnapshot(qMsg, (snapshot) => {
            if (msgBadge) {
                if (snapshot.size > 0) {
                    msgBadge.innerText = snapshot.size;
                    msgBadge.style.display = "block";
                } else {
                    msgBadge.style.display = "none";
                }
            }
        });
    }
});

/**
 * 2. جلب البيانات من Firebase عند تحميل الصفحة
 */
async function initApp() {
    const grid = document.getElementById('carsGrid');
    if (grid) grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Laddar fordon...</p>";

    try {
        const q = query(collection(db, "cars"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        allCars = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // التحقق مما إذا كان هناك بحث قادم من الرابط (URL)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('brand') || urlParams.has('text') || urlParams.has('maxP')) {
            applyDeepSearch(urlParams);
        } else {
            render(allCars); // عرض الكل في حال عدم وجود بحث
        }
    } catch (error) {
        console.error("Error fetching cars:", error);
        if (grid) grid.innerHTML = "<p>Kunde inte ladda bilar. Kontrollera anslutningen.</p>";
    }
}

/**
 * 3. دالة تطبيق البحث العميق (التي قمت بتطويرها)
 */
function applyDeepSearch(p) {
    const filtered = allCars.filter(c => {
        // 1. تصفية الماركة والموديل والهيكل
        const brandMatch = !p.get('brand') || p.get('brand') === 'all' || c.brand === p.get('brand');
        const modelMatch = !p.get('model') || p.get('model') === 'all' || c.model === p.get('model');
        const karMatch = !p.get('kar') || p.get('kar') === 'all' || c.bodyType === p.get('kar');

        // 2. تصفية السعر
        const minP = Number(p.get('minP')) || 0;
        const maxP = Number(p.get('maxP')) || Infinity;
        const priceMatch = Number(c.price) >= minP && Number(c.price) <= maxP;

        // 3. تصفية سنة الصنع
        const minY = Number(p.get('minY')) || 0;
        const maxY = Number(p.get('maxY')) || Infinity;
        const yearMatch = Number(c.year) >= minY && Number(c.year) <= maxY;

        // 4. تصفية المسافة المقطوعة
        const minM = Number(p.get('minM')) || 0;
        const maxM = Number(p.get('maxM')) || Infinity;
        const mileageMatch = Number(c.mileage) >= minM && Number(c.mileage) <= maxM;

        // 5. تصفية الوقود وناقل الحركة
        const fuelMatch = !p.get('fuel') || p.get('fuel') === 'all' || c.fuelType === p.get('fuel');
        const gearMatch = !p.get('gear') || p.get('gear') === 'all' || c.transmission === p.get('gear');

        // 6. البحث النصي الحر
        const searchText = p.get('text')?.toLowerCase() || "";
        const textMatch = !searchText || 
                         c.brand.toLowerCase().includes(searchText) || 
                         c.model.toLowerCase().includes(searchText) || 
                         (c.description && c.description.toLowerCase().includes(searchText));

        return brandMatch && modelMatch && karMatch && priceMatch && 
               yearMatch && mileageMatch && fuelMatch && gearMatch && textMatch;
    });

    render(filtered);
    
    const resultTitle = document.getElementById('resultTitle');
    if (resultTitle) {
        resultTitle.innerText = filtered.length > 0 
            ? `Hittade ${filtered.length} bilar som matchar din sökning` 
            : "Inga bilar matchade din sökning";
    }
}

/**
 * 4. دالة عرض الكروت في الشبكة (Grid)
 */
function render(data) {
    const grid = document.getElementById('carsGrid');
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Inga fordon hittades.</p>";
        return;
    }

    grid.innerHTML = data.map(c => `
        <div class="car-card" onclick="window.location.href='details.html?id=${c.id}'">
            <img src="${c.images && c.images.length > 0 ? c.images[0] : 'placeholder.jpg'}" loading="lazy">
            <div class="card-content">
                <div class="price-tag">${Number(c.price).toLocaleString()} kr</div>
                <div class="car-title">${c.brand} ${c.model}</div>
                <div class="car-meta">${c.year} • ${c.mileage} mil • ${c.fuelType}</div>
            </div>
        </div>
    `).join('');
}

// تشغيل التطبيق عند التحميل
initApp();
