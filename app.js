/**
 * دالة تطبيق البحث العميق
 * @param {URLSearchParams} p - المعايير القادمة من رابط الصفحة
 */
function applyDeepSearch(p) {
    const filtered = allCars.filter(c => {
        // 1. تصفية الماركة والموديل والهيكل
        const brandMatch = !p.get('brand') || p.get('brand') === 'all' || c.brand === p.get('brand');
        const modelMatch = !p.get('model') || p.get('model') === 'all' || c.model === p.get('model');
        const karMatch = !p.get('kar') || p.get('kar') === 'all' || c.bodyType === p.get('kar');

        // 2. تصفية السعر (نطاق من وإلى)
        const minP = Number(p.get('minP')) || 0;
        const maxP = Number(p.get('maxP')) || Infinity;
        const priceMatch = Number(c.price) >= minP && Number(c.price) <= maxP;

        // 3. تصفية سنة الصنع (نطاق من وإلى)
        const minY = Number(p.get('minY')) || 0;
        const maxY = Number(p.get('maxY')) || Infinity;
        const yearMatch = Number(c.year) >= minY && Number(c.year) <= maxY;

        // 4. تصفية المسافة المقطوعة (نطاق من وإلى)
        const minM = Number(p.get('minM')) || 0;
        const maxM = Number(p.get('maxM')) || Infinity;
        const mileageMatch = Number(c.mileage) >= minM && Number(c.mileage) <= maxM;

        // 5. تصفية الوقود وناقل الحركة
        const fuelMatch = !p.get('fuel') || p.get('fuel') === 'all' || c.fuelType === p.get('fuel');
        const gearMatch = !p.get('gear') || p.get('gear') === 'all' || c.transmission === p.get('gear');

        // 6. البحث النصي الحر (Fritext) - يبحث في الماركة والموديل والوصف
        const searchText = p.get('text')?.toLowerCase() || "";
        const textMatch = !searchText || 
                         c.brand.toLowerCase().includes(searchText) || 
                         c.model.toLowerCase().includes(searchText) || 
                         (c.description && c.description.toLowerCase().includes(searchText));

        // دمج كافة الشروط
        return brandMatch && modelMatch && karMatch && priceMatch && 
               yearMatch && mileageMatch && fuelMatch && gearMatch && textMatch;
    });

    // إرسال النتائج المفلترة لدالة العرض
    render(filtered);
    
    // تحديث عنوان الصفحة بعدد النتائج
    const resultTitle = document.getElementById('resultTitle');
    if (resultTitle) {
        resultTitle.innerText = filtered.length > 0 
            ? `Hittade ${filtered.length} bilar som matchar din sökning` 
            : "Inga bilar matchade din sökning";
    }
}
