// ========================================
// MAIN - Haupteinstieg und Koordination
// ========================================

// ES6+ Module Imports
import { loadData, getCategories } from './data.js';
import { filterByCuisine, searchByName, sortByRating } from './logic.js';
import { 
    renderFilterBar, 
    renderCards, 
    renderCount, 
    updateActiveCategory,
    updateFavoriteCount 
} from './render.js';

// ========================================
// STATE MANAGEMENT
// ========================================

// App State mit Object Property Shorthand
const state = {
    restaurants: [],
    categories: [],
    currentCuisine: 'Alle',
    searchTerm: '',
    sortDirection: 'desc',
    favorites: JSON.parse(localStorage.getItem('favorites')) || []
};

// ========================================
// DEBOUNCE FUNKTION
// ========================================

/**
 * Debounce Funktion - verzögert Ausführung bei schnellen Aufrufen
 * @param {Function} func - Funktion die verzögert werden soll
 * @param {number} delay - Verzögerung in Millisekunden
 * @returns {Function} - Debounced Funktion
 * 
 * ES6+ Features hier:
 * - Arrow Function
 * - Rest Parameter (...)
 * - Closure
 */
const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// ========================================
// FILTER & RENDER LOGIC
// ========================================
const applyFiltersAndRender = () => {
    const { restaurants, currentCuisine, searchTerm, sortDirection, favorites } = state; // Destructuring
    
    // Filter Pipeline
    let filtered = filterByCuisine(restaurants, currentCuisine);
    filtered = searchByName(filtered, searchTerm);
    filtered = sortByRating(filtered, sortDirection);
    
    // Rendering
    renderCards(filtered, favorites);
    renderCount(filtered.length);
};

// ========================================
// EVENT HANDLERS
// ========================================

const handleCategorySelect = (category) => {
    state.currentCuisine = category;
    updateActiveCategory(category);
    applyFiltersAndRender();
};

/**
 * Handler für Suche (mit Debounce)
 * ES6+ Features: Arrow Function, Event Destructuring
 */
const handleSearch = debounce((event) => {
    state.searchTerm = event.target.value;
    applyFiltersAndRender();
}, 300);

/**
 * Handler für Sortier-Toggle
 * ES6+ Features: Arrow Function, Ternary Operator
 */
const handleSortToggle = () => {
    state.sortDirection = state.sortDirection === 'desc' ? 'asc' : 'desc';
    
    // Button Text aktualisieren
    const sortButton = document.getElementById('sortButton');
    sortButton.textContent = `Bewertung ${state.sortDirection === 'desc' ? '▼' : '▲'}`;
    
    applyFiltersAndRender();
};

/**
 * Handler für Favoriten-Toggle
 * ES6+ Features: Arrow Function, Spread Operator, Array Methods
 */
const handleFavoriteToggle = (event) => {
    const button = event.target.closest('.favorite-btn');
    if (!button) return;
    
    const restaurantId = parseInt(button.dataset.id);
    
    // Toggle Favorit mit Spread Operator
    if (state.favorites.includes(restaurantId)) {
        state.favorites = state.favorites.filter(id => id !== restaurantId);
    } else {
        state.favorites = [...state.favorites, restaurantId]; // Spread
    }
    
    // LocalStorage speichern
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    
    // UI Update
    updateFavoriteCount(state.favorites.length);
    applyFiltersAndRender();
};

// ========================================
// EVENT LISTENER SETUP
// ========================================
const setupEventListeners = () => {
    // Suche
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', handleSearch); // Optional Chaining
    
    // Sortierung
    const sortButton = document.getElementById('sortButton');
    sortButton?.addEventListener('click', handleSortToggle);
    
    // Favoriten (Event Delegation)
    const restaurantGrid = document.getElementById('restaurantGrid');
    restaurantGrid?.addEventListener('click', handleFavoriteToggle);
};

// ========================================
// INITIALISIERUNG
// ========================================
const init = async () => {
    try {
        // Daten laden (async)
        state.restaurants = await loadData();
        state.categories = getCategories(state.restaurants);
        
        // Initial Rendering
        renderFilterBar(state.categories, handleCategorySelect);
        updateActiveCategory(state.currentCuisine);
        updateFavoriteCount(state.favorites.length);
        applyFiltersAndRender();
        
        // Event Listeners
        setupEventListeners();
        
        console.log('App erfolgreich initialisiert');
    } catch (error) {
        console.error('Fehler beim Initialisieren:', error);
    }
};

// App starten wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', init);