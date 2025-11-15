# Thunderstorm Composite Model - Australia

A comprehensive system for calculating and visualizing thunderstorm risk across Australia using atmospheric stability indices.

**🌐 [Try the Interactive Web App](https://yourusername.github.io/Thunderstorm-composite-model/)** _(Replace with your actual GitHub Pages URL)_

## Overview

This project implements three key meteorological stability indices used for thunderstorm forecasting:

1. **K-Index (KI)** - Provides a quick estimate of thunderstorm likelihood based on temperature at surface and 850 mb level, and dewpoint
2. **Lifted Index (LI)** - Measures atmospheric stability by calculating the temperature difference between a rising air parcel and ambient air at 500 mb
3. **Showalter Stability Index (SSI)** - Similar to LI, but lifts the air parcel from 850 mb level instead of the surface

## Features

### Web Application (No Installation Required!)
- 🌐 **Interactive web interface** - Run directly in your browser
- 📡 **Live weather data** - Fetch real atmospheric data from Open-Meteo API
- 🗺️ **Live risk maps** - Interactive map of Australia with city-level analysis
- 📊 **Real-time calculations** - Instant stability index calculations
- 📱 **Mobile-friendly** - Works on phones, tablets, and desktops
- 🎨 **Visual indicators** - Color-coded risk levels and interpretations
- 💾 **Preset scenarios** - Quick-load common atmospheric conditions
- 🏙️ **20+ Australian cities** - Real data for major cities across all states

### Python Application
- Calculate all three stability indices from atmospheric data
- Generate detailed risk maps for Australia
- Composite risk scoring combining all indices
- High-resolution geographic visualization
- Statistical analysis of risk distribution

## Quick Start

### Option 1: Web Application (Recommended)

Simply visit the GitHub Pages site (no installation required):
**[https://yourusername.github.io/Thunderstorm-composite-model/](https://yourusername.github.io/Thunderstorm-composite-model/)**

Or open `index.html` directly in your web browser.

Features:
- Enter atmospheric data manually or use preset scenarios
- Calculate stability indices instantly
- Generate interactive risk maps for Australian cities
- No Python or dependencies needed!

### Option 2: Python Application

#### Prerequisites

- Python 3.8 or higher
- pip package manager

#### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Thunderstorm-composite-model
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Web Application

#### Using Live Weather Data

1. Open `index.html` in your browser or visit the GitHub Pages site
2. Select an Australian city from the dropdown menu
3. Click "📡 Fetch Live Data" to retrieve real atmospheric data from Open-Meteo API
4. The input fields will auto-populate with current conditions
5. Risk calculations are performed automatically
6. Click "📡 Live Data Map" to see real-time risk across all Australian cities

#### Using Preset Scenarios or Manual Input

1. Choose a preset scenario (Stable, Moderate, Severe, Tropical)
2. Or enter custom atmospheric data manually
3. Click "🔬 Calculate Risk" to see stability indices
4. Click "🗺️ Sample Data Map" to create an interactive map with sample data
5. Click on city markers for detailed analysis

### Python Application

### Generate Sample Maps

Run the main script to generate thunderstorm risk maps using sample data:

```bash
python create_storm_risk_map.py
```

This will create maps in the `output/` directory:
- `k_index_map.png` - K-Index distribution
- `lifted_index_map.png` - Lifted Index distribution
- `showalter_index_map.png` - Showalter Stability Index distribution
- `composite_risk_map.png` - Combined risk score
- `combined_stability_indices.png` - All four maps in one figure

### Using the Stability Indices Module

```python
from stability_indices import (
    calculate_k_index,
    calculate_lifted_index,
    calculate_showalter_index,
    calculate_composite_risk
)

# Example with scalar values
temp_surface = 32.0  # °C
temp_850 = 24.0      # °C
temp_500 = 6.0       # °C
dewpoint_surface = 22.0  # °C
dewpoint_700 = 15.0  # °C
dewpoint_850 = 20.0  # °C

# Calculate K-Index
ki = calculate_k_index(temp_surface, temp_850, temp_500,
                       dewpoint_surface, dewpoint_700)
print(f"K-Index: {ki:.1f}")

# Calculate Lifted Index
li = calculate_lifted_index(temp_surface, temp_500, dewpoint_surface)
print(f"Lifted Index: {li:.1f}")

# Calculate Showalter Index
ssi = calculate_showalter_index(temp_850, temp_500, dewpoint_850)
print(f"Showalter Index: {ssi:.1f}")

# Calculate composite risk score
risk = calculate_composite_risk(ki, li, ssi)
print(f"Composite Risk Score: {risk:.1f}/10")
```

## Interpretation Guide

### K-Index
- **< 15**: No thunderstorms expected
- **15-20**: Isolated thunderstorms
- **21-25**: Widely scattered thunderstorms
- **26-30**: Scattered thunderstorms
- **31-35**: Numerous thunderstorms
- **> 35**: Strong to severe thunderstorms likely

### Lifted Index (LI)
- **> 2**: Stable atmosphere, no severe weather
- **0 to 2**: Marginally unstable
- **-2 to 0**: Moderately unstable, thunderstorms possible
- **-4 to -2**: Unstable, severe thunderstorms possible
- **-6 to -4**: Very unstable, severe thunderstorms likely
- **< -6**: Extremely unstable, violent thunderstorms

### Showalter Stability Index (SSI)
- **> 3**: Stable atmosphere
- **1 to 3**: Mostly stable
- **0 to 1**: Slightly unstable
- **-3 to 0**: Moderately unstable, thunderstorms likely
- **-6 to -3**: Very unstable, severe thunderstorms likely
- **< -6**: Extremely unstable, violent thunderstorms

### Composite Risk Score
- **0-2**: Low risk
- **3-5**: Moderate risk
- **6-8**: High risk
- **9-10**: Severe risk

## Project Structure

```
Thunderstorm-composite-model/
├── index.html                    # Web application (GitHub Pages)
├── app.js                        # Web app UI logic
├── open-meteo-api.js             # Open-Meteo API integration
├── stability-calculations.js     # JavaScript calculation functions
├── _config.yml                   # GitHub Pages configuration
├── DEPLOYMENT.md                 # GitHub Pages deployment guide
├── stability_indices.py          # Python calculation functions
├── create_storm_risk_map.py      # Python map generation script
├── example_usage.py              # Python usage examples
├── requirements.txt              # Python dependencies
├── README.md                     # This file
└── output/                       # Generated maps (created on first run)
```

## Data Sources

### Open-Meteo API

The web application uses the free [Open-Meteo API](https://open-meteo.com/) for real-time atmospheric data:

- **Temperature** at multiple pressure levels (surface, 850mb, 700mb, 500mb)
- **Relative Humidity** at pressure levels (converted to dewpoint)
- **No API key required** - Free and open for non-commercial use
- **Updated hourly** - Fresh data for accurate forecasting
- **Global coverage** - Works for all Australian cities

#### Data Processing

1. API returns temperature and relative humidity at pressure levels
2. Dewpoint is calculated using the Magnus-Tetens formula
3. Data is formatted for stability index calculations
4. Results are displayed with timestamp and source attribution

## Future Enhancements

Potential improvements for this project:

1. **Additional Data Sources**
   - Connect to ERA5 reanalysis data
   - Integrate GFS forecast model data
   - Add Bureau of Meteorology (BOM) data

2. **Additional Indices**
   - CAPE (Convective Available Potential Energy)
   - Total Totals Index
   - SWEAT Index

3. **Forecasting**
   - Multi-day forecast maps
   - Temporal analysis and trends
   - Animation of risk evolution

4. **Validation**
   - Compare with observed thunderstorm reports
   - Skill scores and validation metrics

## Technical Details

### Calculation Methods

The stability indices are calculated using established meteorological formulas:

**K-Index Formula:**
```
KI = (T_850 - T_500) + Td_850 - (T_700 - Td_700)
```

**Lifted Index Formula:**
```
LI = T_500_environment - T_500_parcel
```
Where the parcel is lifted adiabatically from the surface.

**Showalter Index Formula:**
```
SSI = T_500_environment - T_500_parcel_from_850
```
Where the parcel is lifted from 850 mb level.

### Data Requirements

For real atmospheric data, you need:
- Temperature at multiple pressure levels (surface, 850, 700, 500 mb)
- Dewpoint temperature at multiple levels
- Geographic coordinates (latitude, longitude)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source and available under the MIT License.

## References

1. George, J.J. (1960). "Weather Forecasting for Aeronautics". Academic Press.
2. Doswell, C.A., & Schultz, D.M. (2006). "On the use of indices and parameters in forecasting severe storms". Electronic Journal of Severe Storms Meteorology.
3. Galway, J.G. (1956). "The Lifted Index as a Predictor of Latent Instability". Bulletin of the American Meteorological Society.

## Contact

For questions or support, please open an issue on the GitHub repository.
