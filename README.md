# Thunderstorm Composite Model - Australia

A Python-based system for calculating and visualizing thunderstorm risk across Australia using atmospheric stability indices.

## Overview

This project implements three key meteorological stability indices used for thunderstorm forecasting:

1. **K-Index (KI)** - Provides a quick estimate of thunderstorm likelihood based on temperature at surface and 850 mb level, and dewpoint
2. **Lifted Index (LI)** - Measures atmospheric stability by calculating the temperature difference between a rising air parcel and ambient air at 500 mb
3. **Showalter Stability Index (SSI)** - Similar to LI, but lifts the air parcel from 850 mb level instead of the surface

## Features

- Calculate all three stability indices from atmospheric data
- Generate detailed risk maps for Australia
- Composite risk scoring combining all indices
- High-resolution geographic visualization
- Statistical analysis of risk distribution

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Setup

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
├── stability_indices.py          # Core calculation functions
├── create_storm_risk_map.py      # Map generation script
├── requirements.txt              # Python dependencies
├── README.md                     # This file
└── output/                       # Generated maps (created on first run)
```

## Future Enhancements

Potential improvements for this project:

1. **Real-time Data Integration**
   - Connect to ERA5 reanalysis data
   - Integrate GFS forecast model data
   - Automatic data download and processing

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
