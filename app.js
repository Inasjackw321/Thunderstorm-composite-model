/**
 * Main Application Logic
 * Handles UI interactions and map generation
 */

// Initialize map
let map;
let heatLayer;

// Initialize Leaflet map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    // Load default preset
    loadPreset('moderate');
});

/**
 * Initialize the Leaflet map
 */
function initMap() {
    // Create map centered on Australia
    map = L.map('map').setView([-25.0, 133.0], 4);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Add Australia boundary
    addAustraliaBoundary();
}

/**
 * Add Australia boundary to map
 */
function addAustraliaBoundary() {
    // Simplified Australia boundary polygon
    const australiaBounds = [
        [-10.0, 113.0], [-10.0, 154.0],
        [-44.0, 154.0], [-44.0, 113.0], [-10.0, 113.0]
    ];

    L.polygon(australiaBounds, {
        color: '#2a5298',
        weight: 2,
        fillOpacity: 0.1
    }).addTo(map);
}

/**
 * Load preset atmospheric conditions
 * @param {string} preset - Preset name: 'stable', 'moderate', 'severe', 'tropical'
 */
function loadPreset(preset) {
    const presets = {
        stable: {
            temp_surface: 22.0,
            temp_850: 15.0,
            temp_500: -5.0,
            dewpoint_surface: 10.0,
            dewpoint_700: 5.0,
            dewpoint_850: 8.0
        },
        moderate: {
            temp_surface: 28.0,
            temp_850: 20.0,
            temp_500: 2.0,
            dewpoint_surface: 18.0,
            dewpoint_700: 12.0,
            dewpoint_850: 15.0
        },
        severe: {
            temp_surface: 35.0,
            temp_850: 26.0,
            temp_500: 0.0,
            dewpoint_surface: 24.0,
            dewpoint_700: 18.0,
            dewpoint_850: 22.0
        },
        tropical: {
            temp_surface: 32.0,
            temp_850: 24.0,
            temp_500: 4.0,
            dewpoint_surface: 26.0,
            dewpoint_700: 16.0,
            dewpoint_850: 20.0
        }
    };

    const data = presets[preset];
    if (data) {
        document.getElementById('temp_surface').value = data.temp_surface;
        document.getElementById('temp_850').value = data.temp_850;
        document.getElementById('temp_500').value = data.temp_500;
        document.getElementById('dewpoint_surface').value = data.dewpoint_surface;
        document.getElementById('dewpoint_700').value = data.dewpoint_700;
        document.getElementById('dewpoint_850').value = data.dewpoint_850;

        // Auto-calculate after loading preset
        calculateIndices();
    }
}

/**
 * Reset all inputs to default values
 */
function resetInputs() {
    document.getElementById('temp_surface').value = 28;
    document.getElementById('temp_850').value = 20;
    document.getElementById('temp_500').value = 2;
    document.getElementById('dewpoint_surface').value = 18;
    document.getElementById('dewpoint_700').value = 12;
    document.getElementById('dewpoint_850').value = 15;

    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('dataTimestamp').classList.remove('active');
}

/**
 * Fetch live atmospheric data from Open-Meteo API
 */
async function fetchLiveData() {
    const citySelect = document.getElementById('citySelect');
    const cityName = citySelect.value;

    if (!cityName) {
        alert('Please select a city first');
        return;
    }

    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    const fetchBtn = document.getElementById('fetchDataBtn');
    const timestampDiv = document.getElementById('dataTimestamp');

    loadingIndicator.classList.add('active');
    fetchBtn.disabled = true;
    timestampDiv.classList.remove('active');

    try {
        console.log(`Fetching data for ${cityName}...`);

        // Fetch atmospheric data from Open-Meteo
        const data = await fetchCityData(cityName);

        console.log('Received data:', data);

        // Format data for our calculations
        const formattedData = formatForCalculations(data);

        // Populate input fields
        document.getElementById('temp_surface').value = formattedData.temp_surface.toFixed(1);
        document.getElementById('temp_850').value = formattedData.temp_850.toFixed(1);
        document.getElementById('temp_500').value = formattedData.temp_500.toFixed(1);
        document.getElementById('dewpoint_surface').value = formattedData.dewpoint_surface.toFixed(1);
        document.getElementById('dewpoint_700').value = formattedData.dewpoint_700.toFixed(1);
        document.getElementById('dewpoint_850').value = formattedData.dewpoint_850.toFixed(1);

        // Show timestamp
        const timestamp = new Date(data.timestamp);
        timestampDiv.innerHTML = `
            <strong>📡 Live Data Retrieved:</strong> ${data.city}, ${data.state}<br>
            <small>Time: ${timestamp.toLocaleString()} | Source: Open-Meteo API</small>
        `;
        timestampDiv.classList.add('active');

        // Hide loading indicator
        loadingIndicator.classList.remove('active');
        fetchBtn.disabled = false;

        // Auto-calculate indices with the new data
        calculateIndices();

        // Success message
        console.log(`Successfully loaded data for ${cityName}`);

    } catch (error) {
        console.error('Error fetching data:', error);

        // Hide loading indicator
        loadingIndicator.classList.remove('active');
        fetchBtn.disabled = false;

        // Show error message
        alert(`Failed to fetch data for ${cityName}. Error: ${error.message}\n\nPlease try again or select a different city.`);
    }
}

