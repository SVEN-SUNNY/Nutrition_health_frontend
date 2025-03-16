// API Configuration
const API_URL = 'https://your-backend.onrender.com/plan';

// DOM Elements
const form = document.getElementById('nutritionForm');
const loader = document.getElementById('loader');
const resultSection = document.getElementById('resultSection');

// Debug Mode
const DEBUG_MODE = true; // Set to false in production

// Event Listeners
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (DEBUG_MODE) console.clear();
    
    toggleLoader(true);
    hideResults();

    try {
        const formData = getFormData();
        logDebug('Form Data:', formData);

        if (!validateForm(formData)) {
            throw new Error('Please select at least one diet preference and a health goal');
        }

        const plan = await fetchPlan(formData);
        logDebug('API Response:', plan);
        
        updatePlanUI(plan);
        showResults();

    } catch (error) {
        handleError(error);
    } finally {
        toggleLoader(false);
    }
});

// Core Functions
function getFormData() {
    return {
        diet: Array.from(document.querySelectorAll('#diet option:checked'))
                  .map(option => option.value),
        goal: document.getElementById('goal').value
    };
}

async function fetchPlan(formData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        logDebug('Request timed out after 2 minutes');
    }, 120000);

    try {
        logDebug('Sending request to:', API_URL);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        logDebug('Response Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        logDebug('Full Error:', error);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw new Error(error.message || 'Failed to generate nutrition plan');
    }
}

// UI Functions
function updatePlanUI(plan) {
    try {
        // Meals
        updateElement('breakfastMeal', plan.meals.breakfast);
        updateElement('lunchMeal', plan.meals.lunch);
        updateElement('dinnerMeal', plan.meals.dinner);

        // Macros
        updateElement('totalProtein', `${plan.macros.daily.protein}g`);
        updateElement('totalCarbs', `${plan.macros.daily.carbs}g`);
        updateElement('totalFats', `${plan.macros.daily.fats}g`);

        // Calories
        updateElement('breakfastCalories', plan.macros.breakfast.calories);
        updateElement('lunchCalories', plan.macros.lunch.calories);
        updateElement('dinnerCalories', plan.macros.dinner.calories);

        // Protein
        updateElement('breakfastProtein', plan.macros.breakfast.protein);
        updateElement('lunchProtein', plan.macros.lunch.protein);
        updateElement('dinnerProtein', plan.macros.dinner.protein);

    } catch (error) {
        throw new Error(`UI Update Failed: ${error.message}`);
    }
}

// Helper Functions
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function validateForm(formData) {
    return formData.diet.length > 0 && formData.goal;
}

function toggleLoader(show) {
    loader.classList.toggle('hidden', !show);
}

function showResults() {
    resultSection.classList.remove('hidden');
}

function hideResults() {
    resultSection.classList.add('hidden');
}

function handleError(error) {
    console.error('Error:', error);
    showError(error.message);
    hideResults();
}

function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${message}
    `;
    document.body.appendChild(errorEl);
    setTimeout(() => errorEl.remove(), 5000);
}

// Debug Utilities
function logDebug(...messages) {
    if (DEBUG_MODE) console.log('[DEBUG]', ...messages);
}

// Initialization
function init() {
    // Clear all UI fields
    document.querySelectorAll('[id]').forEach(element => {
        if (element.id.includes('Meal') || element.id.includes('Calories') || element.id.includes('Protein')) {
            element.textContent = '';
        }
    });
    
    // Reset macros
    updateElement('totalProtein', '0g');
    updateElement('totalCarbs', '0g');
    updateElement('totalFats', '0g');
    
    // Hide elements
    toggleLoader(false);
    hideResults();
}

// Start Application
init();

