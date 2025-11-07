import { GridCell, ZoneType, Building, BuildingSize, BuildingType } from "./types";

export const GRID_WIDTH = 50;
export const GRID_HEIGHT = 30;

export const getZoneColor = (zoneType: ZoneType | null): string => {
  switch (zoneType) {
    case ZoneType.RESIDENTIAL:
      return '#10B981'; // Green
    case ZoneType.COMMERCIAL:
      return '#3B82F6'; // Blue
    case ZoneType.INDUSTRIAL:
      return '#6B7280'; // Gray
    default:
      return '#1F2937'; // Dark gray
  }
};

export const getBuildingColor = (building: Building): string => {
  // Handle specific building types with unique colors
  if (building.buildingType) {
    switch (building.buildingType) {
      case BuildingType.HOUSE:
        return '#10B981'; // Green
      case BuildingType.APARTMENT:
        return '#059669'; // Dark green
      case BuildingType.VILLA:
        return '#34D399'; // Light green
      case BuildingType.SHOP:
        return '#60A5FA'; // Light blue
      case BuildingType.OFFICE:
        return '#3B82F6'; // Blue
      case BuildingType.MALL:
        return '#2563EB'; // Dark blue
      case BuildingType.FACTORY:
        return '#6B7280'; // Gray
      case BuildingType.WAREHOUSE:
        return '#9CA3AF'; // Light gray
      case BuildingType.POWERPLANT:
        return '#F59E0B'; // Orange
      case BuildingType.HOSPITAL:
        return '#EF4444'; // Red
      case BuildingType.SCHOOL:
        return '#8B5CF6'; // Purple
      case BuildingType.POLICE:
        return '#1E40AF'; // Dark blue
      case BuildingType.PARK:
        return '#16A34A'; // Forest green
    }
  }
  
  // Fallback to zone-based colors
  const baseColors = {
    [ZoneType.RESIDENTIAL]: ['#34D399', '#10B981', '#059669'], // Light to dark green
    [ZoneType.COMMERCIAL]: ['#60A5FA', '#3B82F6', '#2563EB'], // Light to dark blue
    [ZoneType.INDUSTRIAL]: ['#9CA3AF', '#6B7280', '#4B5563']   // Light to dark gray
  };
  
  const colors = baseColors[building.type];
  switch (building.size) {
    case BuildingSize.SMALL:
      return colors[0];
    case BuildingSize.MEDIUM:
      return colors[1];
    case BuildingSize.LARGE:
      return colors[2];
    default:
      return colors[0];
  }
};

export const getInfrastructureColor = (type: string): string => {
  switch (type) {
    case 'road':
      return '#78716C'; // Brown
    case 'power':
      return '#FCD34D'; // Yellow
    case 'water':
      return '#06B6D4'; // Cyan
    default:
      return '#374151';
  }
};

export const hasInfrastructure = (cell: GridCell, type: string): boolean => {
  return cell.infrastructure.includes(type as any);
};

export const hasAllBasicInfrastructure = (cell: GridCell): boolean => {
  return hasInfrastructure(cell, 'road') && 
         hasInfrastructure(cell, 'power') && 
         hasInfrastructure(cell, 'water');
};

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const getNeighbors = (x: number, y: number): Array<{x: number, y: number}> => {
  const neighbors = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }
  return neighbors;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export interface RoadConnections {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export const getRoadConnections = (x: number, y: number, grid: GridCell[][]): RoadConnections => {
  return {
    north: y > 0 && hasInfrastructure(grid[y - 1][x], 'road'),
    south: y < GRID_HEIGHT - 1 && hasInfrastructure(grid[y + 1][x], 'road'),
    east: x < GRID_WIDTH - 1 && hasInfrastructure(grid[y][x + 1], 'road'),
    west: x > 0 && hasInfrastructure(grid[y][x - 1], 'road')
  };
};
