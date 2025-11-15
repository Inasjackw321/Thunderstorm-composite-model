"""
Storm Risk Map Generator for Australia
=======================================

This script creates maps of Australia showing thunderstorm risk based on
stability indices (K-Index, Lifted Index, Showalter Index).

Can work with:
- Real weather data from ERA5 or GFS (requires data download)
- Sample/synthetic data for demonstration
"""

import numpy as np
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
from matplotlib.colors import LinearSegmentedColormap
from datetime import datetime
from stability_indices import (
    calculate_k_index,
    calculate_lifted_index,
    calculate_showalter_index,
    calculate_composite_risk
)


def create_sample_data(lat_range=(-45, -10), lon_range=(110, 155), resolution=0.5):
    """
    Create sample atmospheric data for demonstration purposes.

    Parameters:
    -----------
    lat_range : tuple
        (min_lat, max_lat) for Australia
    lon_range : tuple
        (min_lon, max_lon) for Australia
    resolution : float
        Grid resolution in degrees

    Returns:
    --------
    data : dict
        Dictionary containing lat, lon, and atmospheric variables
    """
    # Create grid
    lats = np.arange(lat_range[0], lat_range[1], resolution)
    lons = np.arange(lon_range[0], lon_range[1], resolution)
    lon_grid, lat_grid = np.meshgrid(lons, lats)

    # Create realistic sample data with geographical variation
    # Temperature decreases with latitude and has some random variation
    temp_surface = 30 - 0.5 * np.abs(lat_grid + 25) + np.random.normal(0, 2, lat_grid.shape)
    temp_850 = temp_surface - 8 + np.random.normal(0, 1, lat_grid.shape)
    temp_700 = temp_850 - 5 + np.random.normal(0, 1, lat_grid.shape)
    temp_500 = temp_850 - 18 + np.random.normal(0, 1.5, lat_grid.shape)

    # Dewpoint is generally lower than temperature
    # Higher dewpoint in northern (tropical) regions
    dewpoint_surface = temp_surface - 5 - 0.3 * np.abs(lat_grid + 25) + np.random.normal(0, 2, lat_grid.shape)
    dewpoint_850 = temp_850 - 3 + np.random.normal(0, 1, lat_grid.shape)
    dewpoint_700 = temp_700 - 5 + np.random.normal(0, 1.5, lat_grid.shape)

    # Add some "hot spots" for storm activity (e.g., in northern Australia during summer)
    # Create convective regions
    for _ in range(3):
        center_lat = np.random.uniform(lat_range[0] + 5, lat_range[1] - 5)
        center_lon = np.random.uniform(lon_range[0] + 5, lon_range[1] - 5)
        distance = np.sqrt((lat_grid - center_lat)**2 + (lon_grid - center_lon)**2)
        influence = np.exp(-distance**2 / 20)

        # Increase temperature and dewpoint in these regions
        temp_surface += influence * 5
        dewpoint_surface += influence * 8  # More moisture

    return {
        'lat': lats,
        'lon': lons,
        'lat_grid': lat_grid,
        'lon_grid': lon_grid,
        'temp_surface': temp_surface,
        'temp_850': temp_850,
        'temp_700': temp_700,
        'temp_500': temp_500,
        'dewpoint_surface': dewpoint_surface,
        'dewpoint_850': dewpoint_850,
        'dewpoint_700': dewpoint_700
    }


def plot_stability_index_map(lons, lats, index_values, index_name, title,
                             output_file=None, vmin=None, vmax=None, cmap=None):
    """
    Plot a stability index on a map of Australia.

    Parameters:
    -----------
    lons : array
        Longitude values
    lats : array
        Latitude values
    index_values : array
        2D array of index values
    index_name : str
        Name of the index (e.g., 'K-Index', 'Lifted Index')
    title : str
        Plot title
    output_file : str, optional
        Path to save the figure
    vmin, vmax : float, optional
        Min/max values for color scale
    cmap : str or Colormap, optional
        Colormap to use
    """
    fig = plt.figure(figsize=(14, 10))
    ax = plt.axes(projection=ccrs.PlateCarree())

    # Set extent to Australia
    ax.set_extent([110, 155, -45, -10], crs=ccrs.PlateCarree())

    # Add map features
    ax.add_feature(cfeature.LAND, facecolor='lightgray', alpha=0.3)
    ax.add_feature(cfeature.OCEAN, facecolor='lightblue', alpha=0.3)
    ax.add_feature(cfeature.COASTLINE, linewidth=1.5)
    ax.add_feature(cfeature.BORDERS, linewidth=1, linestyle=':')
    ax.add_feature(cfeature.STATES, linewidth=0.5, linestyle=':')

    # Add gridlines
    gl = ax.gridlines(draw_labels=True, linewidth=0.5, alpha=0.5, linestyle='--')
    gl.top_labels = False
    gl.right_labels = False

    # Plot the index
    if cmap is None:
        # Default colormap based on index type
        if 'K-Index' in index_name:
            # Higher K-Index = more unstable = red
            cmap = 'YlOrRd'
        else:  # Lifted Index or Showalter Index
            # Lower values = more unstable = red (reversed)
            cmap = 'RdYlGn'

    im = ax.contourf(lons, lats, index_values, levels=15,
                     cmap=cmap, vmin=vmin, vmax=vmax,
                     transform=ccrs.PlateCarree(), alpha=0.7)

    # Add colorbar
    cbar = plt.colorbar(im, ax=ax, orientation='vertical', pad=0.05, shrink=0.8)
    cbar.set_label(index_name, fontsize=12)

    # Add title and timestamp
    plt.title(title, fontsize=16, fontweight='bold', pad=20)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M UTC')
    plt.text(0.02, 0.02, f'Generated: {timestamp}',
             transform=ax.transAxes, fontsize=10,
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

    plt.tight_layout()

    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"Map saved to: {output_file}")

    return fig, ax