/**
 * Generate live data map with all Australian cities
 */
async function generateLiveDataMap() {
    // Show loading message
    alert('Fetching live data for all Australian cities. This may take a moment...');

    try {
        // Fetch data for all cities
        const allCityData = await fetchAllAustralianCities();

        // Clear existing markers
        map.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });

        // Add markers for each city with live data
        allCityData.forEach(cityData => {
            const formattedData = formatForCalculations(cityData);

            // Calculate indices
            const ki = calculateKIndex(
                formattedData.temp_surface,
                formattedData.temp_850,
                formattedData.temp_500,
                formattedData.dewpoint_surface,
                formattedData.dewpoint_700
            );
            const li = calculateLiftedIndex(
                formattedData.temp_surface,
                formattedData.temp_500,
                formattedData.dewpoint_surface
            );
            const ssi = calculateShowalterIndex(
                formattedData.temp_850,
                formattedData.temp_500,
                formattedData.dewpoint_850
            );
            const risk = calculateCompositeRisk(ki, li, ssi);

            // Create marker
            const color = getRiskColor(risk);
            const radius = 10 + risk * 3;

            const circle = L.circleMarker([cityData.latitude, cityData.longitude], {
                radius: radius,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            }).addTo(map);

            // Create popup with live data
            const timestamp = new Date(cityData.timestamp);
            circle.bindPopup(`
                <div style="min-width: 220px;">
                    <h3 style="margin: 0 0 10px 0; color: #2a5298;">${cityData.city}, ${cityData.state}</h3>
                    <div style="background: #e7f3ff; padding: 8px; border-radius: 5px; margin-bottom: 8px; font-size: 0.85em;">
                        <strong>📡 Live Data</strong><br>
                        ${timestamp.toLocaleTimeString()}
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                        <strong>Atmospheric Data:</strong><br>
                        Surface: ${formattedData.temp_surface.toFixed(1)}°C / ${formattedData.dewpoint_surface.toFixed(1)}°C<br>
                        850mb: ${formattedData.temp_850.toFixed(1)}°C / ${formattedData.dewpoint_850.toFixed(1)}°C<br>
                        500mb: ${formattedData.temp_500.toFixed(1)}°C
                    </div>
                    <div style="background: #e7f3ff; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                        <strong>Stability Indices:</strong><br>
                        K-Index: <strong>${ki.toFixed(1)}</strong><br>
                        Lifted Index: <strong>${li.toFixed(1)}°C</strong><br>
                        Showalter Index: <strong>${ssi.toFixed(1)}°C</strong>
                    </div>
                    <div style="background: ${color}; color: white; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                        ${getRiskLevel(risk)}<br>
                        Score: ${risk.toFixed(1)}/10
                    </div>
                </div>
            `);

            circle.bindTooltip(`${cityData.city}: ${getRiskLevel(risk)}`, {
                permanent: false,
                direction: 'top'
            });
        });

        // Add legend
        addMapLegend();

        alert(`Live data map generated successfully!\n${allCityData.length} cities updated with real atmospheric data from Open-Meteo.`);

    } catch (error) {
        console.error('Error generating live data map:', error);
        alert(`Failed to generate live data map: ${error.message}\n\nFalling back to sample data.`);
        // Fallback to sample data
        generateMap();
    }
}

/**
 * Calculate stability indices and display results
 */
