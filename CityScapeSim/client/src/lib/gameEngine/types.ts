export enum ZoneType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial'
}

export enum Tool {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  RESIDENTIAL_2X2 = 'residential_2x2',
  COMMERCIAL_2X2 = 'commercial_2x2',
  INDUSTRIAL_2X2 = 'industrial_2x2',
  ROAD = 'road',
  POWER = 'power',
  WATER = 'water',
  HOUSE = 'house',
  APARTMENT = 'apartment',
  VILLA = 'villa',
  SHOP = 'shop',
  OFFICE = 'office',
  MALL = 'mall',
  FACTORY = 'factory',
  WAREHOUSE = 'warehouse',
  POWERPLANT = 'powerplant',
  HOSPITAL = 'hospital',
  SCHOOL = 'school',
  POLICE = 'police',
  PARK = 'park'
}

export type InfrastructureType = 'road' | 'power' | 'water';

export enum BuildingSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  BLOCK_2X2 = 'block_2x2'
}

export enum BuildingType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  VILLA = 'villa',
  SHOP = 'shop',
  OFFICE = 'office',
  MALL = 'mall',
  FACTORY = 'factory',
  WAREHOUSE = 'warehouse',
  POWERPLANT = 'powerplant',
  HOSPITAL = 'hospital',
  SCHOOL = 'school',
  POLICE = 'police',
  PARK = 'park',
  // 2x2 Block Buildings
  RESIDENTIAL_BLOCK = 'residential_block',
  COMMERCIAL_BLOCK = 'commercial_block',
  INDUSTRIAL_BLOCK = 'industrial_block'
}

export interface Building {
  id: string;
  x: number;
  y: number;
  type: ZoneType;
  buildingType?: BuildingType;
  size: BuildingSize;
  population?: number;
  jobs?: number;
  pollution?: number;
  happiness?: number;
  serviceRange?: number;
  // 2x2 Block properties
  isBlock?: boolean;
  blockWidth?: number;
  blockHeight?: number;
}

export interface GridCell {
  x: number;
  y: number;
  zoneType: ZoneType | null;
  infrastructure: InfrastructureType[];
  building: Building | null;
  happiness: number;
  pollution: number;
  // 2x2 Zone properties
  isBlockZone?: boolean;
  blockZoneId?: string;
  blockZoneX?: number;
  blockZoneY?: number;
  // Power grid properties
  hasPower?: boolean;
  powerSource?: string | null;
  powerCapacity?: number;
  powerDemand?: number;
  // Infrastructure connectivity properties
  hasRoad?: boolean;
  hasWater?: boolean;
  connectivityStatus?: 'bright' | 'dim' | 'dark';
  connectivityEfficiency?: number;
}

export interface SimulationUpdate {
  buildings: Building[];
  economics: {
    money: number;
    population: number;
    taxRevenue: number;
    employmentRate: number;
  };
  happiness: number;
  pollution: number;
  powerGrid?: {
    totalCapacity: number;
    totalDemand: number;
    efficiency: number;
    isOverloaded: boolean;
    shortageAreas: number;
  };
  connectivity?: {
    totalBuildings: number;
    fullyConnected: number;
    partiallyConnected: number;
    poorlyConnected: number;
    averageEfficiency: number;
    roadCoverage: number;
    powerCoverage: number;
    waterCoverage: number;
  };
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface ZoneBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zoneType: ZoneType;
  cells: GridCell[];
  building: Building | null;
  happiness: number;
  pollution: number;
}

export enum PowerSourceType {
  POWERPLANT = 'powerplant',
  SOLAR = 'solar',
  WIND = 'wind',
  NUCLEAR = 'nuclear'
}

export interface PowerNode {
  id: string;
  x: number;
  y: number;
  type: 'source' | 'consumer' | 'transformer';
  capacity: number;
  demand: number;
  connected: boolean;
  powerSource?: string;
}

export interface PowerGrid {
  nodes: PowerNode[];
  connections: PowerConnection[];
  totalCapacity: number;
  totalDemand: number;
  efficiency: number;
}

export interface PowerConnection {
  from: string;
  to: string;
  capacity: number;
  distance: number;
  efficiency: number;
}
