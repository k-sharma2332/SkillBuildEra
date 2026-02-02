//Api
const API_KEY = '4d8fb5b93d4af21d66a2948710284366'; // Free tier API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// dom element
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const suggestionsBox = document.getElementById('suggestions');
const errorMessage = document.getElementById('error');
const loading = document.getElementById('loading');
const weatherContainer = document.getElementById('weatherContainer');

// event listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
searchInput.addEventListener('input', handleSuggestions);
locationBtn.addEventListener('click', getUserLocation);

// main functions

async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        showError('Please enter a city name');
        return;
    }
    clearError();
    suggestionsBox.classList.remove('active');
    await getWeatherByCity(query);
}

async function handleSuggestions() {
    const query = searchInput.value.trim();
    if (query.length < 2) {
        suggestionsBox.classList.remove('active');
        return;
    }

    try {
        const response = await fetch(
            `${GEO_URL}/direct?q=${query}&limit=5&appid=${API_KEY}`
        );
        const cities = await response.json();

        if (cities.length === 0) {
            suggestionsBox.classList.remove('active');
            return;
        }

        displaySuggestions(cities);
    } catch (error) {
        console.error('Suggestion error:', error);
    }
}

function displaySuggestions(cities) {
    suggestionsBox.innerHTML = cities
        .map(
            (city) =>
                `<div class="suggestion-item" onclick="selectSuggestion('${city.name}', '${
                    city.country
                }')">${city.name}, ${city.country}</div>`
        )
        .join('');
    suggestionsBox.classList.add('active');
}

async function selectSuggestion(cityName, country) {
    searchInput.value = `${cityName}, ${country}`;
    suggestionsBox.classList.remove('active');
    await getWeatherByCity(cityName);
}

async function getWeatherByCity(city) {
    try {
        loading.classList.add('active');
        clearError();

        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        await getExtendedForecast(data.coord.lat, data.coord.lon);
        displayCurrentWeather(data);
    } catch (error) {
        showError(error.message || 'Error fetching weather data');
        weatherContainer.classList.add('hidden');
    } finally {
        loading.classList.remove('active');
    }
}

async function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation not supported by your browser');
        return;
    }

    loading.classList.add('active');
    clearError();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                );
                const data = await response.json();
                searchInput.value = data.name;
                await getExtendedForecast(latitude, longitude);
                displayCurrentWeather(data);
            } catch (error) {
                showError('Error fetching weather for your location');
            } finally {
                loading.classList.remove('active');
            }
        },
        (error) => {
            loading.classList.remove('active');
            showError('Unable to access your location. ' + error.message);
        }
    );
}

function displayCurrentWeather(data) {
    const { name, sys, main, weather, wind, clouds, visibility, pressure } =
        data;

    document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
    document.getElementById('date').textContent = formatDate(new Date());
    document.getElementById('temp').textContent = Math.round(main.temp);
    document.getElementById('description').textContent = weather[0].description;
    document.getElementById('feelsLike').textContent = `${Math.round(
        main.feels_like
    )}°C`;
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${(
        wind.speed * 3.6
    ).toFixed(1)} km/h`;
    document.getElementById('pressure').textContent = `${main.pressure} mb`;

    const iconCode = weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherContainer.classList.remove('hidden');
}

async function getExtendedForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        displayForecast(data.list);
        displayHourlyForecast(data.list);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

function displayForecast(forecastList) {
    const dailyForecasts = {};

    forecastList.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const dateKey = formatDateKey(date);

        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = forecast;
        }
    });

    const uniqueDays = Object.keys(dailyForecasts)
        .slice(0, 5)
        .map((key) => dailyForecasts[key]);

    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = uniqueDays
        .map((forecast) => {
            const date = new Date(forecast.dt * 1000);
            const iconCode = forecast.weather[0].icon;
            return `
                <div class="forecast-item">
                    <div class="forecast-date">${formatShortDate(date)}</div>
                    <div class="forecast-icon">
                        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather">
                    </div>
                    <div class="forecast-temp">
                        <span>${Math.round(forecast.main.temp_max)}°</span>
                        <span style="opacity: 0.7;">${Math.round(forecast.main.temp_min)}°</span>
                    </div>
                    <div class="forecast-desc">${forecast.weather[0].description}</div>
                </div>
            `;
        })
        .join('');
}

function displayHourlyForecast(forecastList) {
    const hourlyContainer = document.getElementById('hourlyContainer');
    const nextHours = forecastList.slice(0, 12);

    hourlyContainer.innerHTML = nextHours
        .map((forecast) => {
            const date = new Date(forecast.dt * 1000);
            const iconCode = forecast.weather[0].icon;
            return `
                <div class="hourly-item">
                    <div class="hourly-time">${formatTime(date)}</div>
                    <div class="hourly-icon">
                        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather">
                    </div>
                    <div class="hourly-temp">${Math.round(forecast.main.temp)}°C</div>
                </div>
            `;
        })
        .join('');
}



function formatDate(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
}

function formatShortDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
}

function clearError() {
    errorMessage.classList.remove('active');
    errorMessage.textContent = '';
}

window.addEventListener('load', () => {
    getUserLocation();
});
