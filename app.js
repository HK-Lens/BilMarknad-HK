// ========================================================
// BILHK - المجلد الرئيسي للمحرك البرمجي (app.js)
// ========================================================

import { auth, db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- المتغيرات العامة للحالة (State) ---
let allCars = [];
const carsGrid = document.getElementById('carsGrid');
const msgBadge = document.getElementById('msgBadge');

/**
 * وظيفة تهيئة التطبيق
 */
async function initApp() {
    console.log("Initializing BILHK Engine...");
    
    // 1. مراقبة حالة المستخدم وتحديث شارة الرسائل
    onAuthStateChanged(auth, (user) => {
        if (user) {
            setupMessageBadge(user);
        } else {
            if (msgBadge) msgBadge.style.display = 'none';
        }
    });

    // 2. جلب البيانات الأساسية
    await fetchCars();

    // 3. التحقق من وجود معاملات بحث في الرابط (Deep Search)
    applyDeepSearch();
}

/**
 * جلب كافة السيارات النشطة من Firestore
 */
async function fetchCars() {
    try {
        const q = query(collection(db, "cars"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        allCars = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderCars(allCars);
    } catch (error) {
        console.error("Error fetching cars:", error);
        if (carsGrid) carsGrid.innerHTML = '<p class="error-msg">حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقاً.</p>';
    }
}

/**
 * معالجة معاملات الرابط (URL Params) لتنفيذ الفلترة التلقائية
 */
function applyDeepSearch() {
    const params = new URLSearchParams(window.location.search);
    if (params.toString() === "") return;

    let filtered = [...allCars];

    // فلترة الماركة
    const brand = params.get('brand');
    if (brand && brand !== 'all') {
        filtered = filtered.filter(c => c.brand === brand);
    }

    // فلترة الموديل
    const model = params.get('model');
    if (model && model !== 'all') {
        filtered = filtered.filter(c => c.model === model);
    }

    // فلترة السعر (من - إلى)
    const minP = Number(params.get('minP')) || 0;
    const maxP = Number(params.get('maxP')) || Infinity;
    filtered = filtered.filter(c => Number(c.price) >= minP && Number(c.price) <= maxP);

    // فلترة المسافة المقطوعة (Mil)
    const maxMil = Number(params.get('maxMil')) || Infinity;
    filtered = filtered.filter(c => Number(c.mileage) <= maxMil);

    // فلترة نوع الوقود
    const fuel = params.get('fuel');
    if (fuel && fuel !== 'all') {
        filtered = filtered.filter(c => c.fuel === fuel);
    }

    renderCars(filtered);
}

/**
 * عرض بطاقات السيارات في الواجهة
 * @param {Array} carsList 
 */
function renderCars(carsList) {
    if (!carsGrid) return;

    if (carsList.length === 0) {
        carsGrid.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-car-rear"></i>
                <p>لا توجد سيارات تطابق معايير البحث حالياً.</p>
            </div>`;
        return;
    }

    carsGrid.innerHTML = carsList.map(car => {
        const isSold = car.status === 'sold' || car.sold === true;
        const mainImage = (car.images && car.images.length > 0) ? car.images[0] : 'placeholder.jpg';
        const formattedPrice = Number(car.price).toLocaleString('sv-SE');

        return `
            <div class="car-card" onclick="window.location.href='details.html?id=${car.id}'" 
                 style="cursor: pointer; position: relative; ${isSold ? 'opacity: 0.85;' : ''}">
                
                ${isSold ? '<div class="sold-badge">SÅLD</div>' : ''}
                
                <div class="car-img-wrap">
                    <img src="${mainImage}" alt="${car.brand} ${car.model}" loading="lazy">
                </div>

                <div class="card-content">
                    <div class="price-tag">${formattedPrice} kr</div>
                    <div class="car-title">${car.brand} ${car.model}</div>
                    <div class="car-meta">
                        <span><i class="fa-regular fa-calendar"></i> ${car.year}</span>
                        <span><i class="fa-solid fa-gauge"></i> ${car.mileage} mil</span>
                        <span><i class="fa-solid fa-gas-pump"></i> ${car.fuelType || car.fuel}</span>
                    </div>
                    <div class="seller-info">
                        <i class="fa-solid fa-user-tie"></i> ${car.sellerName || 'بائع محترف'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * إعداد نظام مراقبة الرسائل غير المقروءة (Real-time)
 * @param {Object} user 
 */
function setupMessageBadge(user) {
    if (!msgBadge) return;

    const qChats = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
    );

    onSnapshot(qChats, (snapshot) => {
        let totalUnread = 0;
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            // التحقق من أن المستخدم هو المستلم للرسالة الأخيرة وأنها غير مقروءة
            if (data.lastMessageReceiver === user.uid && data.unreadCount > 0) {
                totalUnread += data.unreadCount;
            }
        });

        if (totalUnread > 0) {
            msgBadge.innerText = totalUnread > 99 ? '99+' : totalUnread;
            msgBadge.style.display = 'flex';
        } else {
            msgBadge.style.display = 'none';
        }
    });
}

/**
 * وظائف مساعدة (Utilities)
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);
