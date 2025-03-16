
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nutritionForm');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('resultSection');
    const API_URL = 'https://nutrition-jetzy-backend.onrender.com/plan'; // Update with your backend URL

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            diet: Array.from(document.querySelectorAll('#diet option:checked'))
                      .map(option => option.value),
            goal: document.getElementById('goal').value
        };

        if (formData.diet.length === 0 || !formData.goal) {
            showError('Please fill in all required fields');
            return;
        }

        try {
            toggleLoading(true);
            resetResults();

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Server error occurred');
            }

            if (!responseData.success) {
                throw new Error(responseData.error || 'Failed to generate plan');
            }

            displayPlan(responseData.plan);

        } catch (error) {
            console.error('API Error:', error);
            showError(error.message || 'Failed to generate plan. Please try again later.');
        } finally {
            toggleLoading(false);
        }
    });

    function toggleLoading(isLoading) {
        if (isLoading) {
            loader.classList.remove('hidden');
            resultSection.classList.add('hidden');
        } else {
            loader.classList.add('hidden');
            resultSection.classList.remove('hidden');
        }
    }

    function displayPlan(plan) {
        document.getElementById('breakfastMeal').textContent = plan.meals.breakfast;
        document.getElementById('lunchMeal').textContent = plan.meals.lunch;
        document.getElementById('dinnerMeal').textContent = plan.meals.dinner;

        document.getElementById('totalCalories').textContent = plan.calories;
        document.getElementById('proteinValue').textContent = `${plan.macros.protein}g`;
        document.getElementById('carbsValue').textContent = `${plan.macros.carbs}g`;
        document.getElementById('fatsValue').textContent = `${plan.macros.fats}g`;

        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    function showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        document.body.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 5000);
    }

    function resetResults() {
        ['breakfastMeal', 'lunchMeal', 'dinnerMeal'].forEach(id => {
            document.getElementById(id).textContent = '...';
        });
        ['totalCalories', 'proteinValue', 'carbsValue', 'fatsValue'].forEach(id => {
            document.getElementById(id).textContent = '0';
        });
    }
});
