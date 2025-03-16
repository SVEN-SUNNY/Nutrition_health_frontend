document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nutritionForm');
    const loader = document.getElementById('loader');
    const resultsSection = document.getElementById('results');
    const API_URL = 'https://nutrition-jetzy-backend.onrender.com/plan';
    let currentPlans = [];

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            diet: Array.from(document.querySelectorAll('#diet option:checked'))
                      .map(option => option.value),
            goal: document.getElementById('goal').value
        };

        if (!validateForm(formData)) return;

        try {
            toggleLoader(true);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to fetch plans');
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Unknown error');
            
            currentPlans = data.plans;
            displayPlanOptions(currentPlans);
            resultsSection.classList.remove('hidden');

        } catch (error) {
            showError(error.message);
        } finally {
            toggleLoader(false);
        }
    });

    function validateForm({ name, diet, goal }) {
        if (!name || diet.length === 0 || !goal) {
            showError('Please fill in all required fields');
            return false;
        }
        return true;
    }

    function toggleLoader(show) {
        loader.classList.toggle('hidden', !show);
    }

    function displayPlanOptions(plans) {
        const container = document.getElementById('planOptions');
        container.innerHTML = '';

        plans.forEach(plan => {
            const planCard = document.createElement('div');
            planCard.className = 'plan-card';
            planCard.innerHTML = `
                <h3>${plan.name}</h3>
                <div class="meal-preview">
                    <p><strong>Breakfast:</strong> ${plan.meals.breakfast}</p>
                    <p><strong>Lunch:</strong> ${plan.meals.lunch}</p>
                    <p><strong>Dinner:</strong> ${plan.meals.dinner}</p>
                </div>
                <button class="select-btn" data-plan-id="${plan.id}">
                    Select Plan
                </button>
            `;

            planCard.querySelector('.select-btn').addEventListener('click', (e) => {
                handlePlanSelection(plan.id);
            });
            
            container.appendChild(planCard);
        });
    }

    async function handlePlanSelection(planId) {
        try {
            toggleLoader(true);
            const selectedPlan = currentPlans.find(p => p.id === planId);
            
            // Update UI
            document.getElementById('userName').textContent = document.getElementById('name').value;
            document.getElementById('breakfastMeal').textContent = selectedPlan.meals.breakfast;
            document.getElementById('lunchMeal').textContent = selectedPlan.meals.lunch;
            document.getElementById('dinnerMeal').textContent = selectedPlan.meals.dinner;
            
            // Update nutrition values
            document.getElementById('totalCalories').textContent = selectedPlan.calories;
            document.getElementById('proteinTotal').textContent = `${selectedPlan.macros.daily.protein}g`;
            document.getElementById('carbsTotal').textContent = `${selectedPlan.macros.daily.carbs}g`;
            document.getElementById('fatsTotal').textContent = `${selectedPlan.macros.daily.fats}g`;

            // Show details section
            document.getElementById('planDetails').classList.remove('hidden');

        } catch (error) {
            showError('Failed to load plan details');
        } finally {
            toggleLoader(false);
        }
    }

    function showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        document.body.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 5000);
    }
});
