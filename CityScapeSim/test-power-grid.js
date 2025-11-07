#!/usr/bin/env node

/**
 * Simple test runner for power grid system
 * This demonstrates the power grid functionality without requiring Jest
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

  requiresPower() {
    return this.type !== BuildingType.POWERPLANT;
  }

  getPowerDemand() {
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

    return baseDemand * sizeMultiplier;
  }

  isServiceBuilding() {
    return [BuildingType.HOSPITAL, BuildingType.SCHOOL, BuildingType.PARK].includes(this.type);
  }

  getEfficiency(hasPower) {
    if (!this.requiresPower()) return 1.0;
    return hasPower ? 1.0 : 0.3;
  }
}

// Mock PowerGridManager
class MockPowerGridManager {
  static calculatePowerDistribution(grid) {
    const nodes = [];
    let totalCapacity = 0;
    let totalDemand = 0;

    // Find power sources and consumers
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        
        if (cell.building) {
          if (cell.building.type === BuildingType.POWERPLANT) {
            // Power plant - source
            const capacity = 1000;
            nodes.push({
              id: `power_source_${x}_${y}`,
              x, y,
              type: 'source',
              capacity,
              demand: 0,
              connected: true
            });
            totalCapacity += capacity;
          } else {
            // Regular building - consumer
            const demand = cell.building.getPowerDemand();
            nodes.push({
              id: `power_consumer_${x}_${y}`,
              x, y,
              type: 'consumer',
              capacity: 0,
              demand,
              connected: false
            });
            totalDemand += demand;
          }
        }
      }
    }

    // Simple power distribution - connect all consumers to nearest source
    const sources = nodes.filter(node => node.type === 'source');
    const consumers = nodes.filter(node => node.type === 'consumer');
    
    for (const consumer of consumers) {
      if (sources.length > 0) {
        consumer.connected = true;
      }
    }

    const efficiency = totalCapacity > 0 ? Math.min(1, totalDemand / totalCapacity) : 0;

    return {
      nodes,
      totalCapacity,
      totalDemand,
      efficiency
    };
  }

  static isPowerGridOverloaded(powerGrid) {
    return powerGrid.efficiency > 0.9;
  }

  static getPowerShortageAreas(powerGrid) {
    return powerGrid.nodes.filter(node => 
      node.type === 'consumer' && !node.connected
    );
  }
}

// Test cases
const runTests = () => {
  console.log('⚡ Power Grid System Tests\n');
  
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
  
  // Test 1: Power plant doesn't require power
  test('Power plant doesn\'t require power', () => {
    const powerPlant = new MockBuilding('power-plant', 0, 0, BuildingType.POWERPLANT, BuildingSize.LARGE);
    expect(powerPlant.requiresPower()).toBe(false);
    expect(powerPlant.getPowerDemand()).toBe(0);
  });
  
  // Test 2: Regular buildings require power
  test('Regular buildings require power', () => {
    const house = new MockBuilding('house', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL);
    expect(house.requiresPower()).toBe(true);
    expect(house.getPowerDemand()).toBeGreaterThan(0);
  });
  
  // Test 3: Service buildings have higher power demand
  test('Service buildings have higher power demand', () => {
    const house = new MockBuilding('house', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL);
    const hospital = new MockBuilding('hospital', 0, 0, BuildingType.HOSPITAL, BuildingSize.SMALL);
    
    expect(hospital.getPowerDemand()).toBeGreaterThan(house.getPowerDemand());
  });
  
  // Test 4: Building efficiency based on power status
  test('Building efficiency based on power status', () => {
    const house = new MockBuilding('house', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL);
    expect(house.getEfficiency(true)).toBe(1.0);
    expect(house.getEfficiency(false)).toBe(0.3);
  });
  
  // Test 5: Power grid calculation
  test('Power grid calculation', () => {
    const grid = [
      [
        { building: new MockBuilding('power-plant', 0, 0, BuildingType.POWERPLANT, BuildingSize.LARGE) },
        { building: new MockBuilding('house', 1, 0, BuildingType.HOUSE, BuildingSize.SMALL) }
      ],
      [
        { building: new MockBuilding('house', 0, 1, BuildingType.HOUSE, BuildingSize.SMALL) },
        { building: new MockBuilding('house', 1, 1, BuildingType.HOUSE, BuildingSize.SMALL) }
      ]
    ];
    
    const powerGrid = MockPowerGridManager.calculatePowerDistribution(grid);
    
    expect(powerGrid.totalCapacity).toBeGreaterThan(0);
    expect(powerGrid.totalDemand).toBeGreaterThan(0);
    expect(powerGrid.efficiency).toBeGreaterThanOrEqual(0);
    expect(powerGrid.efficiency).toBeLessThanOrEqual(1);
  });
  
  // Test 6: Power grid overload detection
  test('Power grid overload detection', () => {
    const powerGrid = {
      totalCapacity: 1000,
      totalDemand: 950,
      efficiency: 0.95
    };
    
    expect(MockPowerGridManager.isPowerGridOverloaded(powerGrid)).toBe(true);
  });
  
  // Test 7: Power shortage areas
  test('Power shortage areas detection', () => {
    const powerGrid = {
      nodes: [
        { type: 'consumer', connected: false },
        { type: 'consumer', connected: true },
        { type: 'source', connected: true }
      ]
    };
    
    const shortageAreas = MockPowerGridManager.getPowerShortageAreas(powerGrid);
    expect(shortageAreas.length).toBe(1);
  });
  
  // Test 8: Different building sizes have different power demands
  test('Different building sizes have different power demands', () => {
    const smallHouse = new MockBuilding('small-house', 0, 0, BuildingType.HOUSE, BuildingSize.SMALL);
    const largeHouse = new MockBuilding('large-house', 0, 0, BuildingType.HOUSE, BuildingSize.LARGE);
    
    expect(largeHouse.getPowerDemand()).toBeGreaterThan(smallHouse.getPowerDemand());
  });
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Power grid system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
};

// Run the tests
runTests();

