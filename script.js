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
        // Update meals
        document.getElementById('breakfastMeal').textContent = plan.meals.breakfast;
        document.getElementById('lunchMeal').textContent = plan.meals.lunch;
        document.getElementById('dinnerMeal').textContent = plan.meals.dinner;

        // Update meal macros
        document.getElementById('breakfastCalories').textContent = plan.macros.breakfast.calories;
        document.getElementById('breakfastProtein').textContent = plan.macros.breakfast.protein;

        document.getElementById('lunchCalories').textContent = plan.macros.lunch.calories;
        document.getElementById('lunchProtein').textContent = plan.macros.lunch.protein;

        document.getElementById('dinnerCalories').textContent = plan.macros.dinner.calories;
        document.getElementById('dinnerProtein').textContent = plan.macros.dinner.protein;

        // Update daily macros
        document.getElementById('totalCalories').textContent = plan.calories;
        document.getElementById('proteinValue').textContent = `${plan.macros.daily.protein}g`;
        document.getElementById('carbsValue').textContent = `${plan.macros.daily.carbs}g`;
        document.getElementById('fatsValue').textContent = `${plan.macros.daily.fats}g`;

        // Scroll to results
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
        // Reset meal names
        ['breakfastMeal', 'lunchMeal', 'dinnerMeal'].forEach(id => {
            document.getElementById(id).textContent = 'Loading...';
        });

        // Reset meal macros
        ['breakfastCalories', 'lunchCalories', 'dinnerCalories'].forEach(id => {
            document.getElementById(id).textContent = '0';
        });
        ['breakfastProtein', 'lunchProtein', 'dinnerProtein'].forEach(id => {
            document.getElementById(id).textContent = '0';
        });

        // Reset daily macros
        ['totalCalories', 'proteinValue', 'carbsValue', 'fatsValue'].forEach(id => {
            document.getElementById(id).textContent = '0';
        });
    }
});
