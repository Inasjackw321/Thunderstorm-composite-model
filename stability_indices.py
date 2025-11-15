"""
Atmospheric Stability Indices for Thunderstorm Prediction
=========================================================

This module calculates various stability indices used in thunderstorm forecasting:
- K-Index (KI)
- Lifted Index (LI)
- Showalter Stability Index (SSI)

These indices help meteorologists assess the potential for thunderstorm development.
"""

import numpy as np
from metpy.units import units
from metpy.calc import dewpoint_from_relative_humidity, saturation_vapor_pressure, mixing_ratio, moist_lapse


def calculate_k_index(temp_surface, temp_850, temp_500, dewpoint_surface, dewpoint_700):
    """
    Calculate the K-Index (KI) for thunderstorm potential.

    K-Index = (T_850 - T_500) + Td_850 - (T_700 - Td_700)

    Where:
    - T_850 = Temperature at 850 mb
    - T_500 = Temperature at 500 mb
    - Td_850 = Dewpoint at 850 mb (approximated from surface dewpoint)
    - T_700 = Temperature at 700 mb
    - Td_700 = Dewpoint at 700 mb

    Simplified formula using available data:
    KI = (T_850 - T_500) + Td_surface - (T_700 - Td_700)

    Parameters:
    -----------
    temp_surface : float or array
        Surface temperature in Celsius
    temp_850 : float or array
        Temperature at 850 mb in Celsius
    temp_500 : float or array
        Temperature at 500 mb in Celsius
    dewpoint_surface : float or array
        Surface dewpoint in Celsius
    dewpoint_700 : float or array
        Dewpoint at 700 mb in Celsius

    Returns:
    --------
    k_index : float or array
        K-Index value(s)

    Interpretation:
    ---------------
    KI < 15  : No thunderstorms
    15-20    : Isolated thunderstorms
    21-25    : Widely scattered thunderstorms
    26-30    : Scattered thunderstorms
    31-35    : Numerous thunderstorms
    > 35     : Strong to severe thunderstorms
    """
    # Estimate temperature at 700 mb (if not provided, use approximation)
    # Typically T_700 ≈ T_850 - 5°C
    temp_700 = temp_850 - 5.0

    # Calculate K-Index
    k_index = (temp_850 - temp_500) + dewpoint_surface - (temp_700 - dewpoint_700)

    return k_index


def calculate_lifted_index(temp_surface, temp_500, dewpoint_surface, pressure_surface=1000):
    """
    Calculate the Lifted Index (LI).

    The Lifted Index measures the stability of the atmosphere by comparing
    the temperature of a parcel lifted from the surface to 500 mb with the
    actual temperature at 500 mb.

    LI = T_500_ambient - T_500_parcel

    Parameters:
    -----------
    temp_surface : float or array
        Surface temperature in Celsius
    temp_500 : float or array
        Ambient temperature at 500 mb in Celsius
    dewpoint_surface : float or array
        Surface dewpoint in Celsius
    pressure_surface : float or array, optional
        Surface pressure in mb (default: 1000 mb)

    Returns:
    --------
    lifted_index : float or array
        Lifted Index value(s)

    Interpretation:
    ---------------
    LI > 2      : Stable, no severe weather
    0 to 2      : Marginally unstable
    -2 to 0     : Moderately unstable, thunderstorms possible
    -4 to -2    : Unstable, severe thunderstorms possible
    -6 to -4    : Very unstable, severe thunderstorms likely
    < -6        : Extremely unstable, violent thunderstorms
    """
    # Convert to Kelvin for calculations
    T_surface_K = temp_surface + 273.15
    T_500_K = temp_500 + 273.15
    Td_surface_K = dewpoint_surface + 273.15

    # Simplified adiabatic lifting calculation
    # Approximate the parcel temperature at 500 mb using dry adiabatic lapse rate
    # until saturation, then moist adiabatic lapse rate

    # Pressure levels
    p_surface = pressure_surface  # mb
    p_500 = 500  # mb

    # Estimate parcel temperature at 500 mb
    # Using simplified calculation: assume dry adiabatic lapse rate of ~9.8°C/km
    # Pressure ratio method
    pressure_ratio = (p_500 / p_surface) ** 0.286  # Poisson's equation exponent

    # If dewpoint is close to temperature, use moist adiabatic lapse (~6°C/km)
    # Otherwise use dry adiabatic
    humidity_factor = (T_surface_K - Td_surface_K) / T_surface_K

    if isinstance(humidity_factor, np.ndarray):
        # Array calculation
        lapse_rate = np.where(humidity_factor < 0.05, 0.5, 0.286)  # 0.5 for moist, 0.286 for dry
        T_parcel_500_K = T_surface_K * ((p_500 / p_surface) ** lapse_rate)
    else:
        # Scalar calculation
        if humidity_factor < 0.05:  # Very humid, use moist adiabatic
            lapse_rate = 0.5
        else:  # Use dry adiabatic
            lapse_rate = 0.286
        T_parcel_500_K = T_surface_K * ((p_500 / p_surface) ** lapse_rate)

    # Calculate Lifted Index
    lifted_index = T_500_K - T_parcel_500_K

    return lifted_index


