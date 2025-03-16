// API Configuration
const API_URL = 'https://your-backend.onrender.com/plan';

// DOM Elements
const form = document.getElementById('nutritionForm');
const loader = document.getElementById('loader');
const resultSection = document.getElementById('resultSection');

// Event Listeners
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loader and hide results
    toggleLoader(true);
    hideResults();

    try {
        // Get form data
        const formData = getFormData();
        
        // Validate input
        if (!formData.diet.length || !formData.goal) {
            throw new Error('Please fill all fields');
        }

        // Fetch plan from API
        const plan = await fetchPlan(formData);
        
        // Update UI with new plan
        updatePlanUI(plan);
        
    } catch (error) {
        // Handle errors
        console.error('Error:', error); // Log to console for debugging
        showError(error.message);
    } finally {
        // Hide loader and show results
        toggleLoader(false);
        showResults();
    }
});

// Helper Functions
function getFormData() {
    return {
        diet: Array.from(document.querySelectorAll('#diet option:checked'))
                  .map(option => option.value),
        goal: document.getElementById('goal').value
    };
}

async function fetchPlan(formData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2-minute timeout

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch plan');
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out after 2 minutes. Please try again.');
        }
        throw new Error(`API Error: ${error.message}`);
    }
}

function updatePlanUI(plan) {
    // Update breakfast
    document.getElementById('breakfastMeal').textContent = plan.meals.breakfast;
    document.getElementById('breakfastCalories').textContent = plan.macros.breakfast.calories;
    document.getElementById('breakfastProtein').textContent = plan.macros.breakfast.protein;

    // Update lunch
    document.getElementById('lunchMeal').textContent = plan.meals.lunch;
    document.getElementById('lunchCalories').textContent = plan.macros.lunch.calories;
    document.getElementById('lunchProtein').textContent = plan.macros.lunch.protein;

    // Update dinner
    document.getElementById('dinnerMeal').textContent = plan.meals.dinner;
    document.getElementById('dinnerCalories').textContent = plan.macros.dinner.calories;
    document.getElementById('dinnerProtein').textContent = plan.macros.dinner.protein;

    // Update totals
    document.getElementById('totalProtein').textContent = `${plan.macros.daily.protein}g`;
    document.getElementById('totalCarbs').textContent = `${plan.macros.daily.carbs}g`;
    document.getElementById('totalFats').textContent = `${plan.macros.daily.fats}g`;
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

// Initialization
function init() {
    // Set default values
    document.getElementById('breakfastMeal').textContent = 'Oatmeal with berries';
    document.getElementById('lunchMeal').textContent = 'Grilled chicken salad';
    document.getElementById('dinnerMeal').textContent = 'Salmon with veggies';
    
    // Hide loader and results initially
    toggleLoader(false);
    hideResults();
}

// Run initialization
init();

