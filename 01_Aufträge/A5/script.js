// DATEN: Restaurant-Array
const restaurants = [
    {
        id: 1,
        name: "Trattoria Roma",
        cuisine: "Italienisch",
        priceLevel: "€€",
        rating: 4.7,
        image: "images/small_menu1.png" 
    },
    {
        id: 2,
        name: "Sakura",
        cuisine: "Asiatisch",
        priceLevel: "€€",
        rating: 4.5,
        image: "images/small_menu1.png" 
    },
    {
        id: 3,
        name: "Green Leaf",
        cuisine: "Vegan",
        priceLevel: "€€",
        rating: 4.6,
        image: "images/small_menu1.png" 
    },
    {
        id: 4,
        name: "Burger Barn",
        cuisine: "Amerikanisch",
        priceLevel: "€",
        rating: 4.3,
        image: "images/small_menu1.png" 
    },
    {
        id: 5,
        name: "La Bodega",
        cuisine: "Mediterran",
        priceLevel: "€€",
        rating: 4.4,
        image: "images/small_menu1.png" 
    },
    {
        id: 6,
        name: "Saigon Kitchen",
        cuisine: "Vietnamesisch",
        priceLevel: "€",
        rating: 4.5,
        image: "images/small_menu1.png" 
    },
    {
        id: 7,
        name: "Maison Douce",
        cuisine: "Französisch",
        priceLevel: "€€€",
        rating: 4.8,
        image: "images/small_menu1.png"  
    }
];

// Kategorien für Filter
const categories = ["Alle", ...new Set(restaurants.map(r => r.cuisine))];

// Aktueller Filter-Status
let currentFilter = "Alle";

// Favoriten aus localStorage laden
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];


// LOGIK: Filterfunktion

/**
 * Filtert Restaurants nach Kategorie
 * @param {Array} restaurantList - Array von Restaurant-Objekten
 * @param {string} category - Kategorie zum Filtern
 * @returns {Array} - Gefiltertes Array
 */
function filterRestaurants(restaurantList, category) {
    if (category === "Alle") {
        return restaurantList;
    }
    return restaurantList.filter(restaurant => restaurant.cuisine === category);
}


// DOM-LOGIK: Rendering
function renderCategoryButtons() {
    const container = document.getElementById('categoryButtons');
    container.innerHTML = '';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.setAttribute('aria-pressed', category === currentFilter ? 'true' : 'false');
        
        button.addEventListener('click', () => {
            currentFilter = category;
            renderCategoryButtons();
            renderRestaurants();
        });
        
        container.appendChild(button);
    });
}

/**
 * Erstellt HTML für eine Restaurant-Karte
 * @param {Object} restaurant - Restaurant-Objekt
 * @returns {string} - HTML-String
 */
function createRestaurantCard(restaurant) {
    const isFavorite = favorites.includes(restaurant.id);
    const starClass = isFavorite ? 'active' : '';
    const starIcon = isFavorite ? '★' : '☆';
    
    return `
        <div class="restaurant-card">
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${restaurant.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="restaurant-content">
                <div class="restaurant-header">
                    <h2 class="restaurant-name">${restaurant.name}</h2>
                    <button 
                        class="favorite-btn ${starClass}" 
                        data-id="${restaurant.id}"
                        aria-label="Als Favorit markieren"
                    >
                        ${starIcon}
                    </button>
                </div>
                <div class="restaurant-info">
                    <span class="info-badge">${restaurant.cuisine}</span>
                    <span class="info-badge">${restaurant.priceLevel}</span>
                </div>
                <div class="restaurant-rating">
                    <span class="rating-stars">★</span>
                    <span>${restaurant.rating}</span>
                </div>
            </div>
        </div>
    `;
}

/*Rendert die gefilterten Restaurants*/
function renderRestaurants() {
    const filteredData = filterRestaurants(restaurants, currentFilter);
    const container = document.getElementById('restaurantGrid');
    const noResultsEl = document.getElementById('noResults');
    const resultCountEl = document.getElementById('resultCount');
    
    // Trefferzahl aktualisieren
    resultCountEl.textContent = `Treffer: ${filteredData.length}`;
    
    // Keine Ergebnisse
    if (filteredData.length === 0) {
        container.innerHTML = '';
        noResultsEl.hidden = false;
        return;
    }
    
    // Ergebnisse anzeigen
    noResultsEl.hidden = true;
    container.innerHTML = filteredData.map(createRestaurantCard).join('');
    
    // Event Listener für Favoriten-Buttons
    attachFavoriteListeners();
}

/*Fügt Event Listener zu allen Favoriten-Buttons hinzu*/
function attachFavoriteListeners() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const restaurantId = parseInt(e.currentTarget.dataset.id);
            toggleFavorite(restaurantId);
        });
    });
}

// FAVORITEN-LOGIK

/**
 * Togglet ein Restaurant als Favorit
 * @param {number} restaurantId - ID des Restaurants
 */
function toggleFavorite(restaurantId) {
    const index = favorites.indexOf(restaurantId);
    
    if (index > -1) {
        // Entfernen
        favorites.splice(index, 1);
    } else {
        // Hinzufügen
        favorites.push(restaurantId);
    }
    
    // In localStorage speichern
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // UI aktualisieren
    updateFavoriteCount();
    renderRestaurants();
}

/*Aktualisiert die Favoriten-Anzeige im Header*/
function updateFavoriteCount() {
    const countEl = document.getElementById('favoriteCount');
    countEl.textContent = `Favoriten: ${favorites.length}`;
}

// INITIALISIERUNG
function initApp() {
    renderCategoryButtons();
    renderRestaurants();
    updateFavoriteCount();
    runTests();
}

// App starten wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', initApp);

// MINI-TESTS
function runTests() {
    console.log("=== MINI-TESTS STARTEN ===");
    
    let allTestsPassed = true;
    
    // Test 1: Filter "Alle" sollte alle Restaurants zurückgeben
    const test1Result = filterRestaurants(restaurants, "Alle");
    const test1Passed = test1Result.length === restaurants.length;
    
    if (test1Passed) {
        console.log("Test 1 bestanden: Filter 'Alle' gibt alle Restaurants zurück");
    } else {
        console.log("Test 1 fehlgeschlagen");
        allTestsPassed = false;
    }
    
    // Test 2: Filter "Italienisch" sollte nur italienische Restaurants zurückgeben
    const test2Result = filterRestaurants(restaurants, "Italienisch");
    const test2Passed = test2Result.length === 1 && 
                        test2Result[0].cuisine === "Italienisch" && 
                        test2Result[0].name === "Trattoria Roma";
    
    if (test2Passed) {
        console.log("Test 2 bestanden: Filter 'Italienisch' funktioniert korrekt");
    } else {
        console.log("Test 2 fehlgeschlagen");
        allTestsPassed = false;
    }
    
    // Gesamtergebnis
    console.log("===================");
    if (allTestsPassed) {
        console.log("ALLE TESTS BESTANDEN");
    } else {
        console.log("EINIGE TESTS FEHLGESCHLAGEN");
    }
    console.log("===================");
}