def calculate_showalter_index(temp_850, temp_500, dewpoint_850, pressure_850=850):
    """
    Calculate the Showalter Stability Index (SSI).

    Similar to the Lifted Index, but the parcel is lifted from 850 mb instead
    of the surface. This is useful for assessing mid-level instability.

    SSI = T_500_ambient - T_500_parcel_from_850

    Parameters:
    -----------
    temp_850 : float or array
        Temperature at 850 mb in Celsius
    temp_500 : float or array
        Ambient temperature at 500 mb in Celsius
    dewpoint_850 : float or array
        Dewpoint at 850 mb in Celsius
    pressure_850 : float, optional
        Pressure level of lower parcel in mb (default: 850 mb)

    Returns:
    --------
    showalter_index : float or array
        Showalter Stability Index value(s)

    Interpretation:
    ---------------
    SSI > 3     : Stable
    1 to 3      : Mostly stable
    0 to 1      : Slightly unstable
    -3 to 0     : Moderately unstable, thunderstorms likely
    -6 to -3    : Very unstable, severe thunderstorms likely
    < -6        : Extremely unstable, violent thunderstorms
    """
    # Convert to Kelvin
    T_850_K = temp_850 + 273.15
    T_500_K = temp_500 + 273.15
    Td_850_K = dewpoint_850 + 273.15

    # Pressure levels
    p_850 = pressure_850  # mb
    p_500 = 500  # mb

    # Estimate parcel temperature at 500 mb lifted from 850 mb
    # Similar approach as Lifted Index
    humidity_factor = (T_850_K - Td_850_K) / T_850_K

    if isinstance(humidity_factor, np.ndarray):
        # Array calculation - use moist adiabatic if humid
        lapse_rate = np.where(humidity_factor < 0.05, 0.5, 0.286)
        T_parcel_500_K = T_850_K * ((p_500 / p_850) ** lapse_rate)
    else:
        # Scalar calculation
        if humidity_factor < 0.05:  # Very humid, use moist adiabatic
            lapse_rate = 0.5
        else:  # Use dry adiabatic
            lapse_rate = 0.286
        T_parcel_500_K = T_850_K * ((p_500 / p_850) ** lapse_rate)

    # Calculate Showalter Index
    showalter_index = T_500_K - T_parcel_500_K

    return showalter_index


