import { Building as BuildingType, ZoneType, BuildingSize, BuildingType as BuildingTypeEnum } from "../types";

export class Building {
  private id: string;
  private x: number;
  private y: number;
  private type: ZoneType;
  private buildingType?: BuildingTypeEnum;
  private size: BuildingSize;
  private population: number;
  private jobs: number;
  private pollution: number;
  private happiness: number;
  private serviceRange: number;
  private isBlock: boolean;
  private blockWidth: number;
  private blockHeight: number;

  constructor(
    id: string,
    x: number,
    y: number,
    type: ZoneType,
    size: BuildingSize = BuildingSize.SMALL,
    buildingType?: BuildingTypeEnum,
    isBlock: boolean = false,
    blockWidth: number = 1,
    blockHeight: number = 1
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = size;
    this.buildingType = buildingType;
    this.population = 0;
    this.jobs = 0;
    this.pollution = 0;
    this.happiness = 50;
    this.serviceRange = 3;
    this.isBlock = isBlock;
    this.blockWidth = blockWidth;
    this.blockHeight = blockHeight;
    
    this.calculateStats();
  }

  // Getters
  getId(): string { return this.id; }
  getX(): number { return this.x; }
  getY(): number { return this.y; }
  getType(): ZoneType { return this.type; }
  getBuildingType(): BuildingTypeEnum | undefined { return this.buildingType; }
  getSize(): BuildingSize { return this.size; }
  getPopulation(): number { return this.population; }
  getJobs(): number { return this.jobs; }
  getPollution(): number { return this.pollution; }
  getHappiness(): number { return this.happiness; }
  getServiceRange(): number { return this.serviceRange; }
  getIsBlock(): boolean { return this.isBlock; }
  getBlockWidth(): number { return this.blockWidth; }
  getBlockHeight(): number { return this.blockHeight; }

  // Setters
  setHappiness(happiness: number): void {
    this.happiness = Math.max(0, Math.min(100, happiness));
  }

  setPopulation(population: number): void {
    this.population = Math.max(0, population);
  }

  setJobs(jobs: number): void {
    this.jobs = Math.max(0, jobs);
  }

  setPollution(pollution: number): void {
    this.pollution = Math.max(0, pollution);
  }

  // Building operations
  upgrade(): boolean {
    if (this.size === BuildingSize.LARGE) return false;
    
    if (this.size === BuildingSize.SMALL) {
      this.size = BuildingSize.MEDIUM;
    } else if (this.size === BuildingSize.MEDIUM) {
      this.size = BuildingSize.LARGE;
    }
    
    this.calculateStats();
    return true;
  }

  private calculateStats(): void {
    const sizeMultiplier = {
      [BuildingSize.SMALL]: 1,
      [BuildingSize.MEDIUM]: 2,
      [BuildingSize.LARGE]: 4,
      [BuildingSize.BLOCK_2X2]: 6 // 2x2 blocks are more efficient than large buildings
    }[this.size];

    // Handle 2x2 block buildings
    if (this.isBlock) {
      this.calculateBlockBuildingStats(sizeMultiplier);
      return;
    }

    // Handle service buildings
    if (this.buildingType) {
      this.calculateServiceBuildingStats(sizeMultiplier);
      return;
    }

    // Handle zone-based buildings
    switch (this.type) {
      case ZoneType.RESIDENTIAL:
        this.population = Math.floor(5 * sizeMultiplier + Math.random() * 5);
        this.jobs = 0;
        this.pollution = 1 * sizeMultiplier;
        break;
        
      case ZoneType.COMMERCIAL:
        this.population = 0;
        this.jobs = Math.floor(8 * sizeMultiplier + Math.random() * 4);
        this.pollution = 2 * sizeMultiplier;
        break;
        
      case ZoneType.INDUSTRIAL:
        this.population = 0;
        this.jobs = Math.floor(12 * sizeMultiplier + Math.random() * 8);
        this.pollution = 8 * sizeMultiplier;
        break;
    }
  }

