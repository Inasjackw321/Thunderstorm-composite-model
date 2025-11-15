"""
Example Usage of Stability Indices
===================================

This script demonstrates how to use the stability indices module
with sample atmospheric data.
"""

from stability_indices import (
    calculate_k_index,
    calculate_lifted_index,
    calculate_showalter_index,
    calculate_composite_risk,
    interpret_k_index,
    interpret_lifted_index,
    interpret_showalter_index
)


def example_1_stable_conditions():
    """Example 1: Stable atmospheric conditions (no thunderstorm risk)"""
    print("\n" + "="*60)
    print("EXAMPLE 1: Stable Atmospheric Conditions")
    print("="*60)

    # Typical stable conditions
    temp_surface = 22.0      # °C
    temp_850 = 15.0          # °C
    temp_500 = -5.0          # °C
    dewpoint_surface = 10.0  # °C (dry)
    dewpoint_700 = 5.0       # °C
    dewpoint_850 = 8.0       # °C

    # Calculate indices
    ki = calculate_k_index(temp_surface, temp_850, temp_500,
                           dewpoint_surface, dewpoint_700)
    li = calculate_lifted_index(temp_surface, temp_500, dewpoint_surface)
    ssi = calculate_showalter_index(temp_850, temp_500, dewpoint_850)
    risk = calculate_composite_risk(ki, li, ssi)

    # Print results
    print(f"\nAtmospheric Conditions:")
    print(f"  Surface Temp: {temp_surface}°C")
    print(f"  850 mb Temp:  {temp_850}°C")
    print(f"  500 mb Temp:  {temp_500}°C")
    print(f"  Surface Dewpoint: {dewpoint_surface}°C")

    print(f"\nStability Indices:")
    print(f"  K-Index:           {ki:.1f} - {interpret_k_index(ki)}")
    print(f"  Lifted Index:      {li:.1f}°C - {interpret_lifted_index(li)}")
    print(f"  Showalter Index:   {ssi:.1f}°C - {interpret_showalter_index(ssi)}")
    print(f"  Composite Risk:    {risk:.1f}/10")

    print(f"\nConclusion: Atmosphere is stable, no thunderstorm development expected.")


def example_2_moderate_instability():
    """Example 2: Moderate instability (thunderstorms possible)"""
    print("\n" + "="*60)
    print("EXAMPLE 2: Moderate Instability")
    print("="*60)

    # Moderate instability
    temp_surface = 28.0      # °C
    temp_850 = 20.0          # °C
    temp_500 = 2.0           # °C
    dewpoint_surface = 18.0  # °C (moderate moisture)
    dewpoint_700 = 12.0      # °C
    dewpoint_850 = 15.0      # °C

    # Calculate indices
    ki = calculate_k_index(temp_surface, temp_850, temp_500,
                           dewpoint_surface, dewpoint_700)
    li = calculate_lifted_index(temp_surface, temp_500, dewpoint_surface)
    ssi = calculate_showalter_index(temp_850, temp_500, dewpoint_850)
    risk = calculate_composite_risk(ki, li, ssi)

    # Print results
    print(f"\nAtmospheric Conditions:")
    print(f"  Surface Temp: {temp_surface}°C")
    print(f"  850 mb Temp:  {temp_850}°C")
    print(f"  500 mb Temp:  {temp_500}°C")
    print(f"  Surface Dewpoint: {dewpoint_surface}°C")

    print(f"\nStability Indices:")
    print(f"  K-Index:           {ki:.1f} - {interpret_k_index(ki)}")
    print(f"  Lifted Index:      {li:.1f}°C - {interpret_lifted_index(li)}")
    print(f"  Showalter Index:   {ssi:.1f}°C - {interpret_showalter_index(ssi)}")
    print(f"  Composite Risk:    {risk:.1f}/10")

    print(f"\nConclusion: Moderate instability, scattered thunderstorms possible.")


