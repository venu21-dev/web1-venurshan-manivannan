// ========================================
// LOGIKMODUL - Reine Datenfunktionen
// ========================================

/**
 * Filtert Restaurants nach Küchen-Kategorie
 * @param {Array} data - Restaurant-Array
 * @param {string} cuisine - Kategorie zum Filtern (z.B. "Italienisch" oder "Alle")
 * @returns {Array} - Gefiltertes Array
 */
export const filterByCuisine = (data, cuisine) => {
    return cuisine === 'Alle' 
        ? data 
        : data.filter(restaurant => restaurant.cuisine === cuisine);
};

/**
 * Durchsucht Restaurant-Namen (case-insensitive)
 * @param {Array} data - Restaurant-Array
 * @param {string} term - Suchbegriff
 * @returns {Array} - Gefiltertes Array
 */
export const searchByName = (data, term = '') => {
    if (!term?.trim()) return data; // Optional Chaining + Nullish Check
    
    const searchTerm = term.toLowerCase();
    return data.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm)
    );
};

/**
 * Sortiert Restaurants nach Bewertung
 * @param {Array} data - Restaurant-Array
 * @param {string} direction - Sortierrichtung: "asc" oder "desc"
 * @returns {Array} - Sortiertes Array (neue Kopie)
 */
export const sortByRating = (data, direction = 'desc') => {
    // Kopie erstellen um Original nicht zu verändern
    return [...data].sort((a, b) => {
        return direction === 'desc' 
            ? b.rating - a.rating  // Absteigend
            : a.rating - b.rating; // Aufsteigend
    });
};

/**
 * Kombiniert alle Filter-Funktionen
 * Pipeline-Funktion die Filter, Suche und Sortierung nacheinander anwendet
 * 
 * @param {Array} data - Restaurant-Array
 * @param {Object} options - Filter-Optionen
 * @returns {Array} - Verarbeitetes Array
 */
export const applyFilters = (data, { cuisine = 'Alle', searchTerm = '', sortDirection = 'desc' } = {}) => {
    let result = data;
    
    // Filter anwenden
    result = filterByCuisine(result, cuisine);
    
    // Suche anwenden
    result = searchByName(result, searchTerm);
    
    // Sortierung anwenden
    result = sortByRating(result, sortDirection);
    
    return result;
};