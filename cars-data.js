/**
 * BILHK - Car Data Repository
 * قاعدة بيانات الماركات والموديلات - نسخة كاملة وشاملة للسوق السويدي
 */

const carData = {
    "Volvo": [
        "V40", "V60", "V70", "V90", "XC40", "XC60", "XC90", 
        "S40", "S60", "S80", "S90", "C30", "C40", "EX30", "EX90", 
        "240", "740", "850", "940", "Amazon"
    ],
    "Volkswagen": [
        "Golf", "Passat", "Polo", "Tiguan", "Touareg", "Touran", 
        "T-Roc", "T-Cross", "ID.3", "ID.4", "ID.5", "ID.7", "ID. Buzz",
        "Arteon", "Sharan", "Caddy", "Transporter", "Beetle", "Scirocco"
    ],
    "BMW": [
        "1-serie", "2-serie", "3-serie", "4-serie", "5-serie", "6-serie", "7-serie", "8-serie",
        "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z3", "Z4",
        "i3", "i4", "iX1", "iX3", "iX", "M2", "M3", "M4", "M5"
    ],
    "Audi": [
        "A1", "A3", "A4", "A5", "A6", "A7", "A8", 
        "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "e-tron", "e-tron GT",
        "TT", "R8", "RS3", "RS4", "RS5", "RS6"
    ],
    "Mercedes-Benz": [
        "A-Klass", "B-Klass", "C-Klass", "E-Klass", "S-Klass", 
        "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Klass",
        "EQA", "EQB", "EQC", "EQE", "EQS", "V-Klass", "Sprinter", "SL"
    ],
    "Toyota": [
        "Corolla", "Yaris", "Auris", "Avensis", "RAV4", "C-HR", "Aygo",
        "Land Cruiser", "Hilux", "Prius", "Supra", "Proace", "bZ4X", "Camry"
    ],
    "Kia": [
        "Ceed", "Sportage", "Niro", "Picanto", "Rio", "Sorento", "Stinger",
        "EV6", "EV9", "Stonic", "XCeed", "Optima", "Soul"
    ],
    "Tesla": [
        "Model 3", "Model Y", "Model S", "Model X", "Cybertruck", "Roadster"
    ],
    "Saab": [
        "9-3", "9-5", "900", "9000", "9-2X", "9-4X", "9-7X"
    ],
    "Ford": [
        "Focus", "Fiesta", "Mondeo", "Kuga", "Mustang", "Mustang Mach-E",
        "Explorer", "Puma", "Transit", "Ranger", "S-Max", "Galaxy"
    ],
    "Hyundai": [
        "i10", "i20", "i30", "Ioniq", "Ioniq 5", "Ioniq 6", "Kona", 
        "Tucson", "Santa Fe", "Bayon", "i40"
    ],
    "Peugeot": [
        "208", "308", "2008", "3008", "5008", "508", "Partner", "Expert", "Boxer"
    ],
    "Renault": [
        "Clio", "Megane", "Captur", "Zoe", "Kadjar", "Austral", "Scenic",
        "Kangoo", "Master", "Trafic"
    ],
    "Skoda": [
        "Octavia", "Fabia", "Superb", "Kodiaq", "Karoq", "Kamiq", "Enyaq"
    ],
    "Nissan": [
        "Qashqai", "Juke", "Leaf", "Ariya", "X-Trail", "Navara", "Micra", "NV200"
    ],
    "Mazda": [
        "CX-5", "CX-30", "CX-60", "Mazda3", "Mazda6", "MX-5", "MX-30", "Mazda2"
    ],
    "Porsche": [
        "911", "Cayenne", "Macan", "Panamera", "Taycan", "718 Boxster", "718 Cayman"
    ],
    "Land Rover": [
        "Range Rover", "Range Rover Sport", "Range Rover Velar", "Evoque", 
        "Discovery", "Discovery Sport", "Defender"
    ],
    "Lexus": [
        "NX", "RX", "UX", "ES", "IS", "LS", "LC", "RZ"
    ],
    "Honda": [
        "Civic", "CR-V", "HR-V", "Jazz", "Honda e", "ZR-V"
    ],
    "Dacia": [
        "Duster", "Sandero", "Jogger", "Spring", "Logan"
    ],
    "Polestar": [
        "Polestar 1", "Polestar 2", "Polestar 3", "Polestar 4"
    ],
    "Cupra": [
        "Formentor", "Born", "Leon", "Ateca", "Tavascan"
    ],
    "Subaru": [
        "Outback", "Forester", "XV", "Solterra", "Impreza"
    ],
    "Suzuki": [
        "Swift", "Vitara", "S-Cross", "Jimny", "Ignis", "Across"
    ],
    "Mini": [
        "Cooper", "Countryman", "Clubman", "Convertible"
    ],
    "Jaguar": [
        "F-Pace", "I-Pace", "E-Pace", "XF", "XE", "F-Type"
    ],
    "Alfa Romeo": [
        "Giulia", "Stelvio", "Tonale", "Guilietta"
    ],
    "MG": [
        "MG4", "MG5", "ZS EV", "Marvel R", "EHS"
    ],
    "BYD": [
        "Atto 3", "Han", "Tang", "Dolphin", "Seal"
    ]
};

// خيارات الوقود
export const fuelTypes = [
    "Bensin", 
    "Diesel", 
    "El", 
    "Hybrid", 
    "Laddhybrid", 
    "Etanol", 
    "Gas"
];

// خيارات ناقل الحركة
export const transmissionTypes = [
    "Automat", 
    "Manuell"
];

// تصدير البيانات لتكون متاحة في الملفات الأخرى
export default carData;
