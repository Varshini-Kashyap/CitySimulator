import { getRoadConnections, RoadConnections } from '../utils';
import { GridCell, ZoneType } from '../types';

// Integration tests for the complete road system
describe('Road System Integration Tests', () => {
  // Helper function to create a test grid with roads
  const createTestGrid = (width: number, height: number, roadPattern: boolean[][]): GridCell[][] => {
    const grid: GridCell[][] = [];
    
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        const hasRoad = roadPattern[y][x];
        grid[y][x] = {
          x,
          y,
          zoneType: null,
          infrastructure: hasRoad ? ['road'] : [],
          building: null,
          happiness: 50,
          pollution: 0
        };
      }
    }
    
    return grid;
  };

  // Helper function to determine road visual type
  const getRoadVisualType = (connections: RoadConnections): string => {
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

  describe('Real-world Road Patterns', () => {
    it('should handle a simple street grid', () => {
      const grid = createTestGrid(5, 5, [
        [true,  true,  true,  true,  true ], // Horizontal street
        [true,  false, false, false, true ], // Vertical streets
        [true,  false, false, false, true ],
        [true,  false, false, false, true ],
        [true,  true,  true,  true,  true ]  // Horizontal street
      ]);

      // Test intersection (center of grid)
      const intersection = getRoadConnections(2, 2, grid);
      expect(getRoadVisualType(intersection)).toBe('intersection');

      // Test corner intersections
      const topLeftCorner = getRoadConnections(0, 0, grid);
      expect(getRoadVisualType(topLeftCorner)).toBe('corner');

      const topRightCorner = getRoadConnections(4, 0, grid);
      expect(getRoadVisualType(topRightCorner)).toBe('corner');

      // Test straight road segments
      const horizontalStraight = getRoadConnections(1, 0, grid);
      expect(getRoadVisualType(horizontalStraight)).toBe('straight');

      const verticalStraight = getRoadConnections(0, 1, grid);
      expect(getRoadVisualType(verticalStraight)).toBe('straight');
    });

    it('should handle a cul-de-sac pattern', () => {
      const grid = createTestGrid(4, 3, [
        [false, false, false, false],
        [false, true,  true,  true ], // Cul-de-sac
        [false, false, false, false]
      ]);

      const entrance = getRoadConnections(1, 1, grid);
      expect(getRoadVisualType(entrance)).toBe('dead-end');

      const middle = getRoadConnections(2, 1, grid);
      expect(getRoadVisualType(middle)).toBe('straight');

      const deadEnd = getRoadConnections(3, 1, grid);
      expect(getRoadVisualType(deadEnd)).toBe('dead-end');
    });

    it('should handle a curved road pattern', () => {
      const grid = createTestGrid(4, 4, [
        [false, true,  true,  false],
        [false, true,  false, false],
        [false, true,  true,  false],
        [false, false, false, false]
      ]);

      const topRight = getRoadConnections(2, 0, grid);
      expect(getRoadVisualType(topRight)).toBe('dead-end');

      const middleLeft = getRoadConnections(1, 1, grid);
      expect(getRoadVisualType(middleLeft)).toBe('straight');

      const bottomRight = getRoadConnections(2, 2, grid);
      expect(getRoadVisualType(bottomRight)).toBe('dead-end');
    });

    it('should handle a T-junction pattern', () => {
      const grid = createTestGrid(3, 3, [
        [false, true,  false],
        [true,  true,  true ], // T-junction
        [false, true,  false]
      ]);

      const center = getRoadConnections(1, 1, grid);
      expect(getRoadVisualType(center)).toBe('intersection');

      const top = getRoadConnections(1, 0, grid);
      expect(getRoadVisualType(top)).toBe('dead-end');

      const left = getRoadConnections(0, 1, grid);
      expect(getRoadVisualType(left)).toBe('dead-end');

      const right = getRoadConnections(2, 1, grid);
      expect(getRoadVisualType(right)).toBe('dead-end');

      const bottom = getRoadConnections(1, 2, grid);
      expect(getRoadVisualType(bottom)).toBe('dead-end');
    });

    it('should handle a complex road network', () => {
      const grid = createTestGrid(6, 6, [
        [true,  true,  true,  true,  true,  true ], // Main horizontal
        [true,  false, false, false, false, true ], // Vertical connectors
        [true,  true,  true,  false, true,  true ], // Secondary horizontal
        [true,  false, false, false, false, true ], // Vertical connectors
        [true,  false, true,  true,  false, true ], // Tertiary horizontal
        [true,  true,  true,  true,  true,  true ]  // Main horizontal
      ]);

      // Test main intersection
      const mainIntersection = getRoadConnections(2, 2, grid);
      expect(getRoadVisualType(mainIntersection)).toBe('t-junction');

      // Test secondary intersection
      const secondaryIntersection = getRoadConnections(4, 2, grid);
      expect(getRoadVisualType(secondaryIntersection)).toBe('t-junction');

      // Test tertiary intersection
      const tertiaryIntersection = getRoadConnections(2, 4, grid);
      expect(getRoadVisualType(tertiaryIntersection)).toBe('t-junction');

      // Test corner intersections
      const topLeft = getRoadConnections(0, 0, grid);
      expect(getRoadVisualType(topLeft)).toBe('corner');

      const topRight = getRoadConnections(5, 0, grid);
      expect(getRoadVisualType(topRight)).toBe('corner');
    });
  });

  describe('Road Connection Validation', () => {
    it('should validate that all road connections are bidirectional', () => {
      const grid = createTestGrid(3, 3, [
        [false, true,  false],
        [true,  true,  true ],
        [false, true,  false]
      ]);

      // Check that if A connects to B, then B connects to A
      const centerConnections = getRoadConnections(1, 1, grid);
      const topConnections = getRoadConnections(1, 0, grid);
      const leftConnections = getRoadConnections(0, 1, grid);
      const rightConnections = getRoadConnections(2, 1, grid);
      const bottomConnections = getRoadConnections(1, 2, grid);

      // Center should connect to all directions
      expect(centerConnections.north).toBe(true);
      expect(centerConnections.south).toBe(true);
      expect(centerConnections.east).toBe(true);
      expect(centerConnections.west).toBe(true);

      // Top should connect south to center
      expect(topConnections.south).toBe(true);
      
      // Left should connect east to center
      expect(leftConnections.east).toBe(true);
      
      // Right should connect west to center
      expect(rightConnections.west).toBe(true);
      
      // Bottom should connect north to center
      expect(bottomConnections.north).toBe(true);
    });

    it('should handle isolated road segments correctly', () => {
      const grid = createTestGrid(3, 3, [
        [true,  false, false],
        [false, false, false],
        [false, false, true ]
      ]);

      const topLeft = getRoadConnections(0, 0, grid);
      expect(getRoadVisualType(topLeft)).toBe('isolated');

      const bottomRight = getRoadConnections(2, 2, grid);
      expect(getRoadVisualType(bottomRight)).toBe('isolated');
    });

    it('should handle road segments with mixed infrastructure', () => {
      const grid = createTestGrid(3, 3, [
        [false, false, false],
        [false, true,  false],
        [false, false, false]
      ]);

      // Add power infrastructure to adjacent cells
      grid[0][1].infrastructure = ['power'];
      grid[1][0].infrastructure = ['power'];
      grid[1][2].infrastructure = ['power'];
      grid[2][1].infrastructure = ['power'];

      const centerConnections = getRoadConnections(1, 1, grid);
      expect(getRoadVisualType(centerConnections)).toBe('isolated');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large grids efficiently', () => {
      const largeGrid = createTestGrid(50, 30, []);
      
      // Add a few roads
      largeGrid[10][10].infrastructure = ['road'];
      largeGrid[10][11].infrastructure = ['road'];
      largeGrid[11][10].infrastructure = ['road'];

      const startTime = performance.now();
      const connections = getRoadConnections(10, 10, largeGrid);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1); // Should be very fast
      expect(getRoadVisualType(connections)).toBe('corner');
    });

    it('should handle maximum grid size', () => {
      const maxGrid = createTestGrid(50, 30, []);
      
      // Test edge cases
      const topLeft = getRoadConnections(0, 0, maxGrid);
      const topRight = getRoadConnections(49, 0, maxGrid);
      const bottomLeft = getRoadConnections(0, 29, maxGrid);
      const bottomRight = getRoadConnections(49, 29, maxGrid);

      expect(getRoadVisualType(topLeft)).toBe('isolated');
      expect(getRoadVisualType(topRight)).toBe('isolated');
      expect(getRoadVisualType(bottomLeft)).toBe('isolated');
      expect(getRoadVisualType(bottomRight)).toBe('isolated');
    });

    it('should handle empty grids', () => {
      const emptyGrid = createTestGrid(0, 0, []);
      
      expect(() => getRoadConnections(0, 0, emptyGrid)).toThrow();
    });

    it('should handle single cell grids', () => {
      const singleCellGrid = createTestGrid(1, 1, [[true]]);
      
      const connections = getRoadConnections(0, 0, singleCellGrid);
      expect(getRoadVisualType(connections)).toBe('isolated');
    });
  });

  describe('Road Visual Type Consistency', () => {
    it('should maintain consistent visual types for the same connection pattern', () => {
      const testCases = [
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

      testCases.forEach(({ connections, expected }) => {
        expect(getRoadVisualType(connections)).toBe(expected);
      });
    });

    it('should handle all possible connection combinations', () => {
      // Test all 16 possible combinations (2^4)
      for (let i = 0; i < 16; i++) {
        const connections: RoadConnections = {
          north: (i & 1) !== 0,
          south: (i & 2) !== 0,
          east: (i & 4) !== 0,
          west: (i & 8) !== 0
        };

        const visualType = getRoadVisualType(connections);
        
        // Should always return a valid visual type
        expect(['isolated', 'dead-end', 'straight', 'corner', 't-junction', 'intersection']).toContain(visualType);
      }
    });
  });
});

