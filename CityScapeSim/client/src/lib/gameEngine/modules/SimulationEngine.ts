import { SimulationUpdate, GridCell } from "../types";
import { City } from "./City";
import { Zone } from "./Zone";
import type { ZoneCell } from "./Zone";
import { Building } from "./Building";
import { HappinessManager } from "./HappinessManager";
import { PowerGridManager } from "./PowerGridManager";
import { InfrastructureConnectivityManager } from "./InfrastructureConnectivityManager";

export class SimulationEngine {
  private city: City;

  constructor(gridWidth?: number, gridHeight?: number) {
    this.city = new City(gridWidth, gridHeight);
  }

  /**
   * Run one simulation step
   */
  simulate(grid?: GridCell[][]): SimulationUpdate {
    // If grid is provided, load it into the city
    if (grid) {
      this.city.fromGridFormat(grid);
    }

    // Calculate power grid distribution
    const cityGrid = this.city.toGridFormat();
    const powerGrid = PowerGridManager.calculatePowerDistribution(cityGrid);
    PowerGridManager.updateGridPowerStatus(cityGrid, powerGrid);

    // Calculate infrastructure connectivity
    InfrastructureConnectivityManager.updateGridConnectivity(cityGrid);

    // Run city simulation
    const update = this.city.simulate();

    // Add power grid information to the update
    update.powerGrid = {
      totalCapacity: powerGrid.totalCapacity,
      totalDemand: powerGrid.totalDemand,
      efficiency: powerGrid.efficiency,
      isOverloaded: PowerGridManager.isPowerGridOverloaded(powerGrid),
      shortageAreas: PowerGridManager.getPowerShortageAreas(powerGrid).length
    };

    // Add connectivity statistics to the update
    const connectivityStats = InfrastructureConnectivityManager.getGridConnectivityStats(cityGrid);
    update.connectivity = {
      totalBuildings: connectivityStats.totalBuildings,
      fullyConnected: connectivityStats.fullyConnected,
      partiallyConnected: connectivityStats.partiallyConnected,
      poorlyConnected: connectivityStats.poorlyConnected,
      averageEfficiency: connectivityStats.averageEfficiency,
      roadCoverage: connectivityStats.roadCoverage,
      powerCoverage: connectivityStats.powerCoverage,
      waterCoverage: connectivityStats.waterCoverage
    };

    return update;
  }

  /**
   * Get the current city instance
   */
  getCity(): City {
    return this.city;
  }

  /**
   * Add a zone to the city
   */
  addZone(x: number, y: number, zoneType: any): boolean {
    return this.city.addZone(x, y, zoneType);
  }

  /**
   * Add infrastructure to a zone
   */
  addInfrastructure(x: number, y: number, type: any): boolean {
    return this.city.addInfrastructure(x, y, type);
  }

  /**
   * Get zone at position
   */
  getZone(x: number, y: number): Zone | null {
    return this.city.getZone(x, y);
  }

  /**
   * Get city statistics
   */
  getStatistics() {
    return this.city.getStatistics();
  }

  /**
   * Convert city to grid format for rendering
   */
  toGridFormat(): ZoneCell[][] {
    return this.city.toGridFormat();
  }

  /**
   * Load city from grid format
   */
  fromGridFormat(grid: ZoneCell[][]): void {
    this.city.fromGridFormat(grid);
  }

  /**
   * Create a new building in a zone
   */
  createBuilding(x: number, y: number, zoneType: any): Building | null {
    const zone = this.city.getZone(x, y);
    if (!zone) return null;

    const buildingId = `building_${Date.now()}_${Math.random()}`;
    return zone.createBuilding(buildingId);
  }

  /**
   * Create a 2x2 block building
   */
  createBlockBuilding(x: number, y: number, zoneType: ZoneType): Building | null {
    return this.city.createBlockBuilding(x, y, zoneType);
  }

  /**
   * Upgrade a building in a zone
   */
  upgradeBuilding(x: number, y: number): boolean {
    const zone = this.city.getZone(x, y);
    if (!zone) return false;

    return zone.upgradeBuilding();
  }

  /**
   * Get all buildings in the city
   */
  getAllBuildings() {
    return this.city.getZones().flatMap(row => 
      row.filter(zone => zone.getBuilding()).map(zone => zone.getBuilding()!.toJSON())
    );
  }

  /**
   * Calculate happiness for a specific zone
   */
  calculateZoneHappiness(x: number, y: number): number {
    const zone = this.city.getZone(x, y);
    if (!zone) return 0;

    const neighboringBuildings = HappinessManager.countNeighboringBuildings(
      x, y, this.city.getZones(), this.city.getGridWidth(), this.city.getGridHeight()
    );
    
    const localPollution = HappinessManager.calculateLocalPollution(
      x, y, this.city.getZones(), this.city.getGridWidth(), this.city.getGridHeight()
    );
    
    const nearbyJobs = HappinessManager.countNearbyJobs(
      x, y, this.city.getZones(), this.city.getGridWidth(), this.city.getGridHeight()
    );

    return HappinessManager.calculateZoneHappiness(zone, neighboringBuildings, localPollution, nearbyJobs);
  }

  /**
   * Update happiness for all zones
   */
  updateAllHappiness(): void {
    HappinessManager.updateAllZoneHappiness(
      this.city.getZones(), 
      this.city.getGridWidth(), 
      this.city.getGridHeight()
    );
  }
}
