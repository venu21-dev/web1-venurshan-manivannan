// ========================================
// ASYNC JAVASCRIPT - LocalEats A7
// ========================================
const state = {
    restaurants: [],
    stats: null,
    reviewsCache: {}, // Cache für geladene Reviews
    currentAbortController: null, // Für initiales Laden
    reviewAbortControllers: {} // Für Review-Requests pro Restaurant
};

// Cache-Key für localStorage
const CACHE_KEY = 'localeats_restaurants_cache';
const CACHE_TIMESTAMP_KEY = 'localeats_cache_timestamp';

/**
 * Fetch mit Timeout und AbortController
 * @param {string} url - URL zum Laden
 * @param {number} timeout - Timeout in Millisekunden (default: 5000)
 * @returns {Promise} - Response
 * 
 * ES6+ Features: Arrow Function, Default Parameters, Promise
 * 
 * FIX: Timeout funktioniert jetzt korrekt - verwendet internen Controller
 */
const fetchWithTimeout = async (url, timeout = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - Server antwortet nicht');
        }
        throw error;
    }
};

// ========================================
// CACHE FUNCTIONS (SWR - Stale While Revalidate)
// ========================================

/**
 * Speichert Daten im localStorage Cache
 * @param {Array} data - Zu cachende Daten
 */
const saveToCache = (data) => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.warn('Cache speichern fehlgeschlagen:', error);
    }
};

/**
 * Lädt Daten aus dem localStorage Cache
 * @returns {Array|null} - Gecachte Daten oder null
 */
const loadFromCache = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.warn('Cache laden fehlgeschlagen:', error);
        return null;
    }
};

/**
 * Prüft ob Cache-Daten vorhanden sind
 * @returns {boolean}
 */
const hasCachedData = () => {
    return loadFromCache() !== null;
};

// ========================================
// DATA LOADING FUNCTIONS
// ========================================

/**
 * Lädt Restaurants und Stats parallel
 * @param {boolean} useCache - Soll Cache verwendet werden?
 * @returns {Promise<Object>} - {restaurants, stats}
 * 
 * SWR (Stale-While-Revalidate):
 * - Falls Cache vorhanden: Sofort anzeigen OHNE Loading-State
 * - Dann im Hintergrund neue Daten laden und aktualisieren
 */
const loadInitialData = async (useCache = true) => {
    const hasCache = useCache && hasCachedData();
    
    // Falls Cache vorhanden: Sofort anzeigen (SWR - Stale)
    if (hasCache) {
        const cachedRestaurants = loadFromCache();
        state.restaurants = cachedRestaurants;
        renderRestaurants(cachedRestaurants);
        console.log('Cache geladen - Daten werden im Hintergrund aktualisiert...');
    } else {
        // Kein Cache: Zeige Loading-State
        showLoadingState();
    }
    
    try {
        // Neuer AbortController für manuellen Abbruch
        state.currentAbortController = new AbortController();
        
        // Promise.race um Abbruch zu ermöglichen
        const loadPromise = Promise.all([
            fetchWithTimeout('data/restaurants.json', 5000),
            fetchWithTimeout('data/stats.json', 5000)
        ]);
        
        // Auf Abbruch oder Completion warten
        const abortPromise = new Promise((_, reject) => {
            state.currentAbortController.signal.addEventListener('abort', () => {
                reject(new Error('Laden wurde abgebrochen'));
            });
        });
        
        const [restaurants, stats] = await Promise.race([loadPromise, abortPromise]);
        
        // Daten aktualisieren
        state.restaurants = restaurants;
        state.stats = stats;
        
        // In Cache speichern (SWR)
        saveToCache(restaurants);
        
        // UI aktualisieren (SWR - Revalidate)
        renderRestaurants(restaurants);
        updateStatsInfo(stats);
        hideLoadingState();
        hideErrorState();
        
        if (hasCache) {
            console.log('✅ Hintergrund-Update abgeschlossen');
        }
        
        return { restaurants, stats };
        
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        
        // Falls kein Cache vorhanden, zeige Fehler
        if (!hasCache) {
            showErrorState(error.message);
        } else {
            // Mit Cache: Stille Fehlerbehandlung
            console.warn('⚠️ Hintergrund-Update fehlgeschlagen, zeige gecachte Daten');
        }
        
        hideLoadingState();
        throw error;
    }
};

/**
 * Lädt Reviews für ein spezifisches Restaurant
 * @param {number} restaurantId - ID des Restaurants
 * @returns {Promise<Array>} - Gefilterte Reviews
 */