def example_3_severe_conditions():
    """Example 3: Severe instability (high thunderstorm risk)"""
    print("\n" + "="*60)
    print("EXAMPLE 3: Severe Instability (High Storm Risk)")
    print("="*60)

    # Severe unstable conditions (typical of severe thunderstorm environment)
    temp_surface = 35.0      # °C (hot)
    temp_850 = 26.0          # °C
    temp_500 = 0.0           # °C (cold aloft)
    dewpoint_surface = 24.0  # °C (very humid)
    dewpoint_700 = 18.0      # °C
    dewpoint_850 = 22.0      # °C

    # Calculate indices
    ki = calculate_k_index(temp_surface, temp_850, temp_500,
                           dewpoint_surface, dewpoint_700)
    li = calculate_lifted_index(temp_surface, temp_500, dewpoint_surface)
    ssi = calculate_showalter_index(temp_850, temp_500, dewpoint_850)
    risk = calculate_composite_risk(ki, li, ssi)

    # Print results
    print(f"\nAtmospheric Conditions:")
    print(f"  Surface Temp: {temp_surface}°C")
    print(f"  850 mb Temp:  {temp_850}°C")
    print(f"  500 mb Temp:  {temp_500}°C")
    print(f"  Surface Dewpoint: {dewpoint_surface}°C")

    print(f"\nStability Indices:")
    print(f"  K-Index:           {ki:.1f} - {interpret_k_index(ki)}")
    print(f"  Lifted Index:      {li:.1f}°C - {interpret_lifted_index(li)}")
    print(f"  Showalter Index:   {ssi:.1f}°C - {interpret_showalter_index(ssi)}")
    print(f"  Composite Risk:    {risk:.1f}/10")

    print(f"\nConclusion: Very unstable atmosphere, severe thunderstorms likely!")
    print(f"            Strong updrafts, heavy rainfall, and possible severe weather.")


def example_4_tropical_conditions():
    """Example 4: Tropical conditions (Northern Australia)"""
    print("\n" + "="*60)
    print("EXAMPLE 4: Tropical Conditions (Northern Australia)")
    print("="*60)

    # Tropical environment with high moisture
    temp_surface = 32.0      # °C
    temp_850 = 24.0          # °C
    temp_500 = 4.0           # °C
    dewpoint_surface = 26.0  # °C (very humid, tropical)
    dewpoint_700 = 16.0      # °C
    dewpoint_850 = 20.0      # °C

    # Calculate indices
    ki = calculate_k_index(temp_surface, temp_850, temp_500,
                           dewpoint_surface, dewpoint_700)
    li = calculate_lifted_index(temp_surface, temp_500, dewpoint_surface)
    ssi = calculate_showalter_index(temp_850, temp_500, dewpoint_850)
    risk = calculate_composite_risk(ki, li, ssi)

    # Print results
    print(f"\nAtmospheric Conditions:")
    print(f"  Surface Temp: {temp_surface}°C")
    print(f"  850 mb Temp:  {temp_850}°C")
    print(f"  500 mb Temp:  {temp_500}°C")
    print(f"  Surface Dewpoint: {dewpoint_surface}°C (very humid)")

    print(f"\nStability Indices:")
    print(f"  K-Index:           {ki:.1f} - {interpret_k_index(ki)}")
    print(f"  Lifted Index:      {li:.1f}°C - {interpret_lifted_index(li)}")
    print(f"  Showalter Index:   {ssi:.1f}°C - {interpret_showalter_index(ssi)}")
    print(f"  Composite Risk:    {risk:.1f}/10")

    print(f"\nConclusion: Tropical moisture with instability.")
    print(f"            High risk of afternoon/evening thunderstorms with heavy rain.")


def main():
    """Run all examples"""
    print("\n" + "="*70)
    print("  ATMOSPHERIC STABILITY INDICES - EXAMPLE CALCULATIONS")
    print("="*70)
    print("\nDemonstrating thunderstorm risk assessment using:")
    print("  • K-Index (KI)")
    print("  • Lifted Index (LI)")
    print("  • Showalter Stability Index (SSI)")

    # Run examples
    example_1_stable_conditions()
    example_2_moderate_instability()
    example_3_severe_conditions()
    example_4_tropical_conditions()

    print("\n" + "="*70)
    print("  EXAMPLES COMPLETE")
    print("="*70)
    print("\nThese examples demonstrate how atmospheric conditions affect")
    print("thunderstorm potential across Australia.")
    print("\nFor geographic analysis, run: python create_storm_risk_map.py")
    print("="*70 + "\n")


if __name__ == '__main__':
    main()
