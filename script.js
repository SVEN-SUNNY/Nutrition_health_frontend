// API Configuration
const API_URL = 'https://nutrition-jetzy-backend.onrender.com/plan'; // Replace with your Render URL

// DOM Elements
const form = document.getElementById('nutritionForm');
const loader = document.getElementById('loader');
const resultSection = document.getElementById('resultSection');

// Meal Elements
const breakfastMeal = document.getElementById('breakfastMeal');
const breakfastCalories = document.getElementById('breakfastCalories');
const breakfastProtein = document.getElementById('breakfastProtein');

const lunchMeal = document.getElementById('lunchMeal');
const lunchCalories = document.getElementById('lunchCalories');
const lunchProtein = document.getElementById('lunchProtein');

const dinnerMeal = document.getElementById('dinnerMeal');
const dinnerCalories = document.getElementById('dinnerCalories');
const dinnerProtein = document.getElementById('dinnerProtein');

// Macro Elements
const totalProtein = document.getElementById('totalProtein');
const totalCarbs = document.getElementById('totalCarbs');
const totalFats = document.getElementById('totalFats');

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
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        throw new Error('Failed to fetch plan');
    }

    return await response.json();
}

function updatePlanUI(plan) {
    // Update breakfast
    breakfastMeal.textContent = plan.meals.breakfast;
    breakfastCalories.textContent = plan.macros.breakfast.calories;
    breakfastProtein.textContent = plan.macros.breakfast.protein;

    // Update lunch
    lunchMeal.textContent = plan.meals.lunch;
    lunchCalories.textContent = plan.macros.lunch.calories;
    lunchProtein.textContent = plan.macros.lunch.protein;

    // Update dinner
    dinnerMeal.textContent = plan.meals.dinner;
    dinnerCalories.textContent = plan.macros.dinner.calories;
    dinnerProtein.textContent = plan.macros.dinner.protein;

    // Update totals
    totalProtein.textContent = `${plan.macros.daily.protein}g`;
    totalCarbs.textContent = `${plan.macros.daily.carbs}g`;
    totalFats.textContent = `${plan.macros.daily.fats}g`;
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
    breakfastMeal.textContent = 'Oatmeal with berries';
    lunchMeal.textContent = 'Grilled chicken salad';
    dinnerMeal.textContent = 'Salmon with veggies';
    
    // Hide loader and results initially
    toggleLoader(false);
    hideResults();
}

// Run initialization
init();
