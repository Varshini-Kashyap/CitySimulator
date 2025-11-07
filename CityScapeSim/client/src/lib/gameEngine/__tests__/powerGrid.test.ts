import { PowerGridManager } from '../modules/PowerGridManager';
import { Building } from '../modules/Building';
import { GridCell, BuildingType, BuildingSize, ZoneType } from '../types';

// Mock grid cell factory
const createMockCell = (hasRoad: boolean = false, hasPower: boolean = false, hasBuilding: boolean = false, buildingType?: BuildingType): GridCell => ({
  x: 0,
  y: 0,
  zoneType: null,
  infrastructure: [
    ...(hasRoad ? ['road'] : []),
    ...(hasPower ? ['power'] : [])
  ],
  building: hasBuilding ? {
    id: 'test-building',
    x: 0,
    y: 0,
    type: buildingType || BuildingType.HOUSE,
    size: BuildingSize.SMALL,
    happiness: 50,
    pollution: 0,
    population: 10,
    jobs: 0,
    level: 1,
    lastUpgrade: 0,
    isBlock: false,
    blockWidth: 1,
    blockHeight: 1
  } : null,
  happiness: 50,
  pollution: 0,
  hasPower: false,
  powerSource: null,
  powerCapacity: 0,
  powerDemand: 0
});

// Mock grid factory
const createMockGrid = (width: number, height: number, pattern: any[][]): GridCell[][] => {
  const grid: GridCell[][] = [];
  
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      const cellData = pattern[y][x];
      grid[y][x] = {
        ...createMockCell(
          cellData.hasRoad || false,
          cellData.hasPower || false,
          cellData.hasBuilding || false,
          cellData.buildingType
        ),
        x,
        y
      };
    }
  }
  
  return grid;
};