def interpret_k_index(ki):
    """Return text interpretation of K-Index value."""
    if isinstance(ki, np.ndarray):
        interpretation = np.empty(ki.shape, dtype=object)
        interpretation[ki < 15] = "No thunderstorms"
        interpretation[(ki >= 15) & (ki < 20)] = "Isolated thunderstorms"
        interpretation[(ki >= 20) & (ki < 26)] = "Widely scattered thunderstorms"
        interpretation[(ki >= 26) & (ki < 31)] = "Scattered thunderstorms"
        interpretation[(ki >= 31) & (ki < 36)] = "Numerous thunderstorms"
        interpretation[ki >= 36] = "Strong to severe thunderstorms"
        return interpretation
    else:
        if ki < 15:
            return "No thunderstorms"
        elif ki < 20:
            return "Isolated thunderstorms"
        elif ki < 26:
            return "Widely scattered thunderstorms"
        elif ki < 31:
            return "Scattered thunderstorms"
        elif ki < 36:
            return "Numerous thunderstorms"
        else:
            return "Strong to severe thunderstorms"


def interpret_lifted_index(li):
    """Return text interpretation of Lifted Index value."""
    if isinstance(li, np.ndarray):
        interpretation = np.empty(li.shape, dtype=object)
        interpretation[li > 2] = "Stable"
        interpretation[(li >= 0) & (li <= 2)] = "Marginally unstable"
        interpretation[(li >= -2) & (li < 0)] = "Moderately unstable"
        interpretation[(li >= -4) & (li < -2)] = "Unstable, severe storms possible"
        interpretation[(li >= -6) & (li < -4)] = "Very unstable, severe storms likely"
        interpretation[li < -6] = "Extremely unstable"
        return interpretation
    else:
        if li > 2:
            return "Stable"
        elif li >= 0:
            return "Marginally unstable"
        elif li >= -2:
            return "Moderately unstable"
        elif li >= -4:
            return "Unstable, severe storms possible"
        elif li >= -6:
            return "Very unstable, severe storms likely"
        else:
            return "Extremely unstable"


def interpret_showalter_index(ssi):
    """Return text interpretation of Showalter Stability Index value."""
    if isinstance(ssi, np.ndarray):
        interpretation = np.empty(ssi.shape, dtype=object)
        interpretation[ssi > 3] = "Stable"
        interpretation[(ssi >= 1) & (ssi <= 3)] = "Mostly stable"
        interpretation[(ssi >= 0) & (ssi < 1)] = "Slightly unstable"
        interpretation[(ssi >= -3) & (ssi < 0)] = "Moderately unstable"
        interpretation[(ssi >= -6) & (ssi < -3)] = "Very unstable, severe storms likely"
        interpretation[ssi < -6] = "Extremely unstable"
        return interpretation
    else:
        if ssi > 3:
            return "Stable"
        elif ssi >= 1:
            return "Mostly stable"
        elif ssi >= 0:
            return "Slightly unstable"
        elif ssi >= -3:
            return "Moderately unstable"
        elif ssi >= -6:
            return "Very unstable, severe storms likely"
        else:
            return "Extremely unstable"


def calculate_composite_risk(ki, li, ssi):
    """
    Calculate a composite thunderstorm risk score from all three indices.

    Parameters:
    -----------
    ki : float or array
        K-Index values
    li : float or array
        Lifted Index values
    ssi : float or array
        Showalter Stability Index values

    Returns:
    --------
    risk_score : float or array
        Composite risk score (0-10 scale)
        0-2: Low risk
        3-5: Moderate risk
        6-8: High risk
        9-10: Severe risk
    """
    # Normalize each index to 0-10 scale
    # K-Index: 15-40 range
    ki_norm = np.clip((ki - 15) / 25 * 10, 0, 10)

    # Lifted Index: -6 to +2 range (inverted - lower is higher risk)
    li_norm = np.clip((2 - li) / 8 * 10, 0, 10)

    # Showalter Index: -6 to +3 range (inverted - lower is higher risk)
    ssi_norm = np.clip((3 - ssi) / 9 * 10, 0, 10)

    # Weighted average (K-Index weighted slightly higher as it includes moisture)
    risk_score = (0.4 * ki_norm + 0.3 * li_norm + 0.3 * ssi_norm)

    return risk_score
