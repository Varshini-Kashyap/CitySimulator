import { ZoneType, InfrastructureType, BuildingSize, Building as BuildingType } from "../types";
import { Building } from "./Building";
import { hasAllBasicInfrastructure, getNeighbors } from "../utils";

export interface ZoneCell {
  x: number;
  y: number;
  zoneType: ZoneType | null;
  infrastructure: InfrastructureType[];
  building: Building | null;
  happiness: number;
  pollution: number;
}

export class Zone {
  private x: number;
  private y: number;
  private type: ZoneType;
  private infrastructure: InfrastructureType[];
  private building: Building | null;
  private happiness: number;
  private pollution: number;
  private blockZoneId: string | null;
  private blockZoneX: number | null;
  private blockZoneY: number | null;

  constructor(x: number, y: number, type: ZoneType | null) {
    this.x = x;
    this.y = y;
    this.type = type || ZoneType.RESIDENTIAL; // Default to residential if null
    this.infrastructure = [];
    this.building = null;
    this.happiness = 50;
    this.pollution = 0;
    this.blockZoneId = null;
    this.blockZoneX = null;
    this.blockZoneY = null;
  }

  // Getters
  getX(): number { return this.x; }
  getY(): number { return this.y; }
  getType(): ZoneType | null { return this.type; }
  getInfrastructure(): InfrastructureType[] { return [...this.infrastructure]; }
  getBuilding(): Building | null { return this.building; }
  getHappiness(): number { return this.happiness; }
  getPollution(): number { return this.pollution; }

  // Setters
  setType(type: ZoneType | null): void { 
    this.type = type || ZoneType.RESIDENTIAL; 
  }
  
  setBuilding(building: Building | null): void { 
    this.building = building; 
  }
  
  setHappiness(happiness: number): void { 
    this.happiness = Math.max(0, Math.min(100, happiness)); 
  }
  
  setPollution(pollution: number): void { 
    this.pollution = Math.max(0, Math.min(100, pollution)); 
  }

  // Block zone getters and setters
  getBlockZoneId(): string | null { return this.blockZoneId; }
  getBlockZoneX(): number | null { return this.blockZoneX; }
  getBlockZoneY(): number | null { return this.blockZoneY; }
  isBlockZone(): boolean { return this.blockZoneId !== null; }

  setBlockZoneId(id: string | null): void { this.blockZoneId = id; }
  setBlockZoneX(x: number | null): void { this.blockZoneX = x; }
  setBlockZoneY(y: number | null): void { this.blockZoneY = y; }

  // Infrastructure management
  addInfrastructure(type: InfrastructureType): boolean {
    if (!this.infrastructure.includes(type)) {
      this.infrastructure.push(type);
      return true;
    }
    return false;
  }

  removeInfrastructure(type: InfrastructureType): void {
    this.infrastructure = this.infrastructure.filter(infra => infra !== type);
  }

  hasInfrastructure(type: InfrastructureType): boolean {
    return this.infrastructure.includes(type);
  }

  hasAllBasicInfrastructure(): boolean {
    return hasAllBasicInfrastructure(this.toZoneCell());
  }

  // Building management
  createBuilding(buildingId: string): Building | null {
    if (this.building) return null;
    
    if (this.shouldCreateBuilding()) {
      this.building = new Building(buildingId, this.x, this.y, this.type);
      return this.building;
    }
    
    return null;
  }

  upgradeBuilding(): boolean {
    if (!this.building || typeof this.building.upgrade !== 'function') return false;
    
    if (this.shouldUpgradeBuilding()) {
      return this.building.upgrade();
    }
    
    return false;
  }

  removeBuilding(): void {
    this.building = null;
  }

  // Growth logic
  shouldCreateBuilding(): boolean {
    // Need basic infrastructure
    if (!this.hasAllBasicInfrastructure()) return false;
    
    // Random chance based on infrastructure quality
    const baseChance = 0.3;
    const infrastructureBonus = this.infrastructure.length * 0.1;
    const happinessBonus = this.happiness / 200; // 0 to 0.5
    
    return Math.random() < (baseChance + infrastructureBonus + happinessBonus);
  }

  shouldUpgradeBuilding(): boolean {
    if (!this.building || typeof this.building.getSize !== 'function') return false;
    
    // Can't upgrade large buildings
    if (this.building.getSize() === BuildingSize.LARGE) return false;
    
    // Check upgrade conditions
    const hasGoodInfrastructure = this.hasAllBasicInfrastructure();
    const hasGoodHappiness = this.happiness > 60;
    
    if (hasGoodInfrastructure && hasGoodHappiness) {
      return Math.random() < 0.2; // 20% chance per turn
    }
    
    return false;
  }

  // Happiness and pollution calculation
  updateHappiness(neighboringBuildings: number, localPollution: number, nearbyJobs: number): void {
    let happiness = 60; // Base happiness

    // Infrastructure bonus
    if (this.hasAllBasicInfrastructure()) {
      happiness += 20;
    } else {
      happiness -= 10;
    }

    // Pollution penalty
    happiness -= localPollution;

    // Neighbor bonus
    happiness += Math.min(10, neighboringBuildings * 2);

    // Employment bonus (if residential)
    if (this.type === ZoneType.RESIDENTIAL) {
      happiness += Math.min(15, nearbyJobs);
    }

    this.happiness = Math.max(0, Math.min(100, happiness));
  }

  updatePollution(buildingPollution: number, nearbyIndustrialPollution: number): void {
    let pollution = 0;

    // Building pollution
    if (this.building && typeof this.building.getPollution === 'function') {
      pollution += this.building.getPollution();
    }

    // Nearby industrial pollution
    pollution += nearbyIndustrialPollution;

    this.pollution = Math.min(100, pollution);
  }

  // Utility methods
  toZoneCell(): ZoneCell {
    return {
      x: this.x,
      y: this.y,
      zoneType: this.type,
      infrastructure: [...this.infrastructure],
      building: this.building,
      happiness: this.happiness,
      pollution: this.pollution
    };
  }

  static fromZoneCell(cell: ZoneCell): Zone {
    const zone = new Zone(cell.x, cell.y, cell.zoneType);
    zone.infrastructure = [...cell.infrastructure];
    // Ensure building is a proper Building instance
    if (cell.building) {
      zone.building = Building.fromJSON(cell.building);
    } else {
      zone.building = null;
    }
    zone.happiness = cell.happiness;
    zone.pollution = cell.pollution;
    return zone;
  }
}
