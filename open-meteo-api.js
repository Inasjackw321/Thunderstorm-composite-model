/**
 * Open-Meteo API Integration
 * Fetches real atmospheric data for stability index calculations
 * API Documentation: https://open-meteo.com/en/docs
 */

// Australian cities with coordinates
const AUSTRALIAN_CITIES = [
    { name: 'Darwin', lat: -12.46, lon: 130.84, state: 'NT' },
    { name: 'Cairns', lat: -16.92, lon: 145.77, state: 'QLD' },
    { name: 'Brisbane', lat: -27.47, lon: 153.03, state: 'QLD' },
    { name: 'Sydney', lat: -33.87, lon: 151.21, state: 'NSW' },
    { name: 'Melbourne', lat: -37.81, lon: 144.96, state: 'VIC' },
    { name: 'Adelaide', lat: -34.93, lon: 138.60, state: 'SA' },
    { name: 'Perth', lat: -31.95, lon: 115.86, state: 'WA' },
    { name: 'Alice Springs', lat: -23.70, lon: 133.88, state: 'NT' },
    { name: 'Hobart', lat: -42.88, lon: 147.33, state: 'TAS' },
    { name: 'Townsville', lat: -19.26, lon: 146.82, state: 'QLD' },
    { name: 'Canberra', lat: -35.28, lon: 149.13, state: 'ACT' },
    { name: 'Newcastle', lat: -32.93, lon: 151.78, state: 'NSW' },
    { name: 'Gold Coast', lat: -28.02, lon: 153.43, state: 'QLD' },
    { name: 'Mackay', lat: -21.14, lon: 149.19, state: 'QLD' },
    { name: 'Rockhampton', lat: -23.38, lon: 150.51, state: 'QLD' },
    { name: 'Bundaberg', lat: -24.87, lon: 152.35, state: 'QLD' },
    { name: 'Geraldton', lat: -28.78, lon: 114.61, state: 'WA' },
    { name: 'Broome', lat: -17.96, lon: 122.24, state: 'WA' },
    { name: 'Port Hedland', lat: -20.31, lon: 118.60, state: 'WA' },
    { name: 'Kalgoorlie', lat: -30.75, lon: 121.47, state: 'WA' }
];

/**
 * Fetch atmospheric data from Open-Meteo API
 * @param {number} latitude - Latitude of location
 * @param {number} longitude - Longitude of location
 * @returns {Promise<Object>} Atmospheric data object
 */
async function fetchAtmosphericData(latitude, longitude) {
    try {
        // Open-Meteo API endpoint for atmospheric data
        // Using both surface and pressure level variables
        const url = new URL('https://api.open-meteo.com/v1/forecast');

        // Add query parameters
        url.searchParams.append('latitude', latitude);
        url.searchParams.append('longitude', longitude);

        // Current weather parameters
        url.searchParams.append('current', [
            'temperature_2m',
            'relative_humidity_2m',
            'surface_pressure'
        ].join(','));

        // Pressure level variables (850hPa, 700hPa, 500hPa)
        url.searchParams.append('hourly', [
            'temperature_850hPa',
            'temperature_700hPa',
            'temperature_500hPa',
            'relative_humidity_850hPa',
            'relative_humidity_700hPa',
            'relative_humidity_500hPa'
        ].join(','));

        url.searchParams.append('timezone', 'auto');
        url.searchParams.append('forecast_days', '1');

        console.log('Fetching data from Open-Meteo:', url.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Extract current hour data from hourly arrays
        const currentHourIndex = 0; // Get the first hour (most recent)

        // Process the data into our format
        const atmosphericData = {
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: data.current.time,
            surface: {
                temperature: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                pressure: data.current.surface_pressure
            },
            pressure_levels: {
                '850': {
                    temperature: data.hourly.temperature_850hPa[currentHourIndex],
                    humidity: data.hourly.relative_humidity_850hPa[currentHourIndex]
                },
                '700': {
                    temperature: data.hourly.temperature_700hPa[currentHourIndex],
                    humidity: data.hourly.relative_humidity_700hPa[currentHourIndex]
                },
                '500': {
                    temperature: data.hourly.temperature_500hPa[currentHourIndex],
                    humidity: data.hourly.relative_humidity_500hPa[currentHourIndex]
                }
            }
        };

        return atmosphericData;
    } catch (error) {
        console.error('Error fetching atmospheric data:', error);
        throw error;
    }
}

/**
 * Calculate dewpoint from temperature and relative humidity
 * Using Magnus-Tetens formula
 * @param {number} temperature - Temperature in Celsius
 * @param {number} humidity - Relative humidity in percentage (0-100)
 * @returns {number} Dewpoint in Celsius
 */
function calculateDewpoint(temperature, humidity) {
    // Constants for Magnus-Tetens formula
    const a = 17.27;
    const b = 237.7;

    // Calculate alpha
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);

    // Calculate dewpoint
    const dewpoint = (b * alpha) / (a - alpha);

    return dewpoint;
}

