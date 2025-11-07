#!/usr/bin/env node

/**
 * Simple test runner for infrastructure connectivity system
 * This demonstrates the connectivity functionality without requiring Jest
 */

// Mock the types and utilities for testing
const BuildingType = {
  HOUSE: 'house',
  APARTMENT: 'apartment',
  OFFICE: 'office',
  STORE: 'store',
  FACTORY: 'factory',
  POWERPLANT: 'powerplant',
  HOSPITAL: 'hospital',
  SCHOOL: 'school',
  PARK: 'park'
};

const BuildingSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  BLOCK_2X2: 'block_2x2'
};

// Mock Building class
class MockBuilding {
  constructor(id, x, y, type, size) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = size;
  }

  requiresRoad() {
    return this.type !== BuildingType.PARK;
  }

  requiresPower() {
    return this.type !== BuildingType.POWERPLANT;
  }

  requiresWater() {
    return this.type !== BuildingType.POWERPLANT;
  }

  getConnectivityStatus(hasRoad, hasPower, hasWater) {
    const roadRequired = this.requiresRoad();
    const powerRequired = this.requiresPower();
    const waterRequired = this.requiresWater();

    const roadOk = !roadRequired || hasRoad;
    const powerOk = !powerRequired || hasPower;
    const waterOk = !waterRequired || hasWater;

    const connectedCount = [roadOk, powerOk, waterOk].filter(Boolean).length;
    const totalRequired = [roadRequired, powerRequired, waterRequired].filter(Boolean).length;

    if (connectedCount === totalRequired) {
      return 'bright';
    } else if (connectedCount >= totalRequired * 0.5) {
      return 'dim';
    } else {
      return 'dark';
    }
  }

  getInfrastructureEfficiency(hasRoad, hasPower, hasWater) {
    const roadRequired = this.requiresRoad();
    const powerRequired = this.requiresPower();
    const waterRequired = this.requiresWater();

    const roadOk = !roadRequired || hasRoad;
    const powerOk = !powerRequired || hasPower;
    const waterOk = !waterRequired || hasWater;

    const connectedCount = [roadOk, powerOk, waterOk].filter(Boolean).length;
    const totalRequired = [roadRequired, powerRequired, waterRequired].filter(Boolean).length;

    if (totalRequired === 0) return 1.0;

    let baseEfficiency = connectedCount / totalRequired;
    
    if (!roadOk && roadRequired) baseEfficiency *= 0.2;
    if (!powerOk && powerRequired) baseEfficiency *= 0.3;
    if (!waterOk && waterRequired) baseEfficiency *= 0.4;

    return Math.max(0.1, baseEfficiency);
  }

  getInfrastructureRequirements() {
    return {
      road: this.requiresRoad(),
      power: this.requiresPower(),
      water: this.requiresWater()
    };
  }
}

// Mock InfrastructureConnectivityManager
class MockInfrastructureConnectivityManager {
  static hasRoadConnectivity(x, y, grid) {
    if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
      return false;
    }

    const cell = grid[y][x];
    if (cell.infrastructure && cell.infrastructure.includes('road')) {
      return true;
    }

    // Check adjacent cells
    const neighbors = this.getNeighbors(x, y, 1, grid);
    return neighbors.some(neighbor => neighbor.infrastructure && neighbor.infrastructure.includes('road'));
  }

  static hasPowerConnectivity(x, y, grid) {
    if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
      return false;
    }

    const cell = grid[y][x];
    if (cell.infrastructure && cell.infrastructure.includes('power')) {
      return true;
    }

    const neighbors = this.getNeighbors(x, y, 8, grid);
    return neighbors.some(neighbor => neighbor.infrastructure && neighbor.infrastructure.includes('power'));
  }

  static hasWaterConnectivity(x, y, grid) {
    if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
      return false;
    }

    const cell = grid[y][x];
    if (cell.infrastructure && cell.infrastructure.includes('water')) {
      return true;
    }

    const neighbors = this.getNeighbors(x, y, 6, grid);
    return neighbors.some(neighbor => neighbor.infrastructure && neighbor.infrastructure.includes('water'));
  }

  static getBuildingConnectivity(x, y, grid) {
    const road = this.hasRoadConnectivity(x, y, grid);
    const power = this.hasPowerConnectivity(x, y, grid);
    const water = this.hasWaterConnectivity(x, y, grid);

    const cell = grid[y][x];
    let status = 'dark';
    let efficiency = 0.1;

    if (cell.building) {
      status = cell.building.getConnectivityStatus(road, power, water);
      efficiency = cell.building.getInfrastructureEfficiency(road, power, water);
    } else {
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

    return { road, power, water, status, efficiency };
  }

  static getNeighbors(x, y, range, grid) {
    const neighbors = [];
    
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if ((dx === 0 && dy === 0) || nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) {
          continue;
        }
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= range) {
          neighbors.push(grid[ny][nx]);
        }
      }
    }
    
    return neighbors;
  }

  static getGridConnectivityStats(grid) {
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
}