  private calculateBlockBuildingStats(sizeMultiplier: number): void {
    // 2x2 block buildings have enhanced stats
    const blockMultiplier = this.blockWidth * this.blockHeight; // 4 for 2x2 blocks
    
    switch (this.buildingType) {
      case BuildingTypeEnum.RESIDENTIAL_BLOCK:
        this.population = Math.floor(8 * sizeMultiplier * blockMultiplier + Math.random() * 8);
        this.jobs = 0;
        this.pollution = 1 * sizeMultiplier;
        break;
        
      case BuildingTypeEnum.COMMERCIAL_BLOCK:
        this.population = 0;
        this.jobs = Math.floor(12 * sizeMultiplier * blockMultiplier + Math.random() * 8);
        this.pollution = 2 * sizeMultiplier;
        break;
        
      case BuildingTypeEnum.INDUSTRIAL_BLOCK:
        this.population = 0;
        this.jobs = Math.floor(18 * sizeMultiplier * blockMultiplier + Math.random() * 12);
        this.pollution = 10 * sizeMultiplier;
        break;
        
      default:
        // Fallback for other block types
        this.population = Math.floor(6 * sizeMultiplier * blockMultiplier);
        this.jobs = Math.floor(10 * sizeMultiplier * blockMultiplier);
        this.pollution = 3 * sizeMultiplier;
        break;
    }
  }

  private calculateServiceBuildingStats(sizeMultiplier: number): void {
    switch (this.buildingType) {
      case BuildingTypeEnum.PARK:
        this.population = 0;
        this.jobs = Math.floor(2 * sizeMultiplier); // Park maintenance jobs
        this.pollution = -2 * sizeMultiplier; // Parks reduce pollution
        this.serviceRange = 3; // 3x3 radius effect
        break;
        
      case BuildingTypeEnum.SCHOOL:
        this.population = 0;
        this.jobs = Math.floor(5 * sizeMultiplier); // Teachers and staff
        this.pollution = 1 * sizeMultiplier;
        this.serviceRange = 5; // Serves nearby residential areas
        break;
        
      case BuildingTypeEnum.HOSPITAL:
        this.population = 0;
        this.jobs = Math.floor(8 * sizeMultiplier); // Medical staff
        this.pollution = 2 * sizeMultiplier;
        this.serviceRange = 8; // City-wide health service
        break;
        
      case BuildingTypeEnum.POWERPLANT:
        this.population = 0;
        this.jobs = Math.floor(6 * sizeMultiplier); // Power plant workers
        this.pollution = 15 * sizeMultiplier; // High pollution
        this.serviceRange = 10; // Large power generation range
        break;
        
      default:
        // Fallback for other building types
        this.population = 0;
        this.jobs = Math.floor(3 * sizeMultiplier);
        this.pollution = 1 * sizeMultiplier;
        this.serviceRange = 3;
        break;
    }
  }

  // Tax calculation
  calculateTax(): number {
    const sizeMultiplier = {
      [BuildingSize.SMALL]: 1,
      [BuildingSize.MEDIUM]: 3,
      [BuildingSize.LARGE]: 8,
      [BuildingSize.BLOCK_2X2]: 12
    }[this.size];

    // Service buildings don't generate tax revenue
    if (this.buildingType) {
      return 0;
    }

    const baseTax = {
      [ZoneType.RESIDENTIAL]: 20,
      [ZoneType.COMMERCIAL]: 50,
      [ZoneType.INDUSTRIAL]: 30
    }[this.type];

    return baseTax * (sizeMultiplier || 1);
  }

