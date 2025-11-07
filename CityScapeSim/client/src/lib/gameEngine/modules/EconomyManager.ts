import { ZoneType, BuildingSize, BuildingType } from "../types";
import { Building } from "./Building";
import { Zone } from "./Zone";

export interface EconomicStats {
  totalMoney: number;
  totalPopulation: number;
  totalTaxRevenue: number;
  employmentRate: number;
  averageIncome: number;
  cityRating: number;
  maintenanceCosts: number;
  infrastructureCosts: number;
}

export class EconomyManager {
  private static readonly BASE_TAX_RATES = {
    [ZoneType.RESIDENTIAL]: 0.05, // 5% tax rate
    [ZoneType.COMMERCIAL]: 0.08,  // 8% tax rate
    [ZoneType.INDUSTRIAL]: 0.06   // 6% tax rate
  };

  private static readonly MAINTENANCE_COSTS = {
    [ZoneType.RESIDENTIAL]: 10,
    [ZoneType.COMMERCIAL]: 15,
    [ZoneType.INDUSTRIAL]: 20
  };

  private static readonly INFRASTRUCTURE_COSTS = {
    road: 50,
    power: 100,
    water: 75
  };

  private static readonly SIZE_MULTIPLIERS = {
    [BuildingSize.SMALL]: 1,
    [BuildingSize.MEDIUM]: 2.5,
    [BuildingSize.LARGE]: 5
  };

  /**
   * Calculate total tax revenue from all buildings
   */
  static calculateTaxRevenue(buildings: Building[], grid?: any[]): number {
    let totalRevenue = 0;

    for (const building of buildings) {
      const baseIncome = this.calculateBaseIncome(building);
      const taxRate = this.BASE_TAX_RATES[building.getType()];
      const sizeMultiplier = this.SIZE_MULTIPLIERS[building.getSize()];
      
      let buildingRevenue = baseIncome * taxRate * sizeMultiplier;
      
      // Apply infrastructure efficiency modifier
      if (grid) {
        const efficiency = this.getBuildingInfrastructureEfficiency(building, grid);
        buildingRevenue *= efficiency;
      }
      
      totalRevenue += buildingRevenue;
    }

    return Math.floor(totalRevenue);
  }

  /**
   * Get building infrastructure efficiency
   */
  private static getBuildingInfrastructureEfficiency(building: Building, grid: any[]): number {
    // Find the building's position in the grid
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (cell.building && cell.building.id === building.id) {
          // Use the connectivity efficiency if available
          if (cell.connectivityEfficiency !== undefined) {
            return cell.connectivityEfficiency;
          }
          
          // Fallback to basic infrastructure check
          const hasRoad = cell.hasRoad || false;
          const hasPower = cell.hasPower || false;
          const hasWater = cell.hasWater || false;
          
          return building.getInfrastructureEfficiency(hasRoad, hasPower, hasWater);
        }
      }
    }
    
    // Default efficiency if building not found
    return 0.5;
  }

  /**
   * Check if a building has power
   */
  private static buildingHasPower(building: Building, powerGrid: any): boolean {
    // This would need to be implemented based on the power grid data
    // For now, return true as a placeholder
    return true;
  }

  /**
   * Calculate base income for a building type
   */
  private static calculateBaseIncome(building: Building): number {
    switch (building.getType()) {
      case ZoneType.RESIDENTIAL:
        return building.getPopulation() * 100; // $100 per person
      case ZoneType.COMMERCIAL:
        return building.getJobs() * 200; // $200 per job
      case ZoneType.INDUSTRIAL:
        return building.getJobs() * 150; // $150 per job
      default:
        return 0;
    }
  }

  /**
   * Calculate total population
   */
  static calculateTotalPopulation(buildings: Building[]): number {
    return buildings.reduce((total, building) => {
      return total + building.getPopulation();
    }, 0);
  }

  /**
   * Calculate employment rate
   */
  static calculateEmploymentRate(buildings: Building[]): number {
    const totalJobs = buildings.reduce((total, building) => {
      return total + building.getJobs();
    }, 0);

    const totalPopulation = this.calculateTotalPopulation(buildings);
    
    if (totalPopulation === 0) return 0;
    
    return Math.min(100, (totalJobs / totalPopulation) * 100);
  }

  /**
   * Calculate average income per capita
   */
  static calculateAverageIncome(buildings: Building[]): number {
    const totalRevenue = this.calculateTaxRevenue(buildings);
    const totalPopulation = this.calculateTotalPopulation(buildings);
    
    if (totalPopulation === 0) return 0;
    
    // Convert tax revenue to total income (assuming 20% tax rate average)
    const totalIncome = totalRevenue * 20;
    return Math.floor(totalIncome / totalPopulation);
  }

  /**
   * Calculate maintenance costs for all buildings
   */
  static calculateMaintenanceCosts(buildings: Building[]): number {
    let totalCosts = 0;

    for (const building of buildings) {
      // Use the building's own maintenance cost calculation
      totalCosts += building.getMaintenanceCost();
    }

    return Math.floor(totalCosts);
  }

  /**
   * Calculate infrastructure costs
   */
  static calculateInfrastructureCosts(zones: Zone[][]): number {
    let totalCosts = 0;

    for (let y = 0; y < zones.length; y++) {
      for (let x = 0; x < zones[y].length; x++) {
        const zone = zones[y][x];
        const infrastructure = zone.getInfrastructure();
        
        for (const infra of infrastructure) {
          totalCosts += this.INFRASTRUCTURE_COSTS[infra] || 0;
        }
      }
    }

    return Math.floor(totalCosts * 0.1); // 10% of construction cost as maintenance
  }

  /**
   * Calculate city rating based on various factors
   */
  static calculateCityRating(
    buildings: Building[],
    averageHappiness: number,
    employmentRate: number,
    pollution: number
  ): number {
    let rating = 50; // Base rating

    // Population bonus
    const population = this.calculateTotalPopulation(buildings);
    rating += Math.min(20, population / 100);

    // Happiness bonus
    rating += (averageHappiness - 50) * 0.3;

    // Employment bonus
    rating += (employmentRate - 50) * 0.2;

    // Pollution penalty
    rating -= pollution * 0.5;

    // Infrastructure bonus
    const buildingCount = buildings.length;
    rating += Math.min(10, buildingCount / 10);

    return Math.max(0, Math.min(100, Math.floor(rating)));
  }

  /**
   * Calculate comprehensive economic statistics
   */
  static calculateEconomicStats(
    buildings: Building[],
    zones: Zone[][],
    averageHappiness: number,
    pollution: number
  ): EconomicStats {
    const totalPopulation = this.calculateTotalPopulation(buildings);
    const totalTaxRevenue = this.calculateTaxRevenue(buildings);
    const employmentRate = this.calculateEmploymentRate(buildings);
    const averageIncome = this.calculateAverageIncome(buildings);
    const maintenanceCosts = this.calculateMaintenanceCosts(buildings);
    const infrastructureCosts = this.calculateInfrastructureCosts(zones);
    const cityRating = this.calculateCityRating(buildings, averageHappiness, employmentRate, pollution);

    return {
      totalMoney: 0, // This should be managed by the game state
      totalPopulation,
      totalTaxRevenue,
      employmentRate,
      averageIncome,
      cityRating,
      maintenanceCosts,
      infrastructureCosts
    };
  }

  /**
   * Calculate cost to build a specific zone type
   */
  static getZoneCost(zoneType: ZoneType): number {
    const costs = {
      [ZoneType.RESIDENTIAL]: 100,
      [ZoneType.COMMERCIAL]: 150,
      [ZoneType.INDUSTRIAL]: 200
    };
    
    return costs[zoneType] || 100;
  }

  /**
   * Calculate cost to build infrastructure
   */
  static getInfrastructureCost(infrastructureType: string): number {
    return this.INFRASTRUCTURE_COSTS[infrastructureType as keyof typeof this.INFRASTRUCTURE_COSTS] || 50;
  }

  /**
   * Get construction cost for service buildings
   */
  static getServiceBuildingCost(buildingType: BuildingType): number {
    const costs = {
      [BuildingType.PARK]: 500,
      [BuildingType.SCHOOL]: 2000,
      [BuildingType.HOSPITAL]: 3000,
      [BuildingType.POWERPLANT]: 5000
    };
    
    return costs[buildingType] || 1000;
  }

  /**
   * Get maintenance cost for service buildings
   */
  static getServiceBuildingMaintenance(buildingType: BuildingType): number {
    const maintenance = {
      [BuildingType.PARK]: 25,
      [BuildingType.SCHOOL]: 100,
      [BuildingType.HOSPITAL]: 150,
      [BuildingType.POWERPLANT]: 200
    };
    
    return maintenance[buildingType] || 50;
  }
}

