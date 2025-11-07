import { GridCell, BuildingType } from "../types";
import { Building } from "./Building";
import { hasInfrastructure, calculateDistance } from "../utils";

export class InfrastructureConnectivityManager {
  private static readonly ROAD_CONNECTION_RANGE = 1; // Adjacent cells
  private static readonly POWER_CONNECTION_RANGE = 8; // Power transmission range
  private static readonly WATER_CONNECTION_RANGE = 6; // Water distribution range
  private static readonly INFRASTRUCTURE_EFFICIENCY_THRESHOLD = 0.5; // 50% threshold for dim status

  /**
   * Check if a building has road connectivity
   */
  static hasRoadConnectivity(x: number, y: number, grid: GridCell[][]): boolean {
    if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
      return false;
    }

    const cell = grid[y][x];
    
    // Check if the building's cell has road infrastructure
    if (hasInfrastructure(cell, 'road')) {
      return true;
    }

    // Check adjacent cells for road connections
    const neighbors = this.getNeighbors(x, y, this.ROAD_CONNECTION_RANGE, grid);
    return neighbors.some(neighbor => hasInfrastructure(neighbor, 'road'));
  }

  /**
   * Check if a building has power connectivity
   */
  static hasPowerConnectivity(x: number, y: number, grid: GridCell[][]): boolean {
    if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
      return false;
    }

    const cell = grid[y][x];
    
    // Check if the building's cell has power infrastructure
    if (hasInfrastructure(cell, 'power')) {
      return true;
    }

    // Check for power line connections within range
    const neighbors = this.getNeighbors(x, y, this.POWER_CONNECTION_RANGE, grid);
    return neighbors.some(neighbor => hasInfrastructure(neighbor, 'power'));
  }

  /**
   * Check if a building has water connectivity
   */
  static hasWaterConnectivity(x: number, y: number, grid: GridCell[][]): boolean {
    if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
      return false;
    }

    const cell = grid[y][x];
    
    // Check if the building's cell has water infrastructure
    if (hasInfrastructure(cell, 'water')) {
      return true;
    }

    // Check for water pipe connections within range
    const neighbors = this.getNeighbors(x, y, this.WATER_CONNECTION_RANGE, grid);
    return neighbors.some(neighbor => hasInfrastructure(neighbor, 'water'));
  }

  /**
   * Get all infrastructure connectivity for a building
   */
  static getBuildingConnectivity(x: number, y: number, grid: GridCell[][]): {
    road: boolean;
    power: boolean;
    water: boolean;
    status: 'bright' | 'dim' | 'dark';
    efficiency: number;
  } {
    const road = this.hasRoadConnectivity(x, y, grid);
    const power = this.hasPowerConnectivity(x, y, grid);
    const water = this.hasWaterConnectivity(x, y, grid);

    const cell = grid[y][x];
    let status: 'bright' | 'dim' | 'dark' = 'dark';
    let efficiency = 0.1; // Minimum efficiency

    if (cell.building) {
      status = cell.building.getConnectivityStatus(road, power, water);
      efficiency = cell.building.getInfrastructureEfficiency(road, power, water);
    } else {
      // For cells without buildings, calculate basic connectivity
      const connectedCount = [road, power, water].filter(Boolean).length;
      if (connectedCount === 3) {
        status = 'bright';
        efficiency = 1.0;
      } else if (connectedCount >= 2) {
        status = 'dim';
        efficiency = 0.6;
      } else {
        status = 'dark';
        efficiency = 0.3;
      }
    }

    return {
      road,
      power,
      water,
      status,
      efficiency
    };
  }

  /**
   * Update all building connectivity status in the grid
   */
  static updateGridConnectivity(grid: GridCell[][]): void {
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (cell.building) {
          const connectivity = this.getBuildingConnectivity(x, y, grid);
          
          // Update cell properties
          cell.hasRoad = connectivity.road;
          cell.hasPower = connectivity.power;
          cell.hasWater = connectivity.water;
          cell.connectivityStatus = connectivity.status;
          cell.connectivityEfficiency = connectivity.efficiency;
        }
      }
    }
  }

  /**
   * Get neighbors within a specific range
   */
  private static getNeighbors(x: number, y: number, range: number, grid: GridCell[][]): GridCell[] {
    const neighbors: GridCell[] = [];
    
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        // Skip the center cell and out-of-bounds cells
        if ((dx === 0 && dy === 0) || nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) {
          continue;
        }
        
        // Only include cells within the specified range
        const distance = calculateDistance(x, y, nx, ny);
        if (distance <= range) {
          neighbors.push(grid[ny][nx]);
        }
      }
    }
    
    return neighbors;
  }

  /**
   * Check if infrastructure is connected to a network
   */
  static isInfrastructureConnected(x: number, y: number, type: 'road' | 'power' | 'water', grid: GridCell[][]): boolean {
    if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
      return false;
    }

    const cell = grid[y][x];
    
    // Check if the cell has the infrastructure type
    if (!hasInfrastructure(cell, type)) {
      return false;
    }

    // Check if it's connected to other infrastructure of the same type
    const range = type === 'road' ? this.ROAD_CONNECTION_RANGE : 
                  type === 'power' ? this.POWER_CONNECTION_RANGE : 
                  this.WATER_CONNECTION_RANGE;
    
    const neighbors = this.getNeighbors(x, y, range, grid);
    return neighbors.some(neighbor => hasInfrastructure(neighbor, type));
  }

  /**
   * Get connectivity statistics for the entire grid
   */
  static getGridConnectivityStats(grid: GridCell[][]): {
    totalBuildings: number;
    fullyConnected: number;
    partiallyConnected: number;
    poorlyConnected: number;
    averageEfficiency: number;
    roadCoverage: number;
    powerCoverage: number;
    waterCoverage: number;
  } {
    let totalBuildings = 0;
    let fullyConnected = 0;
    let partiallyConnected = 0;
    let poorlyConnected = 0;
    let totalEfficiency = 0;
    let roadConnected = 0;
    let powerConnected = 0;
    let waterConnected = 0;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (cell.building) {
          totalBuildings++;
          const connectivity = this.getBuildingConnectivity(x, y, grid);
          
          totalEfficiency += connectivity.efficiency;
          
          if (connectivity.road) roadConnected++;
          if (connectivity.power) powerConnected++;
          if (connectivity.water) waterConnected++;
          
          switch (connectivity.status) {
            case 'bright':
              fullyConnected++;
              break;
            case 'dim':
              partiallyConnected++;
              break;
            case 'dark':
              poorlyConnected++;
              break;
          }
        }
      }
    }

    return {
      totalBuildings,
      fullyConnected,
      partiallyConnected,
      poorlyConnected,
      averageEfficiency: totalBuildings > 0 ? totalEfficiency / totalBuildings : 0,
      roadCoverage: totalBuildings > 0 ? roadConnected / totalBuildings : 0,
      powerCoverage: totalBuildings > 0 ? powerConnected / totalBuildings : 0,
      waterCoverage: totalBuildings > 0 ? waterConnected / totalBuildings : 0
    };
  }

  /**
   * Find buildings with poor connectivity
   */
  static findPoorlyConnectedBuildings(grid: GridCell[][]): Array<{
    x: number;
    y: number;
    building: Building;
    connectivity: {
      road: boolean;
      power: boolean;
      water: boolean;
      status: 'bright' | 'dim' | 'dark';
      efficiency: number;
    };
  }> {
    const poorlyConnected: Array<{
      x: number;
      y: number;
      building: Building;
      connectivity: {
        road: boolean;
        power: boolean;
        water: boolean;
        status: 'bright' | 'dim' | 'dark';
        efficiency: number;
      };
    }> = [];

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (cell.building) {
          const connectivity = this.getBuildingConnectivity(x, y, grid);
          
          if (connectivity.status === 'dark' || connectivity.efficiency < 0.5) {
            poorlyConnected.push({
              x,
              y,
              building: cell.building,
              connectivity
            });
          }
        }
      }
    }

    return poorlyConnected;
  }

  /**
   * Get infrastructure recommendations for a building
   */
  static getInfrastructureRecommendations(x: number, y: number, grid: GridCell[][]): string[] {
    const connectivity = this.getBuildingConnectivity(x, y, grid);
    const recommendations: string[] = [];

    if (!connectivity.road) {
      recommendations.push('Add road access for better connectivity');
    }
    if (!connectivity.power) {
      recommendations.push('Connect power lines for full operation');
    }
    if (!connectivity.water) {
      recommendations.push('Install water pipes for complete infrastructure');
    }

    return recommendations;
  }
}