  // Get building construction cost
  getConstructionCost(): number {
    if (this.buildingType) {
      const baseCosts: Record<BuildingTypeEnum, number> = {
        [BuildingTypeEnum.PARK]: 500,
        [BuildingTypeEnum.SCHOOL]: 2000,
        [BuildingTypeEnum.HOSPITAL]: 3000,
        [BuildingTypeEnum.POWERPLANT]: 5000,
        [BuildingTypeEnum.RESIDENTIAL_BLOCK]: 800,
        [BuildingTypeEnum.COMMERCIAL_BLOCK]: 1200,
        [BuildingTypeEnum.INDUSTRIAL_BLOCK]: 1600,
        [BuildingTypeEnum.HOUSE]: 200,
        [BuildingTypeEnum.APARTMENT]: 350,
        [BuildingTypeEnum.VILLA]: 500,
        [BuildingTypeEnum.SHOP]: 300,
        [BuildingTypeEnum.OFFICE]: 450,
        [BuildingTypeEnum.MALL]: 800,
        [BuildingTypeEnum.FACTORY]: 600,
        [BuildingTypeEnum.WAREHOUSE]: 400,
        [BuildingTypeEnum.POLICE]: 500
      };
      return baseCosts[this.buildingType] || 1000;
    }

    // Zone-based building costs
    const baseCosts = {
      [ZoneType.RESIDENTIAL]: 200,
      [ZoneType.COMMERCIAL]: 300,
      [ZoneType.INDUSTRIAL]: 400
    };
    
    const sizeMultiplier = {
      [BuildingSize.SMALL]: 1,
      [BuildingSize.MEDIUM]: 1.5,
      [BuildingSize.LARGE]: 2.5,
      [BuildingSize.BLOCK_2X2]: 3.5 // 2x2 blocks cost more but are more efficient
    }[this.size];

    return Math.floor((baseCosts[this.type] || 200) * sizeMultiplier);
  }

  // Get building maintenance cost
  getMaintenanceCost(): number {
    if (this.buildingType) {
      const baseMaintenance: Record<BuildingTypeEnum, number> = {
        [BuildingTypeEnum.PARK]: 25,
        [BuildingTypeEnum.SCHOOL]: 100,
        [BuildingTypeEnum.HOSPITAL]: 150,
        [BuildingTypeEnum.POWERPLANT]: 200,
        [BuildingTypeEnum.RESIDENTIAL_BLOCK]: 40,
        [BuildingTypeEnum.COMMERCIAL_BLOCK]: 60,
        [BuildingTypeEnum.INDUSTRIAL_BLOCK]: 80,
        [BuildingTypeEnum.HOUSE]: 10,
        [BuildingTypeEnum.APARTMENT]: 15,
        [BuildingTypeEnum.VILLA]: 20,
        [BuildingTypeEnum.SHOP]: 15,
        [BuildingTypeEnum.OFFICE]: 20,
        [BuildingTypeEnum.MALL]: 30,
        [BuildingTypeEnum.FACTORY]: 25,
        [BuildingTypeEnum.WAREHOUSE]: 20,
        [BuildingTypeEnum.POLICE]: 30
      };
      return baseMaintenance[this.buildingType] || 50;
    }

    // Zone-based building maintenance
    const baseMaintenance = {
      [ZoneType.RESIDENTIAL]: 10,
      [ZoneType.COMMERCIAL]: 15,
      [ZoneType.INDUSTRIAL]: 20
    };
    
    const sizeMultiplier = {
      [BuildingSize.SMALL]: 1,
      [BuildingSize.MEDIUM]: 2,
      [BuildingSize.LARGE]: 4,
      [BuildingSize.BLOCK_2X2]: 5 // 2x2 blocks have higher maintenance
    }[this.size];

    return Math.floor((baseMaintenance[this.type] || 10) * sizeMultiplier);
  }

  // Check if this is a service building
  isServiceBuilding(): boolean {
    return this.buildingType !== undefined;
  }

  // Get service building type
  getServiceType(): BuildingTypeEnum | null {
    return this.buildingType || null;
  }

  // Check if building requires power
  requiresPower(): boolean {
    // All buildings except power plants require power
    return this.buildingType !== BuildingTypeEnum.POWERPLANT;
  }

  // Get building power demand
  getPowerDemand(): number {
    if (!this.requiresPower()) return 0;
    
    const baseDemand = 10;
    const sizeMultiplier = {
      [BuildingSize.SMALL]: 1,
      [BuildingSize.MEDIUM]: 2,
      [BuildingSize.LARGE]: 4,
      [BuildingSize.BLOCK_2X2]: 6
    }[this.size];

    // Service buildings have higher power demand
    if (this.isServiceBuilding()) {
      return baseDemand * sizeMultiplier * 2;
    }

    // Block buildings have higher power demand
    if (this.getIsBlock()) {
      return baseDemand * sizeMultiplier * 1.5;
    }

    return baseDemand * sizeMultiplier;
  }

