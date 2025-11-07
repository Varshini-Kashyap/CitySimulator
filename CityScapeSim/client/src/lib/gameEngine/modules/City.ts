import { ZoneType, InfrastructureType, SimulationUpdate, GridCell } from "../types";
import { Zone } from "./Zone";
import { Building } from "./Building";
import { HappinessManager } from "./HappinessManager";
import { EconomyManager } from "./EconomyManager";
import { WeatherManager } from "./WeatherManager";
import { TransportManager } from "./TransportManager";

export interface ZoneCell {
  x: number;
  y: number;
  zoneType: ZoneType | null;
  infrastructure: InfrastructureType[];
  building: Building | null;
  happiness: number;
  pollution: number;
}

export class City {
  private zones: Zone[][];
  private gridWidth: number;
  private gridHeight: number;

  constructor(gridWidth: number = 50, gridHeight: number = 30) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.zones = this.initializeZones();
  }

  /**
   * Initialize empty zones grid
   */
  private initializeZones(): Zone[][] {
    const zones: Zone[][] = [];
    for (let y = 0; y < this.gridHeight; y++) {
      zones[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        zones[y][x] = new Zone(x, y, null);
      }
    }
    return zones;
  }

  /**
   * Add a zone to the city
   */
  addZone(x: number, y: number, zoneType: ZoneType): boolean {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
      return false;
    }

    const zone = this.zones[y][x];
    if (zone.getType() !== null) {
      return false; // Zone already exists
    }

    zone.setType(zoneType);
    return true;
  }

  /**
   * Add a 2x2 zone block to the city
   */
  addZoneBlock(x: number, y: number, zoneType: ZoneType): boolean {
    // Check if 2x2 area is within bounds
    if (x < 0 || x + 1 >= this.gridWidth || y < 0 || y + 1 >= this.gridHeight) {
      return false;
    }

    // Check if all 4 cells are available
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const zone = this.zones[y + dy][x + dx];
        if (zone.getType() !== null) {
          return false; // One or more cells already have zones
        }
      }
    }

    // Create 2x2 zone block
    const blockId = `zone_block_${Date.now()}_${x}_${y}`;
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const zone = this.zones[y + dy][x + dx];
        zone.setType(zoneType);
        // Mark as part of a block zone
        zone.setBlockZoneId(blockId);
        zone.setBlockZoneX(x);
        zone.setBlockZoneY(y);
      }
    }

    return true;
  }

  /**
   * Add infrastructure to a zone
   */
  addInfrastructure(x: number, y: number, type: InfrastructureType): boolean {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
      return false;
    }

    const zone = this.zones[y][x];
    return zone.addInfrastructure(type);
  }

  /**
   * Get zone at position
   */
  getZone(x: number, y: number): Zone | null {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
      return null;
    }
    return this.zones[y][x];
  }

  /**
   * Get all zones
   */
  getZones(): Zone[][] {
    return this.zones;
  }

  /**
   * Get grid width
   */
  getGridWidth(): number {
    return this.gridWidth;
  }

  /**
   * Get grid height
   */
  getGridHeight(): number {
    return this.gridHeight;
  }

  /**
   * Run one simulation step
   */
  simulate(): SimulationUpdate {
    // Update weather
    WeatherManager.updateWeather();
    
    // Apply weather effects
    WeatherManager.applyWeatherEffects(this.zones);

    // Update all zone happiness
    HappinessManager.updateAllZoneHappiness(this.zones, this.gridWidth, this.gridHeight);

    // Apply transport effects
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const zone = this.zones[y][x];
        if (zone.getType()) {
          TransportManager.applyTransportHappinessEffect(zone, this.zones, this.gridWidth, this.gridHeight);
        }
      }
    }

    // Simulate building growth
    this.simulateBuildingGrowth();

    // Calculate statistics
    const buildings = this.getAllBuildings();
    const economicStats = EconomyManager.calculateEconomicStats(
      buildings,
      this.zones,
      this.calculateAverageHappiness(),
      this.calculateAveragePollution()
    );

    return {
      buildings: buildings.map(building => building.toJSON()),
      economics: {
        money: economicStats.totalMoney,
        population: economicStats.totalPopulation,
        taxRevenue: economicStats.totalTaxRevenue,
        employmentRate: economicStats.employmentRate
      },
      happiness: this.calculateAverageHappiness(),
      pollution: this.calculateAveragePollution()
    };
  }

  /**
   * Simulate building growth in zones
   */
  private simulateBuildingGrowth(): void {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const zone = this.zones[y][x];
        if (zone.getType() && !zone.getBuilding()) {
          // Check if this is a 2x2 block zone
          if (zone.isBlockZone()) {
            // Only process the top-left cell of each block to avoid duplicates
            const blockX = zone.getBlockZoneX();
            const blockY = zone.getBlockZoneY();
            if (blockX === x && blockY === y) {
              // This is the top-left cell of a 2x2 block
              if (this.canBlockZoneGrow(zone)) {
                this.createBlockBuilding(x, y, zone.getType()!);
              }
            }
          } else {
            // Regular single-cell zone
            if (this.canZoneGrow(zone)) {
              const buildingId = `building_${Date.now()}_${Math.random()}`;
              zone.createBuilding(buildingId);
            }
          }
        } else if (zone.getBuilding()) {
          // Check if existing building can upgrade
          if (this.canBuildingUpgrade(zone)) {
            zone.upgradeBuilding();
          }
        }
      }
    }
  }

  /**
   * Check if a zone can grow a building
   */
  private canZoneGrow(zone: Zone): boolean {
    // Basic growth conditions
    const hasInfrastructure = zone.getInfrastructure().length > 0;
    const weatherAllowsGrowth = WeatherManager.canGrowInCurrentWeather();
    const happinessThreshold = zone.getHappiness() > 30;
    
    return hasInfrastructure && weatherAllowsGrowth && happinessThreshold;
  }

  /**
   * Check if a 2x2 block zone can grow a building
   */
  private canBlockZoneGrow(zone: Zone): boolean {
    const blockX = zone.getBlockZoneX();
    const blockY = zone.getBlockZoneY();
    if (blockX === null || blockY === null) return false;

    // Check if all 4 cells in the block have infrastructure
    let hasAllInfrastructure = true;
    let averageHappiness = 0;
    let cellCount = 0;

    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const blockZone = this.getZone(blockX + dx, blockY + dy);
        if (!blockZone || !blockZone.hasAllBasicInfrastructure()) {
          hasAllInfrastructure = false;
          break;
        }
        averageHappiness += blockZone.getHappiness();
        cellCount++;
      }
      if (!hasAllInfrastructure) break;
    }

    if (!hasAllInfrastructure) return false;

    const weatherAllowsGrowth = WeatherManager.canGrowInCurrentWeather();
    const happinessThreshold = (averageHappiness / cellCount) > 40; // Higher threshold for blocks
    
    return weatherAllowsGrowth && happinessThreshold;
  }

  /**
   * Check if a building can upgrade
   */
  private canBuildingUpgrade(zone: Zone): boolean {
    const building = zone.getBuilding();
    if (!building) return false;

    // Check if building is not already at max size
    if (building.getSize() === 'large') return false;

    // Check upgrade conditions
    const happinessThreshold = zone.getHappiness() > 50;
    const weatherAllowsGrowth = WeatherManager.canGrowInCurrentWeather();
    
    return happinessThreshold && weatherAllowsGrowth;
  }

  /**
   * Create a 2x2 block building
   */
  createBlockBuilding(x: number, y: number, zoneType: ZoneType): Building | null {
    // Check if this is a 2x2 zone block
    const zone = this.getZone(x, y);
    if (!zone || !zone.isBlockZone()) return null;

    // Get the block zone coordinates
    const blockX = zone.getBlockZoneX();
    const blockY = zone.getBlockZoneY();
    if (blockX === null || blockY === null) return null;

    // Check if all 4 cells in the block have the required infrastructure
    let hasAllInfrastructure = true;
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const blockZone = this.getZone(blockX + dx, blockY + dy);
        if (!blockZone || !blockZone.hasAllBasicInfrastructure()) {
          hasAllInfrastructure = false;
          break;
        }
      }
      if (!hasAllInfrastructure) break;
    }

    if (!hasAllInfrastructure) return null;

    // Create the 2x2 block building
    const buildingId = `block_building_${Date.now()}_${blockX}_${blockY}`;
    const buildingType = this.getBlockBuildingType(zoneType);
    
    const building = new Building(
      buildingId,
      blockX,
      blockY,
      zoneType,
      BuildingSize.BLOCK_2X2,
      buildingType,
      true, // isBlock
      2,    // blockWidth
      2     // blockHeight
    );

    // Set the building in the top-left zone of the block
    const topLeftZone = this.getZone(blockX, blockY);
    if (topLeftZone) {
      topLeftZone.setBuilding(building);
    }

    return building;
  }

  /**
   * Get the appropriate building type for a 2x2 zone block
   */
  private getBlockBuildingType(zoneType: ZoneType): BuildingType {
    switch (zoneType) {
      case ZoneType.RESIDENTIAL:
        return BuildingType.RESIDENTIAL_BLOCK;
      case ZoneType.COMMERCIAL:
        return BuildingType.COMMERCIAL_BLOCK;
      case ZoneType.INDUSTRIAL:
        return BuildingType.INDUSTRIAL_BLOCK;
      default:
        return BuildingType.RESIDENTIAL_BLOCK;
    }
  }

  /**
   * Get all buildings in the city
   */
  getAllBuildings(): Building[] {
    const buildings: Building[] = [];
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const zone = this.zones[y][x];
        const building = zone.getBuilding();
        if (building) {
          buildings.push(building);
        }
      }
    }
    return buildings;
  }

  /**
   * Calculate average happiness across all zones
   */
  private calculateAverageHappiness(): number {
    let totalHappiness = 0;
    let zoneCount = 0;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const zone = this.zones[y][x];
        if (zone.getType()) {
          totalHappiness += zone.getHappiness();
          zoneCount++;
        }
      }
    }

    return zoneCount > 0 ? totalHappiness / zoneCount : 0;
  }

  /**
   * Calculate average pollution across all zones
   */
  private calculateAveragePollution(): number {
    let totalPollution = 0;
    let zoneCount = 0;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const zone = this.zones[y][x];
        if (zone.getType()) {
          totalPollution += zone.getPollution();
          zoneCount++;
        }
      }
    }

    return zoneCount > 0 ? totalPollution / zoneCount : 0;
  }

  /**
   * Get city statistics
   */
  getStatistics() {
    const buildings = this.getAllBuildings();
    const economicStats = EconomyManager.calculateEconomicStats(
      buildings,
      this.zones,
      this.calculateAverageHappiness(),
      this.calculateAveragePollution()
    );

    return {
      ...economicStats,
      averageHappiness: this.calculateAverageHappiness(),
      averagePollution: this.calculateAveragePollution(),
      weatherStats: WeatherManager.getWeatherStats(),
      transportStats: TransportManager.getTransportStats(this.zones, this.gridWidth, this.gridHeight)
    };
  }

  /**
   * Convert city to grid format for rendering
   */
  toGridFormat(): GridCell[][] {
    const grid: GridCell[][] = [];
    
    for (let y = 0; y < this.gridHeight; y++) {
      grid[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        const zone = this.zones[y][x];
        grid[y][x] = {
          x: zone.getX(),
          y: zone.getY(),
          zoneType: zone.getType(),
          infrastructure: zone.getInfrastructure(),
          building: zone.getBuilding(),
          happiness: zone.getHappiness(),
          pollution: zone.getPollution(),
          // 2x2 Zone properties
          isBlockZone: zone.isBlockZone(),
          blockZoneId: zone.getBlockZoneId(),
          blockZoneX: zone.getBlockZoneX(),
          blockZoneY: zone.getBlockZoneY(),
          // Power grid properties
          hasPower: false,
          powerSource: null,
          powerCapacity: 0,
          powerDemand: 0,
          // Infrastructure connectivity properties
          hasRoad: false,
          hasWater: false,
          connectivityStatus: undefined,
          connectivityEfficiency: undefined
        };
      }
    }
    
    return grid;
  }

  /**
   * Load city from grid format
   */
  fromGridFormat(grid: GridCell[][]): void {
    // Clear existing zones
    this.zones = this.initializeZones();
    
    // Load from grid
    for (let y = 0; y < Math.min(grid.length, this.gridHeight); y++) {
      for (let x = 0; x < Math.min(grid[y].length, this.gridWidth); x++) {
        const cell = grid[y][x];
        const zone = this.zones[y][x];
        
        if (cell.zoneType) {
          zone.setType(cell.zoneType);
        }
        
        // Add infrastructure
        for (const infra of cell.infrastructure) {
          zone.addInfrastructure(infra);
        }
        
        // Set building if exists
        if (cell.building) {
          // Properly reconstruct the Building object from the data
          const building = Building.fromJSON(cell.building);
          zone.setBuilding(building);
        }
        
        // Set happiness and pollution
        zone.setHappiness(cell.happiness);
        zone.setPollution(cell.pollution);
        
        // Set 2x2 zone properties
        if (cell.isBlockZone) {
          zone.setBlockZoneId(cell.blockZoneId || '');
          zone.setBlockZoneX(cell.blockZoneX || 0);
          zone.setBlockZoneY(cell.blockZoneY || 0);
        }
      }
    }
  }
}
