document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nutritionForm');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('resultSection');
    const API_URL = 'http://localhost:5000/plan'; // Update with your backend URL

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const { plan } = await response.json();
            displayPlan(plan);

        } catch (error) {
            console.error('API Error:', error);
            showError('Failed to generate plan. Please try again later.');
        } finally {
            toggleLoading(false);
        }
    });

    function toggleLoading(isLoading) {
        loader.classList.toggle('hidden', !isLoading);
        resultSection.classList.toggle('hidden', isLoading);
    }

    function displayPlan(plan) {
        // Update meals
        document.getElementById('breakfastMeal').textContent = plan.meals.breakfast;
        document.getElementById('lunchMeal').textContent = plan.meals.lunch;
        document.getElementById('dinnerMeal').textContent = plan.meals.dinner;

        // Update nutrition summary
        document.getElementById('totalCalories').textContent = plan.calories;
        document.getElementById('proteinValue').textContent = `${plan.macros.protein}g`;
        document.getElementById('carbsValue').textContent = `${plan.macros.carbs}g`;
        document.getElementById('fatsValue').textContent = `${plan.macros.fats}g`;
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
