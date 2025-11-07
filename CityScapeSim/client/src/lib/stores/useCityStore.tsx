import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GridCell, Tool, ZoneType, Building, InfrastructureType, BuildingType, BuildingSize } from "../gameEngine/types";

interface CityState {
  // Grid and city data
  grid: GridCell[][];
  buildings: Building[];
  
  // Game state
  isRunning: boolean;
  selectedTool: Tool;
  isBuilding: boolean;
  
  // Economic data
  money: number;
  population: number;
  happiness: number;
  pollution: number;
  taxRevenue: number;
  employmentRate: number;
  
  // Actions
  initializeGrid: () => void;
  toggleSimulation: () => void;
  setSelectedTool: (tool: Tool) => void;
  setBuilding: (building: boolean) => void;
  addZone: (x: number, y: number, zoneType: ZoneType) => void;
  addInfrastructure: (x: number, y: number, type: InfrastructureType) => void;
  addBuilding: (x: number, y: number, buildingType: Tool, cost: number) => void;
  updateCity: (newBuildings: Building[]) => void;
  updateEconomics: (economics: { money: number; population: number; taxRevenue: number; employmentRate: number }) => void;
  updateHappiness: (happiness: number) => void;
  updatePollution: (pollution: number) => void;
}

const GRID_WIDTH = 50;
const GRID_HEIGHT = 30;

