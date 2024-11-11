const apiKey = 'd2d3f75438dc092e5716b3ca6dee0534'; 
const citySearchInput = document.getElementById('city-search');
const suggestionsList = document.getElementById('suggestions');
const currentWeatherElement = document.getElementById('current-weather');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const weatherCondition = document.getElementById('weather-condition');
const weatherIconElement = document.getElementById('weather-icon');
const forecastCardsContainer = document.getElementById('forecast-cards');
const locationButton = document.getElementById('location-btn');
const unitToggle = document.getElementById('unit-toggle');

let unit = 'metric';

async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`);
        const data = await response.json();

        if (data.cod !== 200) {
            alert('City not found!');
            return;
        }

        displayCurrentWeather(data);
        fetchForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

function displayCurrentWeather(data) {
    cityName.textContent = data.name;
    temperature.textContent = `Temperature: ${Math.floor(data.main.temp)}°`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} km/h`;
    weatherCondition.textContent = `Condition: ${data.weather[0].description}`;
    weatherIconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`);
        const data = await response.json();

        displayForecast(data.list);
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

function displayForecast(forecastData) {
    forecastCardsContainer.innerHTML = '';

    for (let i = 0; i < forecastData.length; i += 8) {
        const dayForecast = forecastData[i];
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');

        forecastCard.innerHTML = `
            <p>${new Date(dayForecast.dt_txt).toLocaleDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${dayForecast.weather[0].icon}.png" alt="${dayForecast.weather[0].description}">
            <p>High: ${Math.floor(dayForecast.main.temp_max)}°</p>
            <p>Low: ${Math.floor(dayForecast.main.temp_min)}°</p>
            <p>${dayForecast.weather[0].description}</p>
        `;

        forecastCardsContainer.appendChild(forecastCard);
    }
}

citySearchInput.addEventListener('input', async (e) => {
    const query = e.target.value;

    if (query.length > 2) {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&appid=${apiKey}`);
        const data = await response.json();

        suggestionsList.innerHTML = '';
        data.list.forEach(city => {
            const listItem = document.createElement('li');
            listItem.textContent = city.name;
            listItem.addEventListener('click', () => {
                citySearchInput.value = city.name;
                fetchWeather(city.name);
                suggestionsList.innerHTML = ''; 
            });
            suggestionsList.appendChild(listItem);
        });
    } else {
        suggestionsList.innerHTML = ''; 
    }
});

locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

async function fetchWeatherByCoords(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`);
    const data = await response.json();
    displayCurrentWeather(data);
    fetchForecast(lat, lon);
}

unitToggle.addEventListener('change', () => {
    unit = unitToggle.value;
    if (citySearchInput.value) {
        fetchWeather(citySearchInput.value); 
    }
});

