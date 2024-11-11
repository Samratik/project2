const apiKey = '89f7fd4e1b0746f3bf3cef31b3ae185b';
const searchInput = document.getElementById('recipe-search');
const resultsContainer = document.getElementById('results');
const recipeDetailsModal = document.getElementById('recipe-details');
const closeModalButton = document.getElementById('close-recipe-modal');
const favoritesContainer = document.getElementById('favorites-container');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

searchInput.addEventListener('input', DisplayRecipes);

async function DisplayRecipes() {
    const query = searchInput.value;
    if (query) {
        try {
            const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
            const data = await response.json();
            displayResults(data.results);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    } else {
        resultsContainer.innerHTML = ''; 
    }
}

function displayResults(recipes) {
    resultsContainer.innerHTML = ''; 

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button class="view-recipe-button" onclick="openRecipeDetails(${recipe.id})">View Recipe</button>
            <button class="favorite-button" onclick="toggleFavorite(${recipe.id}, '${recipe.title}', '${recipe.image}')">
                Add to Favourites
            </button>
        `;
        resultsContainer.appendChild(recipeCard);
    });
}

function toggleFavorite(recipeId, title, image) {
    const isAlreadyFavorite = favorites.some(fav => fav.id === recipeId);
    
    if (isAlreadyFavorite) {
        showAlreadyInFavoritesModal(); 
    } else {
        favorites.push({ id: recipeId, title, image });
        showSuccessModal();
    }

    localStorage.setItem('favorites', JSON.stringify(favorites)); 
    displayFavorites(); 
}

function showSuccessModal() {
    const successModal = document.getElementById('success-modal');
    successModal.style.display = 'flex';
    setTimeout(() => successModal.style.display = 'none', 1500);
}

function showAlreadyInFavoritesModal() {
    const alreadyInFavoritesModal = document.getElementById('alreadyInFavoritesModal');
    alreadyInFavoritesModal.style.display = 'flex';
    setTimeout(() => alreadyInFavoritesModal.style.display = 'none', 1500);
}

function clearFavorites() {
    favorites = [];
    localStorage.removeItem('favorites');
    displayFavorites();
    showClearFavoritesModal();
}

function showClearFavoritesModal() {
    const clearFavoritesModal = document.getElementById('clear-favorites-modal');
    clearFavoritesModal.style.display = 'flex';
    setTimeout(() => clearFavoritesModal.style.display = 'none', 1500);
}

function displayFavorites() {
    favoritesContainer.innerHTML = '';

    favorites.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button class="view-recipe-button" onclick="openRecipeDetails(${recipe.id})">View Recipe</button>
        `;
        favoritesContainer.appendChild(recipeCard);
    });
}

async function openRecipeDetails(recipeId) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
        const recipe = await response.json();

        const recipeTitle = document.getElementById('recipe-title');
        const recipeImage = document.getElementById('recipe-image');
        const ingredientsList = document.getElementById('ingredients-list');
        const instructions = document.getElementById('instructions');
        const nutrition = document.getElementById('nutrition');

        if (recipeTitle) recipeTitle.innerText = recipe.title;
        if (recipeImage) recipeImage.src = recipe.image;

        if (ingredientsList) {
            ingredientsList.innerHTML = '';
            recipe.extendedIngredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.innerText = `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
                ingredientsList.appendChild(li);
            });
        }

        if (instructions) instructions.innerHTML = recipe.instructions || 'No instructions available.';
        
        if (nutrition) {
            if (recipe.nutrition && recipe.nutrition.nutrients) {
                const nutrients = recipe.nutrition.nutrients;

                const calories = nutrients.find(nutrient => nutrient.name.toLowerCase() === 'calories');
                const protein = nutrients.find(nutrient => nutrient.name.toLowerCase() === 'protein');
                const fat = nutrients.find(nutrient => nutrient.name.toLowerCase() === 'fat');

                nutrition.innerText = `
                    Calories: ${calories ? calories.amount : 'N/A'} kcal, 
                    Protein: ${protein ? protein.amount : 'N/A'}g, 
                    Fat: ${fat ? fat.amount : 'N/A'}g
                `;
            } else {
                nutrition.innerText = 'Nutritional information is not available for this recipe.';
            }
        }

        recipeDetailsModal.classList.add('active');
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}

closeModalButton.onclick = () => {
    recipeDetailsModal.classList.remove('active');
};

window.onclick = (event) => {
    if (event.target === recipeDetailsModal) {
        recipeDetailsModal.classList.remove('active');
    }
};

displayFavorites();
