async function fetchWeather() {
    const searchInput = document.getElementById("search").value.trim();
    const weatherDataSection = document.getElementById("weather-data");
    const apiKey = "621268a92ee4d15d16f3e781f0dead06"; // Replace with your API key

    // Empty input check
    if (searchInput === "") {
        weatherDataSection.style.display = "block";
        weatherDataSection.innerHTML = `
            <div>
                <h2>Empty Input!</h2>
                <p>Please try again with a valid <u>city name</u>.</p>
            </div>`;
        return;
    }

    try {
        // Step 1: Get possible cities (limit 5)
        const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchInput)}&limit=5&appid=${apiKey}`;
        const geoResponse = await fetch(geocodeURL);
        const geoData = await geoResponse.json();

        if (!geoResponse.ok || geoData.length === 0) {
            weatherDataSection.style.display = "block";
            weatherDataSection.innerHTML = `
                <div>
                    <h2>Invalid Input: "${searchInput}"</h2>
                    <p>Please try again with a valid city name.</p>
                </div>`;
            return;
        }

        // Step 2: Handle single or multiple cities
        let selectedCity;
        if (geoData.length === 1) {
            selectedCity = geoData[0];
            await displayWeather(selectedCity);
        } else {
            // Multiple cities: show dropdown
            const options = geoData.map((city, index) => 
                `<option value="${index}">${city.name}, ${city.state ? city.state + ", " : ""}${city.country}</option>`
            ).join("");

            weatherDataSection.style.display = "block";
            weatherDataSection.innerHTML = `
                <div>
                    <h2>Multiple cities found:</h2>
                    <select id="city-select">${options}</select>
                    <button id="select-btn">Select</button>
                </div>
            `;

            document.getElementById("select-btn").onclick = async () => {
                const index = document.getElementById("city-select").value;
                selectedCity = geoData[index];
                await displayWeather(selectedCity);
            };
        }

    } catch (error) {
        console.error(error);
        weatherDataSection.style.display = "block";
        weatherDataSection.innerHTML = `
            <div>
                <h2>Error!</h2>
                <p>Something went wrong. Please try again later.</p>
            </div>`;
    }

    // Function to fetch and display full weather
    async function displayWeather(city) {
        const { lat, lon, name, country } = city;
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const response = await fetch(weatherURL);
        const data = await response.json();

        const descriptionCapitalized = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);

        // Show weather section as flex
        weatherDataSection.style.display = "flex";
        weatherDataSection.style.flexDirection = "row";
        weatherDataSection.style.alignItems = "center";
        weatherDataSection.style.gap = "20px";

        weatherDataSection.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" 
                 alt="${descriptionCapitalized}" width="100" />
            <div>
                <h2>${name}, ${country}</h2>
                <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}°C</p>
                <p><strong>Description:</strong> ${descriptionCapitalized}</p>
                <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
            </div>
        `;

        document.getElementById("search").value = "";
    }
}

