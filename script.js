// API Configuration
const API_URL = 'https://nutrition-jetzy-backend.onrender.com/plan';

// DOM Elements
const form = document.getElementById('nutritionForm');
const loader = document.getElementById('loader');
const resultSection = document.getElementById('resultSection');

// Meal Elements
const mealElements = {
  breakfast: {
    meal: document.getElementById('breakfastMeal'),
    calories: document.getElementById('breakfastCalories'),
    protein: document.getElementById('breakfastProtein')
  },
  lunch: {
    meal: document.getElementById('lunchMeal'),
    calories: document.getElementById('lunchCalories'),
    protein: document.getElementById('lunchProtein')
  },
  dinner: {
    meal: document.getElementById('dinnerMeal'),
    calories: document.getElementById('dinnerCalories'),
    protein: document.getElementById('dinnerProtein')
  }
};

// Macro Elements
const macroElements = {
  protein: document.getElementById('totalProtein'),
  carbs: document.getElementById('totalCarbs'),
  fats: document.getElementById('totalFats')
};

// Event Listeners
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    // Show loading state
    toggleLoading(true);
    clearErrors();
    
    // Get and validate form data
    const formData = getFormData();
    validateFormData(formData);
    
    // Fetch plan without timeout
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server returned an error');
    }
    
    const plan = await response.json();
    updatePlanUI(plan);
    
  } catch (error) {
    handleError(error);
  } finally {
    toggleLoading(false);
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

function validateFormData(formData) {
  if (!formData.diet.length) throw new Error('Please select at least one dietary preference');
  if (!formData.goal) throw new Error('Please select a health goal');
}

function updatePlanUI(plan) {
  try {
    // Update meals
    Object.entries(mealElements).forEach(([mealType, elements]) => {
      elements.meal.textContent = plan.meals[mealType] || 'Not available';
      elements.calories.textContent = plan.macros[mealType]?.calories ?? 'N/A';
      elements.protein.textContent = plan.macros[mealType]?.protein ?? 'N/A';
    });

    // Update macros
    Object.entries(macroElements).forEach(([macroType, element]) => {
      element.textContent = `${plan.macros.daily?.[macroType] ?? 'N/A'}g`;
    });

    // Show results
    resultSection.classList.remove('hidden');
  } catch (error) {
    console.error('UI Update Error:', error);
    showError('Failed to display plan. Invalid data format.');
  }
}

function toggleLoading(show) {
  loader.classList.toggle('hidden', !show);
  form.querySelector('button').disabled = show;
}

function handleError(error) {
  console.error('Application Error:', error);
  
  const errorMessage = error.message.includes('Failed to fetch') 
    ? 'Connection to server failed. Please check your internet connection.'
    : error.message || 'Failed to generate plan. Please try again later.';

  showError(errorMessage);
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

function clearErrors() {
  const existingErrors = document.querySelectorAll('.error-message');
  existingErrors.forEach(error => error.remove());
}

// Initialize default state
function init() {
  resultSection.classList.add('hidden');
  loader.classList.add('hidden');
  clearErrors();
}

// Start application
init();
