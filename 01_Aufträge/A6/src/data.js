// ========================================
// DATENMODUL - Restaurant-Daten
// ========================================

/**
 * Restaurant-Daten Array mit 8 Restaurants
 * Verwendet Object Property Shorthand für saubere Objektdefinitionen
 */
const restaurants = [
    {
        id: 1,
        name: "Trattoria Roma",
        cuisine: "Italienisch",
        price: "€€",
        rating: 4.7,
        image: "images/Trattoria Roma.jpg"
    },
    {
        id: 2,
        name: "Sakura",
        cuisine: "Asiatisch",
        price: "€€",
        rating: 4.5,
        image: "images/Sakura.jpg"
    },
    {
        id: 3,
        name: "Green Leaf",
        cuisine: "Vegan",
        price: "€€",
        rating: 4.6,
        image: "images/Green Leaf.jpg"
    },
    {
        id: 4,
        name: "Burger Barn",
        cuisine: "Amerikanisch",
        price: "€",
        rating: 4.3,
        image: "images/Burger Barn.jpg"
    },
    {
        id: 5,
        name: "La Bodega",
        cuisine: "Mediterran",
        price: "€€",
        rating: 4.4,
        image: "images/La Bodega.jpg"
    },
    {
        id: 6,
        name: "Saigon Kitchen",
        cuisine: "Vietnamesisch",
        price: "€",
        rating: 4.5,
        image: "images/Saigon Kitchen.jpg"
    },
    {
        id: 7,
        name: "Maison Douce",
        cuisine: "Französisch",
        price: "€€€",
        rating: 4.8,
        image: "images/Maison Douce.jpg"
    },
    {
        id: 8,
        name: "El Toro Loco",
        cuisine: "Mexikanisch",
        price: "€€",
        rating: 4.6,
        image: "images/El Toro Loco.jpg"
    },
];

/**
 * Lädt Restaurant-Daten
 * @param {string} source - Optionaler Parameter für zukünftige Erweiterungen (z.B. API-URL)
 * @returns {Promise<Array>} - Promise mit Restaurant-Array
 * 
 * ES6+ Features hier:
 * - Default Parameter
 * - Arrow Function
 * - Promise
 */
const loadData = (source = 'local') => {
    // Simuliert asynchrones Laden für zukünftige API-Integration
    return Promise.resolve([...restaurants]); // Spread Operator für Kopie
};

/**
 * Extrahiert eindeutige Kategorien aus Restaurant-Daten
 * @param {Array} data - Restaurant-Array
 * @returns {Array} - Array mit Kategorien
 * 
 * ES6+ Features hier:
 * - Arrow Function
 * - Set für eindeutige Werte
 * - Spread Operator
 * - Array Destructuring
 */
const getCategories = (data) => {
    const cuisines = data.map(r => r.cuisine); // Arrow Function
    return ['Alle', ...new Set(cuisines)]; // Spread mit Set
};

// Named Exports
export { restaurants, loadData, getCategories };