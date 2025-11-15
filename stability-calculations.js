/**
 * Atmospheric Stability Indices Calculations
 * JavaScript implementation for browser-based calculations
 */

/**
 * Calculate K-Index for thunderstorm potential
 * @param {number} tempSurface - Surface temperature in Celsius
 * @param {number} temp850 - Temperature at 850 mb in Celsius
 * @param {number} temp500 - Temperature at 500 mb in Celsius
 * @param {number} dewpointSurface - Surface dewpoint in Celsius
 * @param {number} dewpoint700 - Dewpoint at 700 mb in Celsius
 * @returns {number} K-Index value
 */
function calculateKIndex(tempSurface, temp850, temp500, dewpointSurface, dewpoint700) {
    // Estimate temperature at 700 mb (typically T_850 - 5°C)
    const temp700 = temp850 - 5.0;

    // K-Index = (T_850 - T_500) + Td_surface - (T_700 - Td_700)
    const kIndex = (temp850 - temp500) + dewpointSurface - (temp700 - dewpoint700);

    return kIndex;
}

/**
 * Calculate Lifted Index
 * @param {number} tempSurface - Surface temperature in Celsius
 * @param {number} temp500 - Temperature at 500 mb in Celsius
 * @param {number} dewpointSurface - Surface dewpoint in Celsius
 * @param {number} pressureSurface - Surface pressure in mb (default 1000)
 * @returns {number} Lifted Index value
 */
function calculateLiftedIndex(tempSurface, temp500, dewpointSurface, pressureSurface = 1000) {
    // Convert to Kelvin
    const tSurfaceK = tempSurface + 273.15;
    const t500K = temp500 + 273.15;
    const tdSurfaceK = dewpointSurface + 273.15;

    // Pressure levels
    const pSurface = pressureSurface;
    const p500 = 500;

    // Calculate humidity factor
    const humidityFactor = (tSurfaceK - tdSurfaceK) / tSurfaceK;

    // Choose lapse rate based on humidity
    let lapseRate;
    if (humidityFactor < 0.05) {
        // Very humid, use moist adiabatic
        lapseRate = 0.5;
    } else {
        // Use dry adiabatic
        lapseRate = 0.286;
    }

    // Calculate parcel temperature at 500 mb using adiabatic process
    const tParcel500K = tSurfaceK * Math.pow(p500 / pSurface, lapseRate);

    // Lifted Index = T_500_ambient - T_500_parcel
    const liftedIndex = t500K - tParcel500K;

    return liftedIndex;
}

/**
 * Calculate Showalter Stability Index
 * @param {number} temp850 - Temperature at 850 mb in Celsius
 * @param {number} temp500 - Temperature at 500 mb in Celsius
 * @param {number} dewpoint850 - Dewpoint at 850 mb in Celsius
 * @param {number} pressure850 - Pressure level (default 850 mb)
 * @returns {number} Showalter Index value
 */
function calculateShowalterIndex(temp850, temp500, dewpoint850, pressure850 = 850) {
    // Convert to Kelvin
    const t850K = temp850 + 273.15;
    const t500K = temp500 + 273.15;
    const td850K = dewpoint850 + 273.15;

    // Pressure levels
    const p850 = pressure850;
    const p500 = 500;

    // Calculate humidity factor
    const humidityFactor = (t850K - td850K) / t850K;

    // Choose lapse rate based on humidity
    let lapseRate;
    if (humidityFactor < 0.05) {
        // Very humid, use moist adiabatic
        lapseRate = 0.5;
    } else {
        // Use dry adiabatic
        lapseRate = 0.286;
    }

    // Calculate parcel temperature at 500 mb lifted from 850 mb
    const tParcel500K = t850K * Math.pow(p500 / p850, lapseRate);

    // Showalter Index = T_500_ambient - T_500_parcel
    const showalterIndex = t500K - tParcel500K;

    return showalterIndex;
}

/**
 * Calculate composite risk score from all indices
 * @param {number} ki - K-Index value
 * @param {number} li - Lifted Index value
 * @param {number} ssi - Showalter Stability Index value
 * @returns {number} Composite risk score (0-10)
 */