/**
 * Fetch data for a city by name
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} Atmospheric data with dewpoints calculated
 */
async function fetchCityData(cityName) {
    const city = AUSTRALIAN_CITIES.find(c => c.name === cityName);

    if (!city) {
        throw new Error(`City not found: ${cityName}`);
    }

    const rawData = await fetchAtmosphericData(city.lat, city.lon);

    // Calculate dewpoints from temperature and humidity
    const processedData = {
        ...rawData,
        city: city.name,
        state: city.state,
        dewpoints: {
            surface: calculateDewpoint(
                rawData.surface.temperature,
                rawData.surface.humidity
            ),
            '850': calculateDewpoint(
                rawData.pressure_levels['850'].temperature,
                rawData.pressure_levels['850'].humidity
            ),
            '700': calculateDewpoint(
                rawData.pressure_levels['700'].temperature,
                rawData.pressure_levels['700'].humidity
            ),
            '500': calculateDewpoint(
                rawData.pressure_levels['500'].temperature,
                rawData.pressure_levels['500'].humidity
            )
        }
    };

    return processedData;
}

/**
 * Fetch data for multiple cities
 * @param {Array<string>} cityNames - Array of city names
 * @returns {Promise<Array<Object>>} Array of atmospheric data objects
 */
async function fetchMultipleCities(cityNames) {
    const promises = cityNames.map(cityName => fetchCityData(cityName));

    try {
        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error('Error fetching multiple cities:', error);
        throw error;
    }
}

/**
 * Fetch data for all Australian cities
 * @returns {Promise<Array<Object>>} Array of atmospheric data for all cities
 */
async function fetchAllAustralianCities() {
    const cityNames = AUSTRALIAN_CITIES.map(city => city.name);
    return fetchMultipleCities(cityNames);
}

/**
 * Format atmospheric data for display
 * @param {Object} data - Atmospheric data object
 * @returns {Object} Formatted data ready for stability index calculations
 */
function formatForCalculations(data) {
    return {
        temp_surface: data.surface.temperature,
        temp_850: data.pressure_levels['850'].temperature,
        temp_700: data.pressure_levels['700'].temperature,
        temp_500: data.pressure_levels['500'].temperature,
        dewpoint_surface: data.dewpoints.surface,
        dewpoint_850: data.dewpoints['850'],
        dewpoint_700: data.dewpoints['700'],
        pressure_surface: data.surface.pressure
    };
}

/**
 * Get cities grouped by state
 * @returns {Object} Cities grouped by state
 */
function getCitiesByState() {
    const grouped = {};

    AUSTRALIAN_CITIES.forEach(city => {
        if (!grouped[city.state]) {
            grouped[city.state] = [];
        }
        grouped[city.state].push(city);
    });

    return grouped;
}

/**
 * Search cities by name (partial match)
 * @param {string} searchTerm - Search term
 * @returns {Array<Object>} Matching cities
 */
function searchCities(searchTerm) {
    const term = searchTerm.toLowerCase();
    return AUSTRALIAN_CITIES.filter(city =>
        city.name.toLowerCase().includes(term) ||
        city.state.toLowerCase().includes(term)
    );
}