def create_composite_risk_map(data, output_dir='output'):
    """
    Create maps showing all three stability indices and a composite risk map.

    Parameters:
    -----------
    data : dict
        Dictionary containing atmospheric data
    output_dir : str
        Directory to save output maps
    """
    import os
    os.makedirs(output_dir, exist_ok=True)

    # Extract data
    lat_grid = data['lat_grid']
    lon_grid = data['lon_grid']
    lats = data['lat']
    lons = data['lon']

    # Calculate stability indices
    print("Calculating K-Index...")
    ki = calculate_k_index(
        data['temp_surface'],
        data['temp_850'],
        data['temp_500'],
        data['dewpoint_surface'],
        data['dewpoint_700']
    )

    print("Calculating Lifted Index...")
    li = calculate_lifted_index(
        data['temp_surface'],
        data['temp_500'],
        data['dewpoint_surface']
    )

    print("Calculating Showalter Stability Index...")
    ssi = calculate_showalter_index(
        data['temp_850'],
        data['temp_500'],
        data['dewpoint_850']
    )

    print("Calculating Composite Risk Score...")
    risk = calculate_composite_risk(ki, li, ssi)

    # Create individual maps
    print("\nGenerating maps...")

    # K-Index map
    plot_stability_index_map(
        lon_grid, lat_grid, ki,
        'K-Index',
        'Thunderstorm Potential - K-Index\nAustralia',
        output_file=f'{output_dir}/k_index_map.png',
        vmin=10, vmax=45,
        cmap='YlOrRd'
    )
    plt.close()

    # Lifted Index map
    plot_stability_index_map(
        lon_grid, lat_grid, li,
        'Lifted Index (°C)',
        'Atmospheric Stability - Lifted Index\nAustralia',
        output_file=f'{output_dir}/lifted_index_map.png',
        vmin=-8, vmax=4,
        cmap='RdYlGn'
    )
    plt.close()

    # Showalter Stability Index map
    plot_stability_index_map(
        lon_grid, lat_grid, ssi,
        'Showalter Index (°C)',
        'Atmospheric Stability - Showalter Index\nAustralia',
        output_file=f'{output_dir}/showalter_index_map.png',
        vmin=-8, vmax=5,
        cmap='RdYlGn'
    )
    plt.close()

    # Composite Risk map
    # Create custom colormap for risk
    colors = ['green', 'yellow', 'orange', 'red', 'darkred']
    n_bins = 100
    risk_cmap = LinearSegmentedColormap.from_list('risk', colors, N=n_bins)

    plot_stability_index_map(
        lon_grid, lat_grid, risk,
        'Composite Risk Score (0-10)',
        'Thunderstorm Risk - Composite Analysis\nAustralia',
        output_file=f'{output_dir}/composite_risk_map.png',
        vmin=0, vmax=10,
        cmap=risk_cmap
    )
    plt.close()

    # Create a combined figure with all four maps
    fig = plt.figure(figsize=(20, 16))

    # K-Index
    ax1 = plt.subplot(2, 2, 1, projection=ccrs.PlateCarree())
    ax1.set_extent([110, 155, -45, -10], crs=ccrs.PlateCarree())
    ax1.add_feature(cfeature.COASTLINE, linewidth=1)
    ax1.add_feature(cfeature.BORDERS, linewidth=0.5, linestyle=':')
    im1 = ax1.contourf(lon_grid, lat_grid, ki, levels=15, cmap='YlOrRd',
                       vmin=10, vmax=45, transform=ccrs.PlateCarree(), alpha=0.7)
    ax1.set_title('K-Index', fontsize=14, fontweight='bold')
    plt.colorbar(im1, ax=ax1, orientation='vertical', shrink=0.7)

    # Lifted Index
    ax2 = plt.subplot(2, 2, 2, projection=ccrs.PlateCarree())
    ax2.set_extent([110, 155, -45, -10], crs=ccrs.PlateCarree())
    ax2.add_feature(cfeature.COASTLINE, linewidth=1)
    ax2.add_feature(cfeature.BORDERS, linewidth=0.5, linestyle=':')
    im2 = ax2.contourf(lon_grid, lat_grid, li, levels=15, cmap='RdYlGn',
                       vmin=-8, vmax=4, transform=ccrs.PlateCarree(), alpha=0.7)
    ax2.set_title('Lifted Index', fontsize=14, fontweight='bold')
    plt.colorbar(im2, ax=ax2, orientation='vertical', shrink=0.7)

    # Showalter Index
    ax3 = plt.subplot(2, 2, 3, projection=ccrs.PlateCarree())
    ax3.set_extent([110, 155, -45, -10], crs=ccrs.PlateCarree())
    ax3.add_feature(cfeature.COASTLINE, linewidth=1)
    ax3.add_feature(cfeature.BORDERS, linewidth=0.5, linestyle=':')
    im3 = ax3.contourf(lon_grid, lat_grid, ssi, levels=15, cmap='RdYlGn',
                       vmin=-8, vmax=5, transform=ccrs.PlateCarree(), alpha=0.7)
    ax3.set_title('Showalter Stability Index', fontsize=14, fontweight='bold')
    plt.colorbar(im3, ax=ax3, orientation='vertical', shrink=0.7)

    # Composite Risk
    ax4 = plt.subplot(2, 2, 4, projection=ccrs.PlateCarree())
    ax4.set_extent([110, 155, -45, -10], crs=ccrs.PlateCarree())
    ax4.add_feature(cfeature.COASTLINE, linewidth=1)
    ax4.add_feature(cfeature.BORDERS, linewidth=0.5, linestyle=':')
    im4 = ax4.contourf(lon_grid, lat_grid, risk, levels=15, cmap=risk_cmap,
                       vmin=0, vmax=10, transform=ccrs.PlateCarree(), alpha=0.7)
    ax4.set_title('Composite Risk Score', fontsize=14, fontweight='bold')
    cbar4 = plt.colorbar(im4, ax=ax4, orientation='vertical', shrink=0.7)
    cbar4.set_label('Risk: Low → High', fontsize=10)

    plt.suptitle('Thunderstorm Risk Analysis - Australia',
                 fontsize=18, fontweight='bold', y=0.98)

    plt.tight_layout()
    combined_file = f'{output_dir}/combined_stability_indices.png'
    plt.savefig(combined_file, dpi=300, bbox_inches='tight')
    print(f"\nCombined map saved to: {combined_file}")
    plt.close()

    # Print statistics
    print("\n" + "="*60)
    print("STABILITY INDICES STATISTICS")
    print("="*60)
    print(f"\nK-Index:")
    print(f"  Min: {np.min(ki):.1f}  Max: {np.max(ki):.1f}  Mean: {np.mean(ki):.1f}")
    print(f"\nLifted Index:")
    print(f"  Min: {np.min(li):.1f}  Max: {np.max(li):.1f}  Mean: {np.mean(li):.1f}")
    print(f"\nShowalter Index:")
    print(f"  Min: {np.min(ssi):.1f}  Max: {np.max(ssi):.1f}  Mean: {np.mean(ssi):.1f}")
    print(f"\nComposite Risk Score:")
    print(f"  Min: {np.min(risk):.1f}  Max: {np.max(risk):.1f}  Mean: {np.mean(risk):.1f}")

    # Calculate percentage of area in different risk categories
    total_points = risk.size
    low_risk = np.sum(risk < 3) / total_points * 100
    moderate_risk = np.sum((risk >= 3) & (risk < 6)) / total_points * 100
    high_risk = np.sum((risk >= 6) & (risk < 9)) / total_points * 100
    severe_risk = np.sum(risk >= 9) / total_points * 100

    print(f"\nRisk Distribution:")
    print(f"  Low (0-3):      {low_risk:.1f}%")
    print(f"  Moderate (3-6): {moderate_risk:.1f}%")
    print(f"  High (6-9):     {high_risk:.1f}%")
    print(f"  Severe (9-10):  {severe_risk:.1f}%")
    print("="*60)

    return {
        'k_index': ki,
        'lifted_index': li,
        'showalter_index': ssi,
        'composite_risk': risk
    }


def main():
    """Main execution function."""
    print("="*60)
    print("THUNDERSTORM RISK MAPPING FOR AUSTRALIA")
    print("Using Stability Indices: K-Index, Lifted Index, Showalter Index")
    print("="*60)

    # Create sample data
    print("\nGenerating sample atmospheric data...")
    data = create_sample_data(resolution=0.5)

    # Create maps
    indices = create_composite_risk_map(data, output_dir='output')

    print("\n" + "="*60)
    print("ANALYSIS COMPLETE!")
    print("="*60)
    print("\nGenerated files in 'output/' directory:")
    print("  - k_index_map.png")
    print("  - lifted_index_map.png")
    print("  - showalter_index_map.png")
    print("  - composite_risk_map.png")
    print("  - combined_stability_indices.png")
    print("\nThese maps show thunderstorm potential across Australia")
    print("based on atmospheric stability analysis.")
    print("="*60)


if __name__ == '__main__':
    main()
