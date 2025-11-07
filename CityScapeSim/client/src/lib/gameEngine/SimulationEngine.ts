import { 
  GridCell, 
  Building as BuildingType, 
  ZoneType, 
  BuildingSize, 
  SimulationUpdate 
} from "./types";
import { 
  GRID_WIDTH, 
  GRID_HEIGHT, 
  hasAllBasicInfrastructure, 
  getNeighbors, 
  calculateDistance,
  clamp 
} from "./utils";
import { SimulationEngine as ModularSimulationEngine } from "./modules";

export class SimulationEngine {
  private modularEngine: ModularSimulationEngine;
  private buildingId = 0;

  constructor() {
    this.modularEngine = new ModularSimulationEngine(GRID_WIDTH, GRID_HEIGHT);
  }

  simulate(grid: GridCell[][]): SimulationUpdate {
    // Convert GridCell[][] to ZoneCell[][] for modular engine
    const zoneGrid = this.convertGridToZoneGrid(grid);
    
    // Use modular engine for simulation
    return this.modularEngine.simulate(zoneGrid);
  }

  private convertGridToZoneGrid(grid: GridCell[][]): any[][] {
    const zoneGrid: any[][] = [];
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      zoneGrid[y] = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        zoneGrid[y][x] = {
          x: cell.x,
          y: cell.y,
          zoneType: cell.zoneType,
          infrastructure: [...cell.infrastructure],
          building: cell.building,
          happiness: cell.happiness,
          pollution: cell.pollution
        };
      }
    }
    
    return zoneGrid;
  }

  private convertZoneGridToGrid(zoneGrid: any[][]): GridCell[][] {
    const grid: GridCell[][] = [];
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      grid[y] = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        const zoneCell = zoneGrid[y][x];
        grid[y][x] = {
          x: zoneCell.x,
          y: zoneCell.y,
          zoneType: zoneCell.zoneType,
          infrastructure: [...zoneCell.infrastructure],
          building: zoneCell.building,
          happiness: zoneCell.happiness,
          pollution: zoneCell.pollution
        };
      }
    }
    
    return grid;
  }

  // Legacy methods for backward compatibility
  private shouldCreateBuilding(cell: GridCell, grid: GridCell[][]): boolean {
    // This method is now handled by the modular engine
    return false;
  }

  private shouldUpgradeBuilding(cell: GridCell, grid: GridCell[][]): boolean {
    // This method is now handled by the modular engine
    return false;
  }

  private createBuilding(x: number, y: number, zoneType: ZoneType): BuildingType {
    // This method is now handled by the modular engine
    return {} as BuildingType;
  }

  private upgradeBuilding(building: BuildingType): BuildingType {
    // This method is now handled by the modular engine
    return building;
  }

  private setBuildingStats(building: BuildingType): void {
    // This method is now handled by the modular engine
  }

  private countNeighboringBuildings(x: number, y: number, grid: GridCell[][]): number {
    // This method is now handled by the modular engine
    return 0;
  }

  private extractBuildings(grid: GridCell[][]): BuildingType[] {
    // This method is now handled by the modular engine
    return [];
  }

  private calculateEconomics(buildings: BuildingType[]) {
    // This method is now handled by the modular engine
    return {
      money: 0,
      population: 0,
      taxRevenue: 0,
      employmentRate: 0
    };
  }

  private calculateHappiness(grid: GridCell[][]): number {
    // This method is now handled by the modular engine
    return 50;
  }

  private calculatePollution(buildings: BuildingType[]): number {
    // This method is now handled by the modular engine
    return 0;
  }

  private calculateCellHappiness(cell: GridCell, grid: GridCell[][]): number {
    // This method is now handled by the modular engine
    return 50;
  }

  private calculateCellPollution(cell: GridCell, grid: GridCell[][]): number {
    // This method is now handled by the modular engine
    return 0;
  }

  private getLocalPollution(x: number, y: number, grid: GridCell[][]): number {
    // This method is now handled by the modular engine
    return 0;
  }

  private countNearbyJobs(x: number, y: number, grid: GridCell[][]): number {
    // This method is now handled by the modular engine
    return 0;
  }
}