function calculateCompositeRisk(ki, li, ssi) {
    // Normalize K-Index (15-40 range) to 0-10
    const kiNorm = Math.max(0, Math.min(10, (ki - 15) / 25 * 10));

    // Normalize Lifted Index (-6 to +2 range, inverted)
    const liNorm = Math.max(0, Math.min(10, (2 - li) / 8 * 10));

    // Normalize Showalter Index (-6 to +3 range, inverted)
    const ssiNorm = Math.max(0, Math.min(10, (3 - ssi) / 9 * 10));

    // Weighted average (K-Index weighted slightly higher)
    const riskScore = 0.4 * kiNorm + 0.3 * liNorm + 0.3 * ssiNorm;

    return riskScore;
}

/**
 * Get text interpretation of K-Index
 * @param {number} ki - K-Index value
 * @returns {string} Interpretation text
 */
function interpretKIndex(ki) {
    if (ki < 15) return "No thunderstorms";
    if (ki < 20) return "Isolated thunderstorms";
    if (ki < 26) return "Widely scattered thunderstorms";
    if (ki < 31) return "Scattered thunderstorms";
    if (ki < 36) return "Numerous thunderstorms";
    return "Strong to severe thunderstorms";
}

/**
 * Get text interpretation of Lifted Index
 * @param {number} li - Lifted Index value
 * @returns {string} Interpretation text
 */
function interpretLiftedIndex(li) {
    if (li > 2) return "Stable";
    if (li >= 0) return "Marginally unstable";
    if (li >= -2) return "Moderately unstable";
    if (li >= -4) return "Unstable, severe storms possible";
    if (li >= -6) return "Very unstable, severe storms likely";
    return "Extremely unstable";
}

/**
 * Get text interpretation of Showalter Index
 * @param {number} ssi - Showalter Index value
 * @returns {string} Interpretation text
 */
function interpretShowalterIndex(ssi) {
    if (ssi > 3) return "Stable";
    if (ssi >= 1) return "Mostly stable";
    if (ssi >= 0) return "Slightly unstable";
    if (ssi >= -3) return "Moderately unstable";
    if (ssi >= -6) return "Very unstable, severe storms likely";
    return "Extremely unstable";
}

/**
 * Get color based on K-Index value
 * @param {number} ki - K-Index value
 * @returns {string} Hex color code
 */
function getKIndexColor(ki) {
    if (ki < 15) return "#4CAF50";      // Green
    if (ki < 20) return "#8BC34A";      // Light green
    if (ki < 26) return "#FFC107";      // Yellow
    if (ki < 31) return "#FF9800";      // Orange
    if (ki < 36) return "#FF5722";      // Deep orange
    return "#F44336";                    // Red
}

/**
 * Get color based on Lifted/Showalter Index value
 * @param {number} index - Index value
 * @returns {string} Hex color code
 */
function getLiftedIndexColor(index) {
    if (index > 2) return "#4CAF50";     // Green - Stable
    if (index >= 0) return "#8BC34A";    // Light green
    if (index >= -2) return "#FFC107";   // Yellow
    if (index >= -4) return "#FF9800";   // Orange
    if (index >= -6) return "#FF5722";   // Deep orange
    return "#F44336";                     // Red - Very unstable
}

/**
 * Get color for composite risk score
 * @param {number} risk - Risk score (0-10)
 * @returns {string} Hex color code
 */
function getRiskColor(risk) {
    if (risk < 2) return "#4CAF50";      // Low - Green
    if (risk < 4) return "#8BC34A";      // Low-Moderate
    if (risk < 6) return "#FFC107";      // Moderate - Yellow
    if (risk < 8) return "#FF9800";      // High - Orange
    if (risk < 9) return "#FF5722";      // High-Severe
    return "#F44336";                     // Severe - Red
}

/**
 * Get risk level text
 * @param {number} risk - Risk score (0-10)
 * @returns {string} Risk level description
 */
function getRiskLevel(risk) {
    if (risk < 3) return "Low Risk";
    if (risk < 6) return "Moderate Risk";
    if (risk < 9) return "High Risk";
    return "Severe Risk";
}