function calculateIndices() {
    // Get input values
    const tempSurface = parseFloat(document.getElementById('temp_surface').value);
    const temp850 = parseFloat(document.getElementById('temp_850').value);
    const temp500 = parseFloat(document.getElementById('temp_500').value);
    const dewpointSurface = parseFloat(document.getElementById('dewpoint_surface').value);
    const dewpoint700 = parseFloat(document.getElementById('dewpoint_700').value);
    const dewpoint850 = parseFloat(document.getElementById('dewpoint_850').value);

    // Calculate indices
    const ki = calculateKIndex(tempSurface, temp850, temp500, dewpointSurface, dewpoint700);
    const li = calculateLiftedIndex(tempSurface, temp500, dewpointSurface);
    const ssi = calculateShowalterIndex(temp850, temp500, dewpoint850);
    const risk = calculateCompositeRisk(ki, li, ssi);

    // Display results
    displayResults(ki, li, ssi, risk);

    // Show results section
    document.getElementById('resultsSection').style.display = 'block';

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Display calculation results
 */
function displayResults(ki, li, ssi, risk) {
    const resultsDiv = document.getElementById('results');

    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>K-Index</h3>
            <div class="result-value">${ki.toFixed(1)}</div>
            <div class="result-interpretation">${interpretKIndex(ki)}</div>
            <div class="risk-indicator">
                <div class="risk-level" style="width: ${Math.min(100, ki * 2)}%; background: ${getKIndexColor(ki)};">
                    ${ki < 10 ? '' : ki.toFixed(0)}
                </div>
            </div>
        </div>

        <div class="result-card">
            <h3>Lifted Index</h3>
            <div class="result-value">${li.toFixed(1)}°C</div>
            <div class="result-interpretation">${interpretLiftedIndex(li)}</div>
            <div class="risk-indicator">
                <div class="risk-level" style="width: ${Math.max(0, Math.min(100, (2 - li) / 8 * 100))}%; background: ${getLiftedIndexColor(li)};">
                    ${Math.abs(li) < 1 ? '' : li.toFixed(0) + '°'}
                </div>
            </div>
        </div>

        <div class="result-card">
            <h3>Showalter Index</h3>
            <div class="result-value">${ssi.toFixed(1)}°C</div>
            <div class="result-interpretation">${interpretShowalterIndex(ssi)}</div>
            <div class="risk-indicator">
                <div class="risk-level" style="width: ${Math.max(0, Math.min(100, (3 - ssi) / 9 * 100))}%; background: ${getLiftedIndexColor(ssi)};">
                    ${Math.abs(ssi) < 1 ? '' : ssi.toFixed(0) + '°'}
                </div>
            </div>
        </div>

        <div class="result-card" style="border-left: 5px solid ${getRiskColor(risk)};">
            <h3>Composite Risk Score</h3>
            <div class="result-value">${risk.toFixed(1)}/10</div>
            <div class="result-interpretation">${getRiskLevel(risk)}</div>
            <div class="risk-indicator">
                <div class="risk-level" style="width: ${risk * 10}%; background: ${getRiskColor(risk)};">
                    ${getRiskLevel(risk)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate risk map with sample data across Australia
 */
function generateMap() {
    // Clear existing heat layer if any
    if (heatLayer) {
        map.removeLayer(heatLayer);
    }

    // Get current input values to use as base
    const tempSurface = parseFloat(document.getElementById('temp_surface').value);
    const temp850 = parseFloat(document.getElementById('temp_850').value);
    const temp500 = parseFloat(document.getElementById('temp_500').value);
    const dewpointSurface = parseFloat(document.getElementById('dewpoint_surface').value);
    const dewpoint700 = parseFloat(document.getElementById('dewpoint_700').value);
    const dewpoint850 = parseFloat(document.getElementById('dewpoint_850').value);

    // Generate sample points across Australia
    const markers = [];
    const cities = [
        { name: 'Darwin', lat: -12.46, lon: 130.84 },
        { name: 'Cairns', lat: -16.92, lon: 145.77 },
        { name: 'Brisbane', lat: -27.47, lon: 153.03 },
        { name: 'Sydney', lat: -33.87, lon: 151.21 },
        { name: 'Melbourne', lat: -37.81, lon: 144.96 },
        { name: 'Adelaide', lat: -34.93, lon: 138.60 },
        { name: 'Perth', lat: -31.95, lon: 115.86 },
        { name: 'Alice Springs', lat: -23.70, lon: 133.88 },
        { name: 'Hobart', lat: -42.88, lon: 147.33 },
        { name: 'Townsville', lat: -19.26, lon: 146.82 },
        { name: 'Canberra', lat: -35.28, lon: 149.13 },
        { name: 'Newcastle', lat: -32.93, lon: 151.78 },
        { name: 'Gold Coast', lat: -28.02, lon: 153.43 },
        { name: 'Mackay', lat: -21.14, lon: 149.19 },
        { name: 'Rockhampton', lat: -23.38, lon: 150.51 },
        { name: 'Bundaberg', lat: -24.87, lon: 152.35 },
        { name: 'Geraldton', lat: -28.78, lon: 114.61 },
        { name: 'Broome', lat: -17.96, lon: 122.24 },
        { name: 'Port Hedland', lat: -20.31, lon: 118.60 },
        { name: 'Kalgoorlie', lat: -30.75, lon: 121.47 }
    ];

    cities.forEach(city => {
        // Add some variation based on latitude (tropical north is warmer/more humid)
        const latVariation = (city.lat + 25) / 35; // Normalize latitude
        const tempVariation = Math.random() * 4 - 2 + latVariation * 5;
        const moistureVariation = Math.random() * 3 - 1.5 + latVariation * 4;

        const localTempSurface = tempSurface + tempVariation;
        const localTemp850 = temp850 + tempVariation * 0.8;
        const localTemp500 = temp500 + tempVariation * 0.5;
        const localDewpointSurface = dewpointSurface + moistureVariation;
        const localDewpoint700 = dewpoint700 + moistureVariation * 0.7;
        const localDewpoint850 = dewpoint850 + moistureVariation * 0.8;

        // Calculate indices for this location
        const ki = calculateKIndex(localTempSurface, localTemp850, localTemp500,
                                   localDewpointSurface, localDewpoint700);
        const li = calculateLiftedIndex(localTempSurface, localTemp500, localDewpointSurface);
        const ssi = calculateShowalterIndex(localTemp850, localTemp500, localDewpoint850);
        const risk = calculateCompositeRisk(ki, li, ssi);

        // Create circle marker
        const color = getRiskColor(risk);
        const radius = 10 + risk * 3; // Size based on risk

        const circle = L.circleMarker([city.lat, city.lon], {
            radius: radius,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        }).addTo(map);

        // Add popup with detailed information
        circle.bindPopup(`
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #2a5298;">${city.name}</h3>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <strong>Atmospheric Data:</strong><br>
                    Surface: ${localTempSurface.toFixed(1)}°C / ${localDewpointSurface.toFixed(1)}°C<br>
                    850mb: ${localTemp850.toFixed(1)}°C / ${localDewpoint850.toFixed(1)}°C<br>
                    500mb: ${localTemp500.toFixed(1)}°C
                </div>
                <div style="background: #e7f3ff; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <strong>Stability Indices:</strong><br>
                    K-Index: <strong>${ki.toFixed(1)}</strong><br>
                    Lifted Index: <strong>${li.toFixed(1)}°C</strong><br>
                    Showalter Index: <strong>${ssi.toFixed(1)}°C</strong>
                </div>
                <div style="background: ${color}; color: white; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                    ${getRiskLevel(risk)}<br>
                    Score: ${risk.toFixed(1)}/10
                </div>
            </div>
        `);

        // Add tooltip on hover
        circle.bindTooltip(`${city.name}: ${getRiskLevel(risk)}`, {
            permanent: false,
            direction: 'top'
        });
    });

    // Add legend to map
    addMapLegend();

    // Show success message
    alert('Risk map generated! Click on any city marker to see detailed analysis.');
}

/**
 * Add legend to the map
 */
function addMapLegend() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        div.style.background = 'white';
        div.style.padding = '15px';
        div.style.borderRadius = '10px';
        div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

        div.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #2a5298;">Thunderstorm Risk</h4>
            <div style="display: flex; align-items: center; margin: 5px 0;">
                <div style="width: 20px; height: 20px; background: #4CAF50; border-radius: 50%; margin-right: 8px;"></div>
                <span>Low (0-3)</span>
            </div>
            <div style="display: flex; align-items: center; margin: 5px 0;">
                <div style="width: 20px; height: 20px; background: #FFC107; border-radius: 50%; margin-right: 8px;"></div>
                <span>Moderate (3-6)</span>
            </div>
            <div style="display: flex; align-items: center; margin: 5px 0;">
                <div style="width: 20px; height: 20px; background: #FF9800; border-radius: 50%; margin-right: 8px;"></div>
                <span>High (6-9)</span>
            </div>
            <div style="display: flex; align-items: center; margin: 5px 0;">
                <div style="width: 20px; height: 20px; background: #F44336; border-radius: 50%; margin-right: 8px;"></div>
                <span>Severe (9-10)</span>
            </div>
        `;

        return div;
    };

    legend.addTo(map);
}
