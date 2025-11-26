// ========================================
// RENDERING-MODUL - DOM-Manipulation
// ========================================

/**
 * Rendert die Kategorie-Filter-Buttons
 * @param {Array} categories - Array mit Kategorien
 * @param {Function} onSelect - Callback-Funktion bei Kategorie-Auswahl
 * 
 * ES6+ Features hier:
 * - Arrow Function
 * - Template Strings
 * - Array.forEach()
 * - Arrow Function in Callback
 */
export const renderFilterBar = (categories, onSelect) => {
    const container = document.getElementById('categoryButtons');
    if (!container) return;
    
    container.innerHTML = '';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.setAttribute('aria-pressed', 'false');
        
        // Event Listener mit Arrow Function
        button.addEventListener('click', () => onSelect(category));
        
        container.appendChild(button);
    });
};

/**
 * Aktualisiert die aktive Kategorie visuell
 * @param {string} activeCategory - Die aktive Kategorie
 * 
 * ES6+ Features hier:
 * - Arrow Function
 * - forEach mit Arrow Function
 */
export const updateActiveCategory = (activeCategory) => {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        const isActive = btn.textContent === activeCategory;
        btn.setAttribute('aria-pressed', isActive.toString());
    });
};

/**
 * Erstellt HTML für eine Restaurant-Karte
 * @param {Object} restaurant - Restaurant-Objekt
 * @param {boolean} isFavorite - Ist Restaurant ein Favorit?
 * @returns {string} - HTML-String
 * 
 * ES6+ Features hier:
 * - Arrow Function
 * - Template Strings mit Expressions
 * - Destructuring im Parameter (könnte erweitert werden)
 * - Ternary Operator
 */
export const createRestaurantCard = (restaurant, isFavorite = false) => {
    const { id, name, cuisine, price, rating, image } = restaurant; // Destructuring
    const starIcon = isFavorite ? '★' : '☆';
    const starClass = isFavorite ? 'active' : '';
    
    return `
        <div class="restaurant-card">
            <div class="restaurant-image">
                <img src="${image}" alt="${name}">
            </div>
            <div class="restaurant-content">
                <div class="restaurant-header">
                    <h2 class="restaurant-name">${name}</h2>
                    <button 
                        class="favorite-btn ${starClass}" 
                        data-id="${id}"
                        aria-label="Als Favorit markieren"
                    >
                        ${starIcon}
                    </button>
                </div>
                <div class="restaurant-info">
                    <span class="info-badge">${cuisine}</span>
                    <span class="info-badge">${price}</span>
                </div>
                <div class="restaurant-rating">
                    <span class="rating-stars">★</span>
                    <span>${rating}</span>
                </div>
            </div>
        </div>
    `;
};

/**
 * Rendert alle Restaurant-Karten
 * @param {Array} restaurants - Array mit Restaurants
 * @param {Array} favorites - Array mit Favoriten-IDs
 * 
 * ES6+ Features hier:
 * - Arrow Function
 * - Array.map()
 * - Array.includes()
 * - Template Strings
 */
export const renderCards = (restaurants, favorites = []) => {
    const container = document.getElementById('restaurantGrid');
    if (!container) return;
    
    const html = restaurants
        .map(restaurant => createRestaurantCard(restaurant, favorites.includes(restaurant.id)))
        .join('');
    
    container.innerHTML = html;
};

/**
 * Zeigt die Trefferzahl an
 * @param {number} count - Anzahl der Treffer
 * 
 * ES6+ Features hier:
 * - Arrow Function
 * - Template String
 */
export const renderCount = (count) => {
    const countElement = document.getElementById('resultCount');
    const noResultsElement = document.getElementById('noResults');
    
    if (!countElement || !noResultsElement) return;
    
    countElement.textContent = `Treffer: ${count}`;
    
    // Zeige "Keine Ergebnisse" Nachricht
    if (count === 0) {
        noResultsElement.hidden = false;
        document.getElementById('restaurantGrid').innerHTML = '';
    } else {
        noResultsElement.hidden = true;
    }
};

/**
 * Aktualisiert den Favoriten-Counter im Header
 * @param {number} count - Anzahl der Favoriten
 * 
 * ES6+ Features hier:
 * - Arrow Function
 * - Template String
 * - Optional Chaining (?.)
 */
export const updateFavoriteCount = (count) => {
    const element = document.getElementById('favoriteCount');
    if (element) {
        element.textContent = `Favoriten: ${count}`;
    }
};