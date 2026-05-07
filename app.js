function applyDeepSearch(p) {
    const filtered = allCars.filter(c => {
        const brandMatch = !p.get('brand') || p.get('brand') === 'all' || c.brand === p.get('brand');
        const modelMatch = !p.get('model') || p.get('model') === 'all' || c.model === p.get('model');
        const karMatch = !p.get('kar') || p.get('kar') === 'all' || c.bodyType === p.get('kar');
        
        const minP = Number(p.get('minPrice')) || 0;
        const maxP = Number(p.get('maxPrice')) || Infinity;
        const priceMatch = Number(c.price) >= minP && Number(c.price) <= maxP;
        
        const maxM = Number(p.get('maxMileage')) || Infinity;
        const mileageMatch = Number(c.mileage) <= maxM;

        return brandMatch && modelMatch && karMatch && priceMatch && mileageMatch;
    });
    render(filtered);
}