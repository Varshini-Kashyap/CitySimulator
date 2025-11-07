import { ZoneType, BuildingType } from "../types";
import { Building } from "./Building";
import { Zone } from "./Zone";
import { calculateDistance, clamp } from "../utils";

export class HappinessManager {
  private static readonly BASE_HAPPINESS = 60;
  private static readonly INFRASTRUCTURE_BONUS = 20;
  private static readonly INFRASTRUCTURE_PENALTY = -10;
  private static readonly NEIGHBOR_BONUS_PER_BUILDING = 2;
  private static readonly MAX_NEIGHBOR_BONUS = 10;
  private static readonly EMPLOYMENT_BONUS_PER_JOB = 1;
  private static readonly MAX_EMPLOYMENT_BONUS = 15;
  private static readonly POLLUTION_RADIUS = 3;
  private static readonly JOB_SEARCH_RADIUS = 5;
  private static readonly SERVICE_BUILDING_RADIUS = 8;

  /**
   * Calculate happiness for a specific zone
   */
  static calculateZoneHappiness(
    zone: Zone,
    neighboringBuildings: number,
    localPollution: number,
    nearbyJobs: number
  ): number {
    let happiness = this.BASE_HAPPINESS;

    // Infrastructure bonus/penalty
    if (zone.hasAllBasicInfrastructure()) {
      happiness += this.INFRASTRUCTURE_BONUS;
    } else {
      happiness += this.INFRASTRUCTURE_PENALTY;
    }

    // Pollution penalty
    happiness -= localPollution;

    // Neighbor bonus
    happiness += Math.min(this.MAX_NEIGHBOR_BONUS, neighboringBuildings * this.NEIGHBOR_BONUS_PER_BUILDING);

    // Employment bonus (if residential)
    if (zone.getType() === ZoneType.RESIDENTIAL) {
      happiness += Math.min(this.MAX_EMPLOYMENT_BONUS, nearbyJobs * this.EMPLOYMENT_BONUS_PER_JOB);
    }

    return clamp(happiness, 0, 100);
  }

  /**
   * Calculate service building effects on nearby zones
   */
  static calculateServiceBuildingEffects(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): number {
    let serviceBonus = 0;
    const radius = this.SERVICE_BUILDING_RADIUS;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const distance = calculateDistance(x, y, nx, ny);
          if (distance <= radius) {
            const neighborZone = zones[ny][nx];
            if (neighborZone && neighborZone.getBuilding()) {
              const building = neighborZone.getBuilding()!;
              if (building.isServiceBuilding()) {
                const serviceEffect = this.getServiceBuildingEffect(building, distance, radius);
                serviceBonus += serviceEffect;
              }
            }
          }
        }
      }
    }

    return serviceBonus;
  }

  /**
   * Get the effect of a specific service building based on distance
   */
  private static getServiceBuildingEffect(building: Building, distance: number, maxRadius: number): number {
    const distanceFactor = 1 - (distance / maxRadius);
    const serviceType = building.getServiceType();

    if (!serviceType) return 0;

    switch (serviceType) {
      case BuildingType.PARK:
        // Parks provide happiness bonus in 3x3 radius
        if (distance <= 3) {
          return 15 * distanceFactor; // Strong local happiness boost
        }
        return 0;

      case BuildingType.SCHOOL:
        // Schools increase desirability for residential areas
        if (distance <= 5) {
          return 10 * distanceFactor; // Moderate happiness boost
        }
        return 0;

      case BuildingType.HOSPITAL:
        // Hospitals provide city-wide health bonus
        return 8 * distanceFactor; // City-wide but diminishing effect

      case BuildingType.POWERPLANT:
        // Power plants provide infrastructure bonus but create pollution
        if (distance <= 2) {
          return -20; // Strong negative effect for immediate neighbors
        } else if (distance <= 5) {
          return 5 * distanceFactor; // Slight positive for power access
        }
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Calculate local pollution affecting a zone
   */
  static calculateLocalPollution(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): number {
    let pollution = 0;
    const radius = this.POLLUTION_RADIUS;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const distance = calculateDistance(x, y, nx, ny);
          if (distance <= radius) {
            const neighborZone = zones[ny][nx];
            if (neighborZone && neighborZone.getBuilding()) {
              const building = neighborZone.getBuilding()!;
              if (building.getType() === ZoneType.INDUSTRIAL) {
                const distanceFactor = 1 - (distance / radius);
                pollution += building.getPollution() * distanceFactor * 0.2;
              }
            }
          }
        }
      }
    }

    return pollution;
  }

  /**
   * Count nearby jobs for residential zones
   */
  static countNearbyJobs(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): number {
    let jobs = 0;
    const radius = this.JOB_SEARCH_RADIUS;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const distance = calculateDistance(x, y, nx, ny);
          if (distance <= radius) {
            const neighborZone = zones[ny][nx];
            if (neighborZone && neighborZone.getBuilding()) {
              const building = neighborZone.getBuilding()!;
              if (building.getJobs() > 0) {
                const distanceFactor = 1 - (distance / radius);
                jobs += building.getJobs() * distanceFactor * 0.1;
              }
            }
          }
        }
      }
    }

    return Math.floor(jobs);
  }

  /**
   * Count neighboring buildings
   */
  static countNeighboringBuildings(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): number {
    let count = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const neighborZone = zones[ny][nx];
          if (neighborZone && neighborZone.getBuilding()) {
            count++;
          }
        }
      }
    }
    
    return count;
  }

  /**
   * Calculate average happiness across all zones
   */
  static calculateAverageHappiness(zones: Zone[][]): number {
    let totalHappiness = 0;
    let zonesWithBuildings = 0;

    for (let y = 0; y < zones.length; y++) {
      for (let x = 0; x < zones[y].length; x++) {
        const zone = zones[y][x];
        if (zone.getBuilding() || zone.getType()) {
          totalHappiness += zone.getHappiness();
          zonesWithBuildings++;
        }
      }
    }

    return zonesWithBuildings > 0 ? totalHappiness / zonesWithBuildings : 50;
  }

  /**
   * Update happiness for all zones in the city
   */
  static updateAllZoneHappiness(
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): void {
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const zone = zones[y][x];
        if (!zone || !zone.getType()) continue;

        const neighboringBuildings = this.countNeighboringBuildings(x, y, zones, gridWidth, gridHeight);
        const localPollution = this.calculateLocalPollution(x, y, zones, gridWidth, gridHeight);
        const nearbyJobs = this.countNearbyJobs(x, y, zones, gridWidth, gridHeight);
        const serviceEffects = this.calculateServiceBuildingEffects(x, y, zones, gridWidth, gridHeight);

        // Calculate base happiness
        let happiness = this.calculateZoneHappiness(zone, neighboringBuildings, localPollution, nearbyJobs);
        
        // Apply service building effects
        happiness += serviceEffects;
        
        // Clamp to valid range
        happiness = clamp(happiness, 0, 100);
        
        // Update zone happiness
        zone.setHappiness(happiness);
      }
    }
  }
}