export const useCityStore = create<CityState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    grid: [],
    buildings: [],
    isRunning: false,
    selectedTool: Tool.RESIDENTIAL,
    isBuilding: false,
    money: 10000,
    population: 0,
    happiness: 75,
    pollution: 10,
    taxRevenue: 0,
    employmentRate: 0,

    initializeGrid: () => {
      const newGrid: GridCell[][] = [];
      for (let y = 0; y < GRID_HEIGHT; y++) {
        newGrid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
          newGrid[y][x] = {
            x,
            y,
            zoneType: null,
            infrastructure: [],
            building: null,
            happiness: 50,
            pollution: 0
          };
        }
      }
      set({ grid: newGrid });
    },

    toggleSimulation: () => {
      set((state) => ({ isRunning: !state.isRunning }));
    },

    setSelectedTool: (tool) => {
      set({ selectedTool: tool });
    },

    setBuilding: (building) => {
      set({ isBuilding: building });
    },

    addZone: (x, y, zoneType) => {
      const { grid, money, selectedTool } = get();
      
      // Check bounds
      if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;
      
      const cell = grid[y][x];
      if (cell.zoneType === zoneType) return; // Already this zone type
      
      // Calculate cost
      const costs = {
        [Tool.RESIDENTIAL]: 100,
        [Tool.COMMERCIAL]: 150,
        [Tool.INDUSTRIAL]: 200
      };
      
      const cost = costs[selectedTool as keyof typeof costs] || 0;
      if (money < cost) return;

      // Update grid
      const newGrid = [...grid];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = {
        ...cell,
        zoneType
      };

      set({ 
        grid: newGrid, 
        money: money - cost 
      });
    },

    addZoneBlock: (x, y, zoneType) => {
      const { grid, money, selectedTool } = get();
      
      // Check bounds for 2x2 area
      if (x < 0 || x + 1 >= GRID_WIDTH || y < 0 || y + 1 >= GRID_HEIGHT) return;
      
      // Check if all 4 cells are available
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const cell = grid[y + dy][x + dx];
          if (cell.zoneType !== null) return; // One or more cells already have zones
        }
      }
      
      // Calculate cost for 2x2 block
      const costs = {
        [Tool.RESIDENTIAL_2X2]: 400,
        [Tool.COMMERCIAL_2X2]: 600,
        [Tool.INDUSTRIAL_2X2]: 800
      };
      
      const cost = costs[selectedTool as keyof typeof costs] || 0;
      if (money < cost) return;

      // Create 2x2 zone block
      const newGrid = [...grid];
      const blockId = `zone_block_${Date.now()}_${x}_${y}`;
      
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          newGrid[y + dy] = [...newGrid[y + dy]];
          newGrid[y + dy][x + dx] = {
            ...newGrid[y + dy][x + dx],
            zoneType,
            isBlockZone: true,
            blockZoneId: blockId,
            blockZoneX: x,
            blockZoneY: y
          };
        }
      }

      set({ 
        grid: newGrid, 
        money: money - cost 
      });
    },

    addInfrastructure: (x, y, type) => {
      const { grid, money } = get();
      
      // Check bounds
      if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;
      
      const cell = grid[y][x];
      if (cell.infrastructure.includes(type)) return; // Already has this infrastructure
      
      // Calculate cost
      const costs = {
        road: 10,
        power: 20,
        water: 15
      };
      
      const cost = costs[type] || 0;
      if (money < cost) return;

      // Update grid
      const newGrid = [...grid];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = {
        ...cell,
        infrastructure: [...cell.infrastructure, type]
      };

      set({ 
        grid: newGrid, 
        money: money - cost 
      });
    },

    addBuilding: (x, y, buildingType, cost) => {
      const { grid, money } = get();
      
      // Check bounds
      if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;
      
      const cell = grid[y][x];
      if (cell.building) return; // Already has a building
      if (money < cost) return;
      
      // Determine zone type and building details
      const getBuildingInfo = (type: Tool) => {
        switch (type) {
          case Tool.HOUSE:
            return { zone: ZoneType.RESIDENTIAL, buildingType: BuildingType.HOUSE, size: BuildingSize.SMALL, population: 8, jobs: 0, pollution: 1 };
          case Tool.APARTMENT:
            return { zone: ZoneType.RESIDENTIAL, buildingType: BuildingType.APARTMENT, size: BuildingSize.MEDIUM, population: 20, jobs: 0, pollution: 2 };
          case Tool.VILLA:
            return { zone: ZoneType.RESIDENTIAL, buildingType: BuildingType.VILLA, size: BuildingSize.LARGE, population: 4, jobs: 0, pollution: 1 };
          case Tool.SHOP:
            return { zone: ZoneType.COMMERCIAL, buildingType: BuildingType.SHOP, size: BuildingSize.SMALL, population: 0, jobs: 12, pollution: 2 };
          case Tool.OFFICE:
            return { zone: ZoneType.COMMERCIAL, buildingType: BuildingType.OFFICE, size: BuildingSize.MEDIUM, population: 0, jobs: 25, pollution: 1 };
          case Tool.MALL:
            return { zone: ZoneType.COMMERCIAL, buildingType: BuildingType.MALL, size: BuildingSize.LARGE, population: 0, jobs: 50, pollution: 3 };
          case Tool.FACTORY:
            return { zone: ZoneType.INDUSTRIAL, buildingType: BuildingType.FACTORY, size: BuildingSize.MEDIUM, population: 0, jobs: 35, pollution: 15 };
          case Tool.WAREHOUSE:
            return { zone: ZoneType.INDUSTRIAL, buildingType: BuildingType.WAREHOUSE, size: BuildingSize.SMALL, population: 0, jobs: 15, pollution: 5 };
          case Tool.POWERPLANT:
            return { zone: ZoneType.INDUSTRIAL, buildingType: BuildingType.POWERPLANT, size: BuildingSize.LARGE, population: 0, jobs: 20, pollution: 25 };
          case Tool.HOSPITAL:
            return { zone: null, buildingType: BuildingType.HOSPITAL, size: BuildingSize.LARGE, population: 0, jobs: 30, pollution: 2, happiness: 0, serviceRange: 8 };
          case Tool.SCHOOL:
            return { zone: null, buildingType: BuildingType.SCHOOL, size: BuildingSize.MEDIUM, population: 0, jobs: 15, pollution: 1, happiness: 0, serviceRange: 5 };
          case Tool.POLICE:
            return { zone: ZoneType.COMMERCIAL, buildingType: BuildingType.POLICE, size: BuildingSize.SMALL, population: 0, jobs: 10, pollution: 1, happiness: 10, serviceRange: 10 };
          case Tool.PARK:
            return { zone: null, buildingType: BuildingType.PARK, size: BuildingSize.SMALL, population: 0, jobs: 2, pollution: -2, happiness: 0, serviceRange: 3 };
          default:
            return null;
        }
      };
      
      const buildingInfo = getBuildingInfo(buildingType);
      if (!buildingInfo) return;
      
      const newBuilding: Building = {
        id: `building_${Date.now()}_${x}_${y}`,
        x,
        y,
        type: buildingInfo.zone,
        buildingType: buildingInfo.buildingType,
        size: buildingInfo.size,
        population: buildingInfo.population,
        jobs: buildingInfo.jobs,
        pollution: buildingInfo.pollution,
        happiness: buildingInfo.happiness,
        serviceRange: buildingInfo.serviceRange
      };
      
      // Update grid
      const newGrid = [...grid];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = {
        ...cell,
        zoneType: buildingInfo.zone || cell.zoneType, // Keep existing zone type for service buildings
        building: newBuilding
      };

      set({ 
        grid: newGrid, 
        money: money - cost 
      });
    },

    updateCity: (newBuildings) => {
      set({ buildings: newBuildings });
    },

    updateEconomics: (economics) => {
      set((state) => ({
        money: state.money + economics.taxRevenue,
        population: economics.population,
        taxRevenue: economics.taxRevenue,
        employmentRate: economics.employmentRate
      }));
    },

    updateHappiness: (happiness) => {
      set({ happiness: Math.max(0, Math.min(100, happiness)) });
    },

    updatePollution: (pollution) => {
      set({ pollution: Math.max(0, Math.min(100, pollution)) });
    }
  }))
);

// Initialize grid on store creation
useCityStore.getState().initializeGrid();
