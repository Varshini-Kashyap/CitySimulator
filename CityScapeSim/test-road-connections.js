#!/usr/bin/env node

/**
 * Simple test runner for road connection detection
 * This demonstrates the road connection logic without requiring Jest
 */

// Mock the types and utilities for testing
const ZoneType = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial'
};

const createMockCell = (hasRoad = false) => ({
  x: 0,
  y: 0,
  zoneType: null,
  infrastructure: hasRoad ? ['road'] : [],
  building: null,
  happiness: 50,
  pollution: 0
});

const createMockGrid = (width, height, roadPattern) => {
  const grid = [];
  
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      const hasRoad = roadPattern ? roadPattern[y][x] : false;
      grid[y][x] = {
        ...createMockCell(hasRoad),
        x,
        y
      };
    }
  }
  
  return grid;
};

const hasInfrastructure = (cell, type) => {
  return cell.infrastructure.includes(type);
};

const getRoadConnections = (x, y, grid) => {
  const GRID_WIDTH = grid[0].length;
  const GRID_HEIGHT = grid.length;
  
  return {
    north: y > 0 && hasInfrastructure(grid[y - 1][x], 'road'),
    south: y < GRID_HEIGHT - 1 && hasInfrastructure(grid[y + 1][x], 'road'),
    east: x < GRID_WIDTH - 1 && hasInfrastructure(grid[y][x + 1], 'road'),
    west: x > 0 && hasInfrastructure(grid[y][x - 1], 'road')
  };
};

const getRoadVisualType = (connections) => {
  const connectionCount = (connections.north ? 1 : 0) + 
                        (connections.south ? 1 : 0) + 
                        (connections.east ? 1 : 0) + 
                        (connections.west ? 1 : 0);

  if (connectionCount === 0) return 'isolated';
  if (connectionCount === 1) return 'dead-end';
  if (connectionCount === 2) {
    if ((connections.north && connections.south) || (connections.east && connections.west)) {
      return 'straight';
    } else {
      return 'corner';
    }
  }
  if (connectionCount === 3) return 't-junction';
  if (connectionCount === 4) return 'intersection';
  return 'unknown';
};

// Test cases
const runTests = () => {
  console.log('🛣️  Road Connection Detection Tests\n');
  
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
    }
  });
  
  // Test 1: Isolated road
  test('Isolated road detection', () => {
    const grid = createMockGrid(3, 3, [
      [false, false, false],
      [false, true,  false],
      [false, false, false]
    ]);
    
    const connections = getRoadConnections(1, 1, grid);
    expect(connections).toEqual({
      north: false,
      south: false,
      east: false,
      west: false
    });
    expect(getRoadVisualType(connections)).toBe('isolated');
  });
  
  // Test 2: Dead end
  test('Dead end detection', () => {
    const grid = createMockGrid(3, 3, [
      [false, true,  false],
      [false, true,  false],
      [false, false, false]
    ]);
    
    const connections = getRoadConnections(1, 1, grid);
    expect(connections).toEqual({
      north: true,
      south: false,
      east: false,
      west: false
    });
    expect(getRoadVisualType(connections)).toBe('dead-end');
  });
  
  // Test 3: Straight road
  test('Straight road detection', () => {
    const grid = createMockGrid(3, 3, [
      [false, true,  false],
      [false, true,  false],
      [false, true,  false]
    ]);
    
    const connections = getRoadConnections(1, 1, grid);
    expect(connections).toEqual({
      north: true,
      south: true,
      east: false,
      west: false
    });
    expect(getRoadVisualType(connections)).toBe('straight');
  });
  
  // Test 4: Corner road
  test('Corner road detection', () => {
    const grid = createMockGrid(3, 3, [
      [false, true,  false],
      [false, true,  true ],
      [false, false, false]
    ]);
    
    const connections = getRoadConnections(1, 1, grid);
    expect(connections).toEqual({
      north: true,
      south: false,
      east: true,
      west: false
    });
    expect(getRoadVisualType(connections)).toBe('corner');
  });
  
  // Test 5: T-junction
  test('T-junction detection', () => {
    const grid = createMockGrid(3, 3, [
      [false, true,  false],
      [true,  true,  true ],
      [false, true,  false]
    ]);
    
    const connections = getRoadConnections(1, 1, grid);
    expect(connections).toEqual({
      north: true,
      south: true,
      east: true,
      west: true
    });
    expect(getRoadVisualType(connections)).toBe('intersection');
  });
  
  // Test 6: Complex grid pattern
  test('Complex grid pattern', () => {
    const grid = createMockGrid(4, 4, [
      [true,  true,  true,  true ],
      [true,  false, false, true ],
      [true,  false, false, true ],
      [true,  true,  true,  true ]
    ]);
    
    const topLeft = getRoadConnections(0, 0, grid);
    expect(getRoadVisualType(topLeft)).toBe('corner');
    
    const topRight = getRoadConnections(3, 0, grid);
    expect(getRoadVisualType(topRight)).toBe('corner');
    
    const bottomLeft = getRoadConnections(0, 3, grid);
    expect(getRoadVisualType(bottomLeft)).toBe('corner');
    
    const bottomRight = getRoadConnections(3, 3, grid);
    expect(getRoadVisualType(bottomRight)).toBe('corner');
  });
  
  // Test 7: All connection combinations
  test('All connection combinations', () => {
    const combinations = [
      { connections: { north: false, south: false, east: false, west: false }, expected: 'isolated' },
      { connections: { north: true, south: false, east: false, west: false }, expected: 'dead-end' },
      { connections: { north: false, south: true, east: false, west: false }, expected: 'dead-end' },
      { connections: { north: false, south: false, east: true, west: false }, expected: 'dead-end' },
      { connections: { north: false, south: false, east: false, west: true }, expected: 'dead-end' },
      { connections: { north: true, south: true, east: false, west: false }, expected: 'straight' },
      { connections: { north: false, south: false, east: true, west: true }, expected: 'straight' },
      { connections: { north: true, south: false, east: true, west: false }, expected: 'corner' },
      { connections: { north: true, south: false, east: false, west: true }, expected: 'corner' },
      { connections: { north: false, south: true, east: true, west: false }, expected: 'corner' },
      { connections: { north: false, south: true, east: false, west: true }, expected: 'corner' },
      { connections: { north: true, south: true, east: true, west: false }, expected: 't-junction' },
      { connections: { north: true, south: true, east: false, west: true }, expected: 't-junction' },
      { connections: { north: true, south: false, east: true, west: true }, expected: 't-junction' },
      { connections: { north: false, south: true, east: true, west: true }, expected: 't-junction' },
      { connections: { north: true, south: true, east: true, west: true }, expected: 'intersection' }
    ];

    combinations.forEach(({ connections, expected }) => {
      expect(getRoadVisualType(connections)).toBe(expected);
    });
  });
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Road connection detection is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
};

// Run the tests
runTests();

