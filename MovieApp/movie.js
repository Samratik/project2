const apiKey = '179f8fef1998a4b84b9ae7af0b6a774d';
const searchInput = document.getElementById('movie-search');
const sortOptions = document.getElementById('sort-options');
const resultsContainer = document.getElementById('results');
const movieDetailsModal = document.getElementById('movie-details');
const closeModal = document.getElementById('close-modal');
const watchlistContainer = document.getElementById('watchlist-container');
let movies = []; 

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

searchInput.addEventListener('input', DisplayMovies);

sortOptions.addEventListener('change', displayResults);

async function DisplayMovies() {
    const query = searchInput.value;
    if (query) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);
            const data = await response.json();
            movies = data.results; 
            displayResults();
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    } else {
        resultsContainer.innerHTML = ''; 
    }
}

function displayResults() {
    if (!movies.length) {
        console.warn("No movies to display.");
        return;
    }

    const sortBy = sortOptions.value;

    const sortedMovies = [...movies].sort((a, b) => {
        if (sortBy === 'popularity') return b.popularity - a.popularity;
        if (sortBy === 'release_date') return new Date(b.release_date) - new Date(a.release_date);
        if (sortBy === 'vote_average') return b.vote_average - a.vote_average;
    });

    resultsContainer.innerHTML = ''; 

    sortedMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date}</p>
            <button class="movie-action-button" onclick="openMovieDetails(${movie.id})">View Details</button>
            <button class="movie-action-button" onclick="addToWatchlist(${movie.id})">Add to Watchlist</button>
        `;
        resultsContainer.appendChild(movieCard);
    });
}

function addToWatchlist(movieId) {
    const movie = movies.find(m => m.id === movieId);

    if (movie) {
        if (watchlist.some(m => m.id === movieId)) {
            showAlreadyInWatchlistModal();
        } else {
            watchlist.push(movie);
            localStorage.setItem('watchlist', JSON.stringify(watchlist)); 
            displayWatchlist(); 
            showSuccessModal(); 
        }
    }
}

function showSuccessModal() {
    const successModal = document.getElementById('success-modal'); 
    successModal.style.display = 'flex'; 
    setTimeout(() => {
        successModal.style.display = 'none'; 
    }, 1500);
}

function showAlreadyInWatchlistModal() {
    const alreadyInWatchlistModal = document.getElementById('alreadyInWatchlistModal'); 
    alreadyInWatchlistModal.style.display = 'flex';
    setTimeout(() => {
        alreadyInWatchlistModal.style.display = 'none'; 
    }, 1500);
}

function clearWatchlist() {
    watchlist = [];
    localStorage.removeItem('watchlist');
    displayWatchlist();
    showClearWatchlistModal();
}

function showClearWatchlistModal() {
    const clearWatchlistModal = document.getElementById('clearWatchlistModal');
    clearWatchlistModal.style.display = 'flex'; 
    setTimeout(() => {
        clearWatchlistModal.style.display = 'none'; 
    }, 1500);
}

function displayWatchlist() {
    watchlistContainer.innerHTML = '';

    watchlist.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button class="movie-action-button" onclick="openMovieDetails(${movie.id})">View Details</button>
        `;
        watchlistContainer.appendChild(movieCard);
    });
}

async function openMovieDetails(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
        const movie = await response.json();

        document.getElementById('movie-title').innerText = movie.title;
        document.getElementById('movie-poster').src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        document.getElementById('synopsis').innerText = movie.overview || 'Synopsis not available.';
        document.getElementById('rating').innerText = `Rating: ${movie.vote_average}`;
        document.getElementById('runtime').innerText = `Runtime: ${movie.runtime} minutes`;

        const castResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`);
        const castData = await castResponse.json();
        const castList = castData.cast.slice(0, 5).map(member => member.name).join(', ');
        document.getElementById('cast').innerText = castList;

        movieDetailsModal.classList.add('active');
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

closeModal.onclick = () => {
    movieDetailsModal.classList.remove('active');
};

window.onclick = event => {
    if (event.target === movieDetailsModal) {
        movieDetailsModal.classList.remove('active');
    }
};

displayWatchlist();