const loadReviews = async (restaurantId) => {
    // Falls bereits im Cache, direkt zurückgeben
    if (state.reviewsCache[restaurantId]) {
        return state.reviewsCache[restaurantId];
    }
    
    try {
        // Vorherigen Request für dieses Restaurant abbrechen (falls vorhanden)
        if (state.reviewAbortControllers[restaurantId]) {
            state.reviewAbortControllers[restaurantId].abort();
        }
        
        // Neuer AbortController für diesen Review-Request
        const controller = new AbortController();
        state.reviewAbortControllers[restaurantId] = controller;
        
        // Promise für Abbruch
        const loadPromise = fetchWithTimeout('data/reviews.json', 3000);
        
        const abortPromise = new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => {
                reject(new Error('AbortError'));
            });
        });
        
        // Alle Reviews laden
        const allReviews = await Promise.race([loadPromise, abortPromise]);
        
        // Nach restaurantId filtern
        const restaurantReviews = allReviews.filter(
            review => review.restaurantId === restaurantId
        );
        
        // In Cache speichern
        state.reviewsCache[restaurantId] = restaurantReviews;
        
        // Controller aufräumen
        delete state.reviewAbortControllers[restaurantId];
        
        return restaurantReviews;
        
    } catch (error) {
        // Controller aufräumen
        delete state.reviewAbortControllers[restaurantId];
        
        if (error.message === 'AbortError') {
            console.log('Review-Request abgebrochen für Restaurant', restaurantId);
            return null;
        }
        throw error;
    }
};

// ========================================
// UI STATE FUNCTIONS
// ========================================

const showLoadingState = () => {
    document.getElementById('loadingState').hidden = false;
    document.getElementById('cancelLoadButton').hidden = false;
    document.getElementById('restaurantGrid').setAttribute('aria-busy', 'true');
};

const hideLoadingState = () => {
    document.getElementById('loadingState').hidden = true;
    document.getElementById('cancelLoadButton').hidden = true;
    document.getElementById('restaurantGrid').setAttribute('aria-busy', 'false');
};

const showErrorState = (message = 'Fehler beim Laden der Restaurants.') => {
    const errorEl = document.getElementById('errorState');
    errorEl.querySelector('.error-message').textContent = message;
    errorEl.hidden = false;
};

const hideErrorState = () => {
    document.getElementById('errorState').hidden = true;
};

const updateStatsInfo = (stats) => {
    const { totalRestaurants, totalReviews, averageRating } = stats;
    document.getElementById('statsInfo').textContent = 
        `${totalRestaurants} Restaurants · ${totalReviews} Bewertungen · ⌀ ${averageRating}★`;
};

// ========================================
// RENDERING FUNCTIONS
// ========================================

/**
 * Erstellt HTML für eine Restaurant-Karte
 * @param {Object} restaurant - Restaurant-Daten
 * @returns {string} - HTML String
 */
const createRestaurantCard = (restaurant) => {
    const { id, name, cuisine, price, rating, image } = restaurant;
    
    return `
        <div class="restaurant-card" data-restaurant-id="${id}">
            <div class="restaurant-image">
                <img src="${image}" alt="${name}">
            </div>
            <div class="restaurant-content">
                <h2 class="restaurant-name">${name}</h2>
                <div class="restaurant-info">
                    <span class="info-badge">${cuisine}</span>
                    <span class="info-badge">${price}</span>
                </div>
                <div class="restaurant-rating">
                    <span class="rating-stars">★</span>
                    <span>${rating}</span>
                </div>
                <button 
                    class="reviews-toggle" 
                    data-restaurant-id="${id}"
                    aria-expanded="false"
                    aria-controls="reviews-${id}"
                >
                    Bewertungen anzeigen
                </button>
                <div id="reviews-${id}" class="reviews-section" hidden aria-live="polite">
                    <!-- Reviews werden hier eingefügt -->
                </div>
            </div>
        </div>
    `;
};

/**
 * Rendert alle Restaurants
 * @param {Array} restaurants - Restaurant-Array
 */
const renderRestaurants = (restaurants) => {
    const container = document.getElementById('restaurantGrid');
    const html = restaurants.map(createRestaurantCard).join('');
    container.innerHTML = html;
    
    // Event Listeners für Review-Buttons
    attachReviewListeners();
    
    // Trefferzahl aktualisieren
    updateResultCount(restaurants.length);
};

/**
 * Rendert Reviews für ein Restaurant
 * @param {number} restaurantId - Restaurant ID
 * @param {Array} reviews - Reviews Array
 */
const renderReviews = (restaurantId, reviews) => {
    const container = document.getElementById(`reviews-${restaurantId}`);
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="reviews-loading">Keine Bewertungen verfügbar.</p>';
        return;
    }
    
    const html = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <span class="review-author">${review.author}</span>
                <span class="review-rating">${'★'.repeat(review.rating)}</span>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join('');
    
    container.innerHTML = html;
};

const updateResultCount = (count) => {
    document.getElementById('resultCount').textContent = `Treffer: ${count}`;
};

