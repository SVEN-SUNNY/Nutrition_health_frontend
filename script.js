document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nutritionForm');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('resultSection');
    const planOptionsContainer = document.getElementById('planOptions');
    const API_URL = 'https://nutrition-jetzy-backend.onrender.com/plan';
    let currentPlans = [];

    // Form Submission Handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            diet: Array.from(document.querySelectorAll('#diet option:checked'))
                      .map(option => option.value),
            goal: document.getElementById('goal').value
        };

        if (!formData.name || formData.diet.length === 0 || !formData.goal) {
            showError('Please fill in all required fields');
            return;
        }

        try {
            toggleLoading(true);
            resetResults();

            // Fetch recommendations
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const responseData = await response.json();

            if (!response.ok || !responseData.success) {
                throw new Error(responseData.error || 'Failed to generate plans');
            }

            currentPlans = responseData.plans;
            displayPlanOptions(currentPlans);

        } catch (error) {
            console.error('API Error:', error);
            showError(error.message || 'Failed to generate plans. Please try again.');
        } finally {
            toggleLoading(false);
        }
    });

    // Display Plan Options
    function displayPlanOptions(plans) {
        planOptionsContainer.innerHTML = '';
        planOptionsContainer.classList.remove('hidden');
        
        plans.forEach(plan => {
            const planCard = document.createElement('div');
            planCard.className = 'plan-card';
            planCard.innerHTML = `
                <div class="plan-card-header">
                    <h3>${plan.name}</h3>
                    ${plan.confidence ? `<div class="confidence-badge">${Math.round(plan.confidence * 100)}% Match</div>` : ''}
                </div>
                <div class="plan-card-body">
                    <div class="meal-preview">
                        <p><strong>Breakfast:</strong> ${plan.meals.breakfast}</p>
                        <p><strong>Lunch:</strong> ${plan.meals.lunch}</p>
                        <p><strong>Dinner:</strong> ${plan.meals.dinner}</p>
                    </div>
                    <div class="plan-stats">
                        <div class="stat-item">
                            <i class="fas fa-fire"></i>
                            <span>${plan.calories} kcal</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-dumbbell"></i>
                            <span>${plan.macros.daily.protein}g protein</span>
                        </div>
                    </div>
                </div>
                <button class="select-plan" data-plan-id="${plan.id}">
                    Select Plan
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
            
            planOptionsContainer.appendChild(planCard);
        });

        // Add event listeners to selection buttons
        document.querySelectorAll('.select-plan').forEach(button => {
            button.addEventListener('click', handlePlanSelection);
        });
    }

    // Plan Selection Handler
    async function handlePlanSelection(e) {
        const planId = parseInt(e.currentTarget.dataset.planId);
        const selectedPlan = currentPlans.find(plan => plan.id === planId);

        try {
            toggleLoading(true);
            
            // Send selection to backend
            await fetch('/selection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: document.getElementById('name').value.trim(),
                    diet: Array.from(document.querySelectorAll('#diet option:checked'))
                              .map(option => option.value),
                    goal: document.getElementById('goal').value,
                    selected_plan_id: planId
                })
            });

            // Display selected plan details
            planOptionsContainer.classList.add('hidden');
            displayPlanDetails(selectedPlan);

        } catch (error) {
            console.error('Selection Error:', error);
            showError('Failed to save selection. Please try again.');
        } finally {
            toggleLoading(false);
        }
    }

    // Display Selected Plan Details
    function displayPlanDetails(plan) {
        // Personalization
        document.getElementById('userName').textContent = document.getElementById('name').value.trim();
        document.getElementById('planType').textContent = plan.name;

        // Meal details
        document.getElementById('breakfastMeal').textContent = plan.meals.breakfast;
        document.getElementById('lunchMeal').textContent = plan.meals.lunch;
        document.getElementById('dinnerMeal').textContent = plan.meals.dinner;

        // Nutrition facts
        document.getElementById('breakfastCalories').textContent = plan.macros.breakfast.calories;
        document.getElementById('breakfastProtein').textContent = plan.macros.breakfast.protein;
        document.getElementById('lunchCalories').textContent = plan.macros.lunch.calories;
        document.getElementById('lunchProtein').textContent = plan.macros.lunch.protein;
        document.getElementById('dinnerCalories').textContent = plan.macros.dinner.calories;
        document.getElementById('dinnerProtein').textContent = plan.macros.dinner.protein;

        // Daily macros
        document.getElementById('totalCalories').textContent = plan.calories;
        document.getElementById('proteinValue').textContent = `${plan.macros.daily.protein}g`;
        document.getElementById('carbsValue').textContent = `${plan.macros.daily.carbs}g`;
        document.getElementById('fatsValue').textContent = `${plan.macros.daily.fats}g`;

        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Utility Functions
    function toggleLoading(isLoading) {
        loader.classList.toggle('hidden', !isLoading);
        resultSection.classList.toggle('hidden', isLoading);
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

    function resetResults() {
        // Reset all display elements
        ['breakfastMeal', 'lunchMeal', 'dinnerMeal'].forEach(id => {
            document.getElementById(id).textContent = 'Loading...';
        });

        ['breakfastCalories', 'lunchCalories', 'dinnerCalories',
         'breakfastProtein', 'lunchProtein', 'dinnerProtein'].forEach(id => {
            document.getElementById(id).textContent = '0';
        });

        ['totalCalories', 'proteinValue', 'carbsValue', 'fatsValue'].forEach(id => {
            document.getElementById(id).textContent = '0';
        });

        planOptionsContainer.innerHTML = '';
    }
});