describe('Power Grid System', () => {
  describe('PowerGridManager', () => {
    it('should calculate power distribution for a simple grid', () => {
      const grid = createMockGrid(3, 3, [
        [
          { hasBuilding: true, buildingType: BuildingType.POWERPLANT, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ],
        [
          { hasPower: true },
          { hasPower: true },
          { hasPower: true }
        ],
        [
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ]
      ]);

      const powerGrid = PowerGridManager.calculatePowerDistribution(grid);
      
      expect(powerGrid.totalCapacity).toBeGreaterThan(0);
      expect(powerGrid.totalDemand).toBeGreaterThan(0);
      expect(powerGrid.efficiency).toBeGreaterThanOrEqual(0);
      expect(powerGrid.efficiency).toBeLessThanOrEqual(1);
    });

    it('should identify power sources correctly', () => {
      const grid = createMockGrid(2, 2, [
        [
          { hasBuilding: true, buildingType: BuildingType.POWERPLANT, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ],
        [
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ]
      ]);

      const powerGrid = PowerGridManager.calculatePowerDistribution(grid);
      
      const powerSources = powerGrid.nodes.filter(node => node.type === 'source');
      expect(powerSources).toHaveLength(1);
      expect(powerSources[0].capacity).toBeGreaterThan(0);
    });

    it('should identify power consumers correctly', () => {
      const grid = createMockGrid(2, 2, [
        [
          { hasBuilding: true, buildingType: BuildingType.POWERPLANT, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ],
        [
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ]
      ]);

      const powerGrid = PowerGridManager.calculatePowerDistribution(grid);
      
      const consumers = powerGrid.nodes.filter(node => node.type === 'consumer');
      expect(consumers).toHaveLength(3); // 3 houses
      expect(consumers.every(consumer => consumer.demand > 0)).toBe(true);
    });

    it('should handle power shortage scenarios', () => {
      const grid = createMockGrid(3, 3, [
        [
          { hasBuilding: true, buildingType: BuildingType.POWERPLANT, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ],
        [
          { hasPower: true },
          { hasPower: true },
          { hasPower: true }
        ],
        [
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ]
      ]);

      const powerGrid = PowerGridManager.calculatePowerDistribution(grid);
      
      // With many buildings and one power plant, there might be shortages
      const shortageAreas = PowerGridManager.getPowerShortageAreas(powerGrid);
      expect(Array.isArray(shortageAreas)).toBe(true);
    });

    it('should detect power grid overload', () => {
      const grid = createMockGrid(2, 2, [
        [
          { hasBuilding: true, buildingType: BuildingType.POWERPLANT, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ],
        [
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ]
      ]);

      const powerGrid = PowerGridManager.calculatePowerDistribution(grid);
      
      const isOverloaded = PowerGridManager.isPowerGridOverloaded(powerGrid);
      expect(typeof isOverloaded).toBe('boolean');
    });

    it('should update grid power status', () => {
      const grid = createMockGrid(2, 2, [
        [
          { hasBuilding: true, buildingType: BuildingType.POWERPLANT, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ],
        [
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ]
      ]);

      const powerGrid = PowerGridManager.calculatePowerDistribution(grid);
      PowerGridManager.updateGridPowerStatus(grid, powerGrid);
      
      // Check that power status was updated
      expect(grid[0][0].hasPower).toBeDefined();
      expect(grid[0][1].hasPower).toBeDefined();
    });
  });

  describe('Building Power Requirements', () => {
    it('should identify power plant as power source', () => {
      const powerPlant = new Building(
        'test-power-plant',
        0,
        0,
        BuildingType.POWERPLANT,
        BuildingSize.LARGE
      );
      
      expect(powerPlant.requiresPower()).toBe(false);
      expect(powerPlant.getPowerDemand()).toBe(0);
    });

    it('should identify regular buildings as power consumers', () => {
      const house = new Building(
        'test-house',
        0,
        0,
        BuildingType.HOUSE,
        BuildingSize.SMALL
      );
      
      expect(house.requiresPower()).toBe(true);
      expect(house.getPowerDemand()).toBeGreaterThan(0);
    });

    it('should calculate different power demands for different building sizes', () => {
      const smallHouse = new Building(
        'test-small-house',
        0,
        0,
        BuildingType.HOUSE,
        BuildingSize.SMALL
      );
      
      const largeHouse = new Building(
        'test-large-house',
        0,
        0,
        BuildingType.HOUSE,
        BuildingSize.LARGE
      );
      
      expect(largeHouse.getPowerDemand()).toBeGreaterThan(smallHouse.getPowerDemand());
    });

    it('should calculate building efficiency based on power status', () => {
      const house = new Building(
        'test-house',
        0,
        0,
        BuildingType.HOUSE,
        BuildingSize.SMALL
      );
      
      expect(house.getEfficiency(true)).toBe(1.0); // Powered
      expect(house.getEfficiency(false)).toBe(0.3); // Unpowered
    });

    it('should handle service building power requirements', () => {
      const hospital = new Building(
        'test-hospital',
        0,
        0,
        BuildingType.HOSPITAL,
        BuildingSize.LARGE
      );
      
      expect(hospital.requiresPower()).toBe(true);
      expect(hospital.getPowerDemand()).toBeGreaterThan(0);
      expect(hospital.isServiceBuilding()).toBe(true);
    });
  });

  describe('Power Grid Integration', () => {
    it('should handle empty grid', () => {
      const emptyGrid = createMockGrid(0, 0, []);
      
      expect(() => PowerGridManager.calculatePowerDistribution(emptyGrid)).not.toThrow();
    });

    it('should handle grid with no power infrastructure', () => {
      const grid = createMockGrid(2, 2, [
        [
          { hasBuilding: true, buildingType: BuildingType.HOUSE },
          { hasBuilding: true, buildingType: BuildingType.HOUSE }
        ],
        [
          { hasBuilding: true, buildingType: BuildingType.HOUSE },
          { hasBuilding: true, buildingType: BuildingType.HOUSE }
        ]
      ]);

      const powerGrid = PowerGridManager.calculatePowerDistribution(grid);
      
      expect(powerGrid.totalCapacity).toBe(0);
      expect(powerGrid.totalDemand).toBeGreaterThan(0);
      expect(powerGrid.efficiency).toBe(0);
    });

    it('should handle grid with no buildings', () => {
      const grid = createMockGrid(2, 2, [
        [
          { hasPower: true },
          { hasPower: true }
        ],
        [
          { hasPower: true },
          { hasPower: true }
        ]
      ]);

      const powerGrid = PowerGridManager.calculatePowerDistribution(grid);
      
      expect(powerGrid.totalCapacity).toBe(0);
      expect(powerGrid.totalDemand).toBe(0);
      expect(powerGrid.efficiency).toBe(0);
    });

    it('should handle mixed building types', () => {
      const grid = createMockGrid(3, 3, [
        [
          { hasBuilding: true, buildingType: BuildingType.POWERPLANT, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOSPITAL, hasPower: true }
        ],
        [
          { hasBuilding: true, buildingType: BuildingType.SCHOOL, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.PARK, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ],
        [
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true },
          { hasBuilding: true, buildingType: BuildingType.HOUSE, hasPower: true }
        ]
      ]);

      const powerGrid = PowerGridManager.calculatePowerDistribution(grid);
      
      expect(powerGrid.nodes.length).toBeGreaterThan(0);
      expect(powerGrid.totalCapacity).toBeGreaterThan(0);
      expect(powerGrid.totalDemand).toBeGreaterThan(0);
    });
  });

  describe('Power Grid Performance', () => {
    it('should handle large grids efficiently', () => {
      const largeGrid = createMockGrid(50, 30, []);
      
      // Add some buildings and power infrastructure
      for (let y = 0; y < 30; y += 5) {
        for (let x = 0; x < 50; x += 5) {
          if (x < 50 && y < 30) {
            largeGrid[y][x] = {
              ...createMockCell(true, true, true, BuildingType.HOUSE),
              x,
              y
            };
          }
        }
      }
      
      // Add a power plant
      largeGrid[0][0] = {
        ...createMockCell(true, true, true, BuildingType.POWERPLANT),
        x: 0,
        y: 0
      };
      
      const startTime = performance.now();
      const powerGrid = PowerGridManager.calculatePowerDistribution(largeGrid);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(powerGrid).toBeDefined();
    });
  });
});

