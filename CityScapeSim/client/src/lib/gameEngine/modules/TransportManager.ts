import { ZoneType, InfrastructureType } from "../types";
import { Zone } from "./Zone";
import { Building } from "./Building";
import { calculateDistance } from "../utils";

export interface TransportNode {
  x: number;
  y: number;
  type: InfrastructureType;
  connections: TransportNode[];
  efficiency: number;
}

export interface TransportRoute {
  start: TransportNode;
  end: TransportNode;
  distance: number;
  efficiency: number;
  congestion: number;
}

export class TransportManager {
  private static readonly CONNECTIVITY_BONUS = 15;
  private static readonly ISOLATION_PENALTY = -10;
  private static readonly MAX_CONNECTIVITY_RANGE = 5;
  private static readonly ROAD_EFFICIENCY = 0.8;
  private static readonly POWER_EFFICIENCY = 0.9;
  private static readonly WATER_EFFICIENCY = 0.85;

  /**
   * Calculate connectivity score for a zone
   */
  static calculateConnectivity(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): number {
    let connectivity = 0;
    const range = this.MAX_CONNECTIVITY_RANGE;

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const distance = calculateDistance(x, y, nx, ny);
          if (distance <= range) {
            const neighborZone = zones[ny][nx];
            if (neighborZone && neighborZone.getInfrastructure().length > 0) {
              const distanceFactor = 1 - (distance / range);
              connectivity += distanceFactor * neighborZone.getInfrastructure().length;
            }
          }
        }
      }
    }

    return Math.min(100, connectivity);
  }

  /**
   * Check if a zone is well-connected
   */
  static isWellConnected(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): boolean {
    const connectivity = this.calculateConnectivity(x, y, zones, gridWidth, gridHeight);
    return connectivity > 30; // Threshold for "well-connected"
  }

  /**
   * Calculate transportation efficiency for a zone
   */
  static calculateTransportEfficiency(
    zone: Zone,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): number {
    const infrastructure = zone.getInfrastructure();
    let efficiency = 0;

    // Base efficiency from infrastructure
    for (const infra of infrastructure) {
      switch (infra) {
        case 'road':
          efficiency += this.ROAD_EFFICIENCY;
          break;
        case 'power':
          efficiency += this.POWER_EFFICIENCY;
          break;
        case 'water':
          efficiency += this.WATER_EFFICIENCY;
          break;
      }
    }

    // Connectivity bonus
    const connectivity = this.calculateConnectivity(
      zone.getX(),
      zone.getY(),
      zones,
      gridWidth,
      gridHeight
    );
    efficiency += connectivity / 100;

    return Math.min(1, efficiency);
  }

  /**
   * Calculate accessibility to jobs for residential zones
   */
  static calculateJobAccessibility(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): number {
    let accessibility = 0;
    const range = 8; // Job search range

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const distance = calculateDistance(x, y, nx, ny);
          if (distance <= range) {
            const neighborZone = zones[ny][nx];
            if (neighborZone && neighborZone.getBuilding()) {
              const building = neighborZone.getBuilding()!;
              if (building.getJobs() > 0) {
                const distanceFactor = 1 - (distance / range);
                const transportEfficiency = this.calculateTransportEfficiency(
                  neighborZone,
                  zones,
                  gridWidth,
                  gridHeight
                );
                accessibility += building.getJobs() * distanceFactor * transportEfficiency;
              }
            }
          }
        }
      }
    }

    return Math.floor(accessibility);
  }

  /**
   * Calculate service accessibility for commercial zones
   */
  static calculateServiceAccessibility(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): number {
    let accessibility = 0;
    const range = 6; // Service range

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const distance = calculateDistance(x, y, nx, ny);
          if (distance <= range) {
            const neighborZone = zones[ny][nx];
            if (neighborZone && neighborZone.getBuilding()) {
              const building = neighborZone.getBuilding()!;
              if (building.getType() === ZoneType.RESIDENTIAL) {
                const distanceFactor = 1 - (distance / range);
                const transportEfficiency = this.calculateTransportEfficiency(
                  neighborZone,
                  zones,
                  gridWidth,
                  gridHeight
                );
                accessibility += building.getPopulation() * distanceFactor * transportEfficiency;
              }
            }
          }
        }
      }
    }

    return Math.floor(accessibility);
  }

  /**
   * Calculate supply chain efficiency for industrial zones
   */
  static calculateSupplyChainEfficiency(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): number {
    let efficiency = 0;
    const range = 10; // Supply chain range

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const distance = calculateDistance(x, y, nx, ny);
          if (distance <= range) {
            const neighborZone = zones[ny][nx];
            if (neighborZone && neighborZone.getBuilding()) {
              const building = neighborZone.getBuilding()!;
              if (building.getType() === ZoneType.INDUSTRIAL) {
                const distanceFactor = 1 - (distance / range);
                const transportEfficiency = this.calculateTransportEfficiency(
                  neighborZone,
                  zones,
                  gridWidth,
                  gridHeight
                );
                efficiency += distanceFactor * transportEfficiency;
              }
            }
          }
        }
      }
    }

    return Math.min(1, efficiency / 10);
  }

  /**
   * Apply transportation effects to zone happiness
   */
  static applyTransportHappinessEffect(
    zone: Zone,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): void {
    const connectivity = this.calculateConnectivity(
      zone.getX(),
      zone.getY(),
      zones,
      gridWidth,
      gridHeight
    );

    let happinessModifier = 0;

    if (connectivity > 50) {
      happinessModifier = this.CONNECTIVITY_BONUS;
    } else if (connectivity < 10) {
      happinessModifier = this.ISOLATION_PENALTY;
    }

    // Apply zone-specific modifiers
    switch (zone.getType()) {
      case ZoneType.RESIDENTIAL:
        const jobAccess = this.calculateJobAccessibility(
          zone.getX(),
          zone.getY(),
          zones,
          gridWidth,
          gridHeight
        );
        happinessModifier += Math.min(10, jobAccess / 10);
        break;
        
      case ZoneType.COMMERCIAL:
        const serviceAccess = this.calculateServiceAccessibility(
          zone.getX(),
          zone.getY(),
          zones,
          gridWidth,
          gridHeight
        );
        happinessModifier += Math.min(10, serviceAccess / 20);
        break;
        
      case ZoneType.INDUSTRIAL:
        const supplyEfficiency = this.calculateSupplyChainEfficiency(
          zone.getX(),
          zone.getY(),
          zones,
          gridWidth,
          gridHeight
        );
        happinessModifier += Math.min(5, supplyEfficiency * 10);
        break;
    }

    const currentHappiness = zone.getHappiness();
    const newHappiness = Math.max(0, Math.min(100, currentHappiness + happinessModifier));
    
    // Update zone happiness (we need to add this method to Zone class)
    // For now, we'll update the building happiness if it exists
    const building = zone.getBuilding();
    if (building) {
      building.setHappiness(newHappiness);
    }
  }

  /**
   * Get transportation statistics for the city
   */
  static getTransportStats(
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number
  ): {
    averageConnectivity: number;
    wellConnectedZones: number;
    isolatedZones: number;
    totalInfrastructure: number;
    transportEfficiency: number;
  } {
    let totalConnectivity = 0;
    let wellConnectedCount = 0;
    let isolatedCount = 0;
    let totalInfrastructure = 0;
    let totalEfficiency = 0;
    let zoneCount = 0;

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const zone = zones[y][x];
        if (zone && zone.getType()) {
          const connectivity = this.calculateConnectivity(x, y, zones, gridWidth, gridHeight);
          const efficiency = this.calculateTransportEfficiency(zone, zones, gridWidth, gridHeight);
          
          totalConnectivity += connectivity;
          totalEfficiency += efficiency;
          totalInfrastructure += zone.getInfrastructure().length;
          zoneCount++;

          if (connectivity > 50) {
            wellConnectedCount++;
          } else if (connectivity < 10) {
            isolatedCount++;
          }
        }
      }
    }

    return {
      averageConnectivity: zoneCount > 0 ? totalConnectivity / zoneCount : 0,
      wellConnectedZones: wellConnectedCount,
      isolatedZones: isolatedCount,
      totalInfrastructure,
      transportEfficiency: zoneCount > 0 ? totalEfficiency / zoneCount : 0
    };
  }

  /**
   * Find optimal location for new infrastructure
   */
  static findOptimalInfrastructureLocation(
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number,
    infrastructureType: InfrastructureType
  ): { x: number; y: number; score: number } | null {
    let bestLocation = null;
    let bestScore = -1;

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const zone = zones[y][x];
        if (zone && !zone.hasInfrastructure(infrastructureType)) {
          const score = this.calculateInfrastructurePlacementScore(
            x, y, zones, gridWidth, gridHeight, infrastructureType
          );
          
          if (score > bestScore) {
            bestScore = score;
            bestLocation = { x, y, score };
          }
        }
      }
    }

    return bestLocation;
  }

  /**
   * Calculate score for placing infrastructure at a location
   */
  private static calculateInfrastructurePlacementScore(
    x: number,
    y: number,
    zones: Zone[][],
    gridWidth: number,
    gridHeight: number,
    infrastructureType: InfrastructureType
  ): number {
    let score = 0;
    const range = 3;

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const neighborZone = zones[ny][nx];
          if (neighborZone && neighborZone.getType() && !neighborZone.hasInfrastructure(infrastructureType)) {
            const distance = calculateDistance(x, y, nx, ny);
            const distanceFactor = 1 - (distance / range);
            score += distanceFactor * 10;
          }
        }
      }
    }

    return score;
  }
}