  // Check if building is powered
  isPowered(hasPower: boolean): boolean {
    if (!this.requiresPower()) return true; // Power plants don't need power
    return hasPower;
  }

  // Get building efficiency based on power status
  getEfficiency(hasPower: boolean): number {
    if (!this.requiresPower()) return 1.0; // Power plants always at 100%
    return hasPower ? 1.0 : 0.3; // Unpowered buildings operate at 30% efficiency
  }

  // Check if building requires road access
  requiresRoad(): boolean {
    // All buildings except some service buildings require road access
    return this.buildingType !== BuildingTypeEnum.PARK; // Parks don't need roads
  }

  // Check if building requires water
  requiresWater(): boolean {
    // All buildings except power plants require water
    return this.buildingType !== BuildingTypeEnum.POWERPLANT;
  }

  // Get building connectivity status
  getConnectivityStatus(hasRoad: boolean, hasPower: boolean, hasWater: boolean): 'bright' | 'dim' | 'dark' {
    const roadRequired = this.requiresRoad();
    const powerRequired = this.requiresPower();
    const waterRequired = this.requiresWater();

    const roadOk = !roadRequired || hasRoad;
    const powerOk = !powerRequired || hasPower;
    const waterOk = !waterRequired || hasWater;

    const connectedCount = [roadOk, powerOk, waterOk].filter(Boolean).length;
    const totalRequired = [roadRequired, powerRequired, waterRequired].filter(Boolean).length;

    if (connectedCount === totalRequired) {
      return 'bright'; // All required infrastructure connected
    } else if (connectedCount >= totalRequired * 0.5) {
      return 'dim'; // Partially connected
    } else {
      return 'dark'; // Poorly connected
    }
  }

  // Get building efficiency based on all infrastructure connections
  getInfrastructureEfficiency(hasRoad: boolean, hasPower: boolean, hasWater: boolean): number {
    const roadRequired = this.requiresRoad();
    const powerRequired = this.requiresPower();
    const waterRequired = this.requiresWater();

    const roadOk = !roadRequired || hasRoad;
    const powerOk = !powerRequired || hasPower;
    const waterOk = !waterRequired || hasWater;

    const connectedCount = [roadOk, powerOk, waterOk].filter(Boolean).length;
    const totalRequired = [roadRequired, powerRequired, waterRequired].filter(Boolean).length;

    if (totalRequired === 0) return 1.0; // No infrastructure required

    let baseEfficiency = connectedCount / totalRequired;
    
    // Apply penalties for missing critical infrastructure
    if (!roadOk && roadRequired) baseEfficiency *= 0.2; // 80% penalty for no road
    if (!powerOk && powerRequired) baseEfficiency *= 0.3; // 70% penalty for no power
    if (!waterOk && waterRequired) baseEfficiency *= 0.4; // 60% penalty for no water

    return Math.max(0.1, baseEfficiency); // Minimum 10% efficiency
  }

  // Get infrastructure requirements summary
  getInfrastructureRequirements(): { road: boolean; power: boolean; water: boolean } {
    return {
      road: this.requiresRoad(),
      power: this.requiresPower(),
      water: this.requiresWater()
    };
  }

  // Serialization
  toJSON(): BuildingType {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      type: this.type,
      buildingType: this.buildingType,
      size: this.size,
      population: this.population,
      jobs: this.jobs,
      pollution: this.pollution,
      happiness: this.happiness,
      serviceRange: this.serviceRange,
      isBlock: this.isBlock,
      blockWidth: this.blockWidth,
      blockHeight: this.blockHeight
    };
  }

  static fromJSON(data: BuildingType): Building {
    const building = new Building(
      data.id, 
      data.x, 
      data.y, 
      data.type, 
      data.size, 
      data.buildingType,
      data.isBlock || false,
      data.blockWidth || 1,
      data.blockHeight || 1
    );
    building.setPopulation(data.population || 0);
    building.setJobs(data.jobs || 0);
    building.setPollution(data.pollution || 0);
    building.setHappiness(data.happiness || 50);
    // Note: serviceRange is a public property, so direct assignment is fine
    building.serviceRange = data.serviceRange || 3;
    return building;
  }
}
