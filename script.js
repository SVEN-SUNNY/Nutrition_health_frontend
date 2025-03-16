const API_URL = 'https://nutrition-jetzy-backend.onrender.com/plan';

// DOM Elements
const form = document.getElementById('nutritionForm');
const loader = document.getElementById('loader');
const resultSection = document.getElementById('resultSection');

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    resetUI();
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetUI();
    toggleLoader(true);

    try {
        const formData = getFormData();
        validateForm(formData);
        
        const plan = await fetchPlan(formData);
        updateUI(plan);
        resultSection.classList.remove('hidden');
        
    } catch (error) {
        showError(error.message);
    } finally {
        toggleLoader(false);
    }
});

function getFormData() {
    return {
        diet: Array.from(document.querySelectorAll('#diet option:checked'))
                  .map(option => option.value),
        goal: document.getElementById('goal').value
    };
}

async function fetchPlan(formData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.name === 'AbortError' 
            ? 'Request timed out. Please try again.' 
            : error.message);
    }
}

function updateUI(plan) {
    document.getElementById('breakfastMeal').textContent = plan.meals.breakfast;
    document.getElementById('lunchMeal').textContent = plan.meals.lunch;
    document.getElementById('dinnerMeal').textContent = plan.meals.dinner;

    document.getElementById('breakfastCalories').textContent = plan.macros.breakfast.calories;
    document.getElementById('lunchCalories').textContent = plan.macros.lunch.calories;
    document.getElementById('dinnerCalories').textContent = plan.macros.dinner.calories;

    document.getElementById('breakfastProtein').textContent = plan.macros.breakfast.protein;
    document.getElementById('lunchProtein').textContent = plan.macros.lunch.protein;
    document.getElementById('dinnerProtein').textContent = plan.macros.dinner.protein;

    document.getElementById('totalProtein').textContent = `${plan.macros.daily.protein}g`;
    document.getElementById('totalCarbs').textContent = `${plan.macros.daily.carbs}g`;
    document.getElementById('totalFats').textContent = `${plan.macros.daily.fats}g`;
}

function validateForm({ diet, goal }) {
    if (!diet.length || !goal) throw new Error('Please fill all required fields');
}

function resetUI() {
    resultSection.classList.add('hidden');
    document.querySelectorAll('[id*="Meal"], [id*="Calories"], [id*="Protein"]')
        .forEach(el => el.textContent = '');
    ['totalProtein', 'totalCarbs', 'totalFats'].forEach(id => {
        document.getElementById(id).textContent = '0g';
    });
}

function toggleLoader(show) {
    loader.classList.toggle('hidden', !show);
}

function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    document.body.appendChild(errorEl);
    setTimeout(() => errorEl.remove(), 5000);
}