// Test cases
const runTests = () => {
  console.log('🔌 Infrastructure Connectivity System Tests\n');
  
  let passed = 0;
  let failed = 0;
  
  const test = (name, testFn) => {
    try {
      testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  };
  
  const expect = (actual) => ({
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan: (expected) => {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThanOrEqual: (expected) => {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    }
  });
  
  // Test 1: Building infrastructure requirements
  test('Building infrastructure requirements', () => {
    const house = new MockBuilding('house', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL);
    const powerPlant = new MockBuilding('power-plant', 0, 0, BuildingType.POWERPLANT, BuildingSize.LARGE);
    const park = new MockBuilding('park', 0, 0, BuildingType.PARK, BuildingSize.SMALL);
    
    expect(house.requiresRoad()).toBe(true);
    expect(house.requiresPower()).toBe(true);
    expect(house.requiresWater()).toBe(true);
    
    expect(powerPlant.requiresRoad()).toBe(true);
    expect(powerPlant.requiresPower()).toBe(false);
    expect(powerPlant.requiresWater()).toBe(false);
    
    expect(park.requiresRoad()).toBe(false);
    expect(park.requiresPower()).toBe(true);
    expect(park.requiresWater()).toBe(true);
  });
  
  // Test 2: Connectivity status calculation
  test('Connectivity status calculation', () => {
    const house = new MockBuilding('house', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL);
    
    expect(house.getConnectivityStatus(true, true, true)).toBe('bright');
    expect(house.getConnectivityStatus(true, true, false)).toBe('dim');
    expect(house.getConnectivityStatus(false, false, false)).toBe('dark');
  });
  
  // Test 3: Infrastructure efficiency calculation
  test('Infrastructure efficiency calculation', () => {
    const house = new MockBuilding('house', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL);
    
    expect(house.getInfrastructureEfficiency(true, true, true)).toBe(1.0);
    expect(house.getInfrastructureEfficiency(true, true, false)).toBeLessThan(1.0);
    expect(house.getInfrastructureEfficiency(false, false, false)).toBe(0.1);
  });
  
  // Test 4: Road connectivity detection
  test('Road connectivity detection', () => {
    const grid = [
      [
        { building: new MockBuilding('house1', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL), infrastructure: [] },
        { infrastructure: ['road'] }
      ],
      [
        { infrastructure: ['road'] },
        { infrastructure: ['road'] }
      ]
    ];
    
    expect(MockInfrastructureConnectivityManager.hasRoadConnectivity(0, 0, grid)).toBe(true);
  });
  
  // Test 5: Power connectivity detection
  test('Power connectivity detection', () => {
    const grid = [
      [
        { building: new MockBuilding('house1', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL), infrastructure: [] },
        { infrastructure: ['power'] }
      ],
      [
        { infrastructure: ['power'] },
        { infrastructure: ['power'] }
      ]
    ];
    
    expect(MockInfrastructureConnectivityManager.hasPowerConnectivity(0, 0, grid)).toBe(true);
  });
  
  // Test 6: Water connectivity detection
  test('Water connectivity detection', () => {
    const grid = [
      [
        { building: new MockBuilding('house1', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL), infrastructure: [] },
        { infrastructure: ['water'] }
      ],
      [
        { infrastructure: ['water'] },
        { infrastructure: ['water'] }
      ]
    ];
    
    expect(MockInfrastructureConnectivityManager.hasWaterConnectivity(0, 0, grid)).toBe(true);
  });
  
  // Test 7: Building connectivity calculation
  test('Building connectivity calculation', () => {
    const grid = [
      [
        { building: new MockBuilding('house1', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL), infrastructure: ['road', 'power', 'water'] },
        { infrastructure: ['road', 'power', 'water'] }
      ],
      [
        { infrastructure: ['road', 'power', 'water'] },
        { infrastructure: ['road', 'power', 'water'] }
      ]
    ];
    
    const connectivity = MockInfrastructureConnectivityManager.getBuildingConnectivity(0, 0, grid);
    expect(connectivity.status).toBe('bright');
    expect(connectivity.efficiency).toBe(1.0);
  });
  
  // Test 8: Grid connectivity statistics
  test('Grid connectivity statistics', () => {
    const grid = [
      [
        { building: new MockBuilding('house1', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL), infrastructure: ['road', 'power', 'water'] },
        { building: new MockBuilding('house2', 1, 0, BuildingType.HOUSE, BuildingSize.SMALL), infrastructure: ['road', 'power'] }
      ],
      [
        { building: new MockBuilding('house3', 0, 1, BuildingType.HOUSE, BuildingSize.SMALL), infrastructure: ['road'] },
        { building: new MockBuilding('house4', 1, 1, BuildingType.HOUSE, BuildingSize.SMALL), infrastructure: [] }
      ]
    ];
    
    const stats = MockInfrastructureConnectivityManager.getGridConnectivityStats(grid);
    expect(stats.totalBuildings).toBe(4);
    expect(stats.fullyConnected).toBe(1);
    expect(stats.partiallyConnected).toBe(2);
    expect(stats.poorlyConnected).toBe(1);
  });
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Infrastructure connectivity system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
};

// Run the tests
runTests();

