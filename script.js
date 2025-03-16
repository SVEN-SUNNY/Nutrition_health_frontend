document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    const form = document.getElementById('nutritionForm');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('resultSection');
    const planOptionsContainer = document.getElementById('planOptions');
    const API_URL = 'https://nutrition-jetzy-backend.onrender.com/plan';
    let currentPlans = [];

    // Initially hide loader
    loader.classList.add('hidden');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const diet = Array.from(document.querySelectorAll('#diet option:checked'))
                      .map(option => option.value);
        const goal = document.getElementById('goal').value;

        if (!name || diet.length === 0 || !goal) {
            showError('Please fill in all required fields');
            return;
        }

        try {
            toggleLoading(true);
            resetResults();

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, diet, goal }),
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { plans } = await response.json();
            currentPlans = plans;
            displayPlanOptions(plans);

        } catch (error) {
            console.error('API Error:', error);
            showError(error.name === 'AbortError' 
                ? 'Request timed out. Check your connection.'
                : 'Failed to generate plans. Please try again.');
        } finally {
            toggleLoading(false);
        }
    });

    function displayPlanOptions(plans) {
        planOptionsContainer.innerHTML = '';
        plans.forEach(plan => {
            const planCard = document.createElement('div');
            planCard.className = 'plan-card';
            planCard.innerHTML = `
                <div class="plan-card-header">
                    <h3>${plan.name}</h3>
                    ${plan.confidence ? `<div class="confidence">${(plan.confidence * 100).toFixed(1)}% match</div>` : ''}
                </div>
                <div class="plan-details">
                    <div class="meal">
                        <h4><i class="fas fa-sun"></i> Breakfast</h4>
                        <p>${plan.meals.breakfast}</p>
                    </div>
                    <div class="meal">
                        <h4><i class="fas fa-cloud-sun"></i> Lunch</h4>
                        <p>${plan.meals.lunch}</p>
                    </div>
                    <div class="meal">
                        <h4><i class="fas fa-moon"></i> Dinner</h4>
                        <p>${plan.meals.dinner}</p>
                    </div>
                    <button class="select-btn" data-plan-id="${plan.id}">
                        Select Plan
                    </button>
                </div>
            `;
            planCard.querySelector('.select-btn').addEventListener('click', handleSelection);
            planOptionsContainer.appendChild(planCard);
        });
        resultSection.classList.remove('hidden');
    }

    async function handleSelection(e) {
        const planId = parseInt(e.target.dataset.planId);
        const selectedPlan = currentPlans.find(p => p.id === planId);

        try {
            toggleLoading(true);
            await fetch('/selection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: document.getElementById('name').value.trim(),
                    diet: Array.from(document.querySelectorAll('#diet option:checked')),
                    goal: document.getElementById('goal').value,
                    selected_plan_id: planId
                })
            });
            displaySelectedPlan(selectedPlan);
        } catch (error) {
            showError('Failed to save selection');
        } finally {
            toggleLoading(false);
        }
    }

    function displaySelectedPlan(plan) {
        planOptionsContainer.classList.add('hidden');
        document.getElementById('userName').textContent = document.getElementById('name').value.trim();
        // Update all meal and nutrition elements...
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    function toggleLoading(show) {
        loader.classList.toggle('hidden', !show);
        resultSection.classList.toggle('hidden', show);
    }

    function showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        document.body.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 5000);
    }

    function resetResults() {
        // Reset all result fields to initial state
    }
});