// ========================================
// EVENT HANDLERS
// ========================================

/**
 * Fügt Event Listeners zu Review-Buttons hinzu
 */
const attachReviewListeners = () => {
    const buttons = document.querySelectorAll('.reviews-toggle');
    
    buttons.forEach(button => {
        button.addEventListener('click', handleReviewToggle);
    });
};

/**
 * Handler für Review-Toggle
 * @param {Event} event - Click Event
 */
const handleReviewToggle = async (event) => {
    const button = event.target;
    const restaurantId = parseInt(button.dataset.restaurantId);
    const reviewsSection = document.getElementById(`reviews-${restaurantId}`);
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    // Toggle Zustand
    if (isExpanded) {
        // Schließen
        reviewsSection.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        button.textContent = 'Bewertungen anzeigen';
        
        // Laufenden Request abbrechen (falls vorhanden)
        if (state.reviewAbortControllers[restaurantId]) {
            state.reviewAbortControllers[restaurantId].abort();
        }
    } else {
        // Öffnen und laden
        button.setAttribute('aria-expanded', 'true');
        button.textContent = 'Bewertungen ausblenden';
        reviewsSection.hidden = false;
        
        // Ladezustand anzeigen
        reviewsSection.innerHTML = '<p class="reviews-loading">Lade Bewertungen...</p>';
        
        try {
            const reviews = await loadReviews(restaurantId);
            
            // Nur rendern wenn nicht abgebrochen
            if (reviews !== null) {
                renderReviews(restaurantId, reviews);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Reviews:', error);
            reviewsSection.innerHTML = '<p class="reviews-loading">Fehler beim Laden der Bewertungen.</p>';
        }
    }
};

/**
 * Handler für Retry-Button
 */
const handleRetry = () => {
    hideErrorState();
    loadInitialData(false); // Cache nicht verwenden beim Retry
};

/**
 * Handler für Cancel-Button (Laden abbrechen)
 */
const handleCancelLoad = () => {
    if (state.currentAbortController) {
        state.currentAbortController.abort();
        console.log('Laden wurde manuell abgebrochen');
    }
};

/**
 * Initialisierung der App
 */
const init = async () => {
    try {
        // Event Listeners
        document.getElementById('retryButton')?.addEventListener('click', handleRetry);
        document.getElementById('cancelLoadButton')?.addEventListener('click', handleCancelLoad);
        
        // Initial laden (mit SWR-Cache)
        await loadInitialData(true);
        
        console.log('App erfolgreich initialisiert');
    } catch (error) {
        console.error('Initialisierung fehlgeschlagen:', error);
    }
};

// App starten
document.addEventListener('DOMContentLoaded', init);

// ========================================
// TESTS
// ========================================

/**
 * Testet fetchWithTimeout Funktion
 */
const testFetchWithTimeout = async () => {
    console.log('=== TEST 1: fetchWithTimeout ===');
    
    try {
        // Test mit gültiger URL
        const data = await fetchWithTimeout('data/stats.json', 5000);
        const passed = data && data.totalRestaurants > 0;
        
        if (passed) {
            console.log('Test 1 bestanden: fetchWithTimeout lädt Daten korrekt');
        } else {
            console.log('Test 1 fehlgeschlagen: Daten nicht korrekt geladen');
        }
        
        return passed;
    } catch (error) {
        console.log('Test 1 fehlgeschlagen:', error.message);
        return false;
    }
};

/**
 * Testet Cache-Logik
 */
const testCacheLogic = () => {
    console.log('=== TEST 2: Cache-Logik ===');
    
    // Test-Daten
    const testData = [{ id: 1, name: 'Test Restaurant' }];
    
    // Speichern
    saveToCache(testData);
    
    // Laden
    const loaded = loadFromCache();
    
    // Vergleichen
    const passed = loaded && 
                   loaded.length === 1 && 
                   loaded[0].id === 1 && 
                   loaded[0].name === 'Test Restaurant';
    
    if (passed) {
        console.log('Test 2 bestanden: Cache speichert und lädt Daten korrekt');
    } else {
        console.log('Test 2 fehlgeschlagen: Cache-Logik fehlerhaft');
    }
    
    // Aufräumen
    localStorage.removeItem(CACHE_KEY);
    
    return passed;
};

/**
 * Führt alle Tests aus
 */
const runTests = async () => {
    console.log('\n=== TESTS STARTEN ===\n');
    
    const test1 = await testFetchWithTimeout();
    const test2 = testCacheLogic();
    
    console.log('\n===================');
    if (test1 && test2) {
        console.log('ALLE TESTS BESTANDEN');
    } else {
        console.log('EINIGE TESTS FEHLGESCHLAGEN');
    }
    console.log('===================\n');
};

// Tests nach 2 Sekunden ausführen (damit App geladen ist)
setTimeout(runTests, 2000);