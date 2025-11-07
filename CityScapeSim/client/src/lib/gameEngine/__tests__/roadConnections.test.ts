import { getRoadConnections, RoadConnections } from '../utils';
import { GridCell, ZoneType } from '../types';

// Mock grid cell factory
const createMockCell = (hasRoad: boolean = false): GridCell => ({
  x: 0,
  y: 0,
  zoneType: null,
  infrastructure: hasRoad ? ['road'] : [],
  building: null,
  happiness: 50,
  pollution: 0
});

// Mock grid factory
const createMockGrid = (width: number, height: number, roadPattern?: boolean[][]): GridCell[][] => {
  const grid: GridCell[][] = [];
  
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

describe('Road Connection Detection', () => {
  describe('getRoadConnections', () => {
    it('should detect no connections for isolated road', () => {
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
    });

    it('should detect single connection (dead end)', () => {
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
    });

    it('should detect opposite connections (straight road)', () => {
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
    });

    it('should detect adjacent connections (corner)', () => {
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
    });

    it('should detect three connections (T-junction)', () => {
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
    });

    it('should detect all four connections (intersection)', () => {
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
    });

    it('should handle edge cases (grid boundaries)', () => {
      const grid = createMockGrid(3, 3, [
        [true,  true,  false],
        [true,  true,  false],
        [false, false, false]
      ]);
      
      // Test top-left corner
      const topLeft = getRoadConnections(0, 0, grid);
      expect(topLeft).toEqual({
        north: false, // Out of bounds
        south: true,
        east: true,
        west: false   // Out of bounds
      });
      
      // Test bottom-right corner
      const bottomRight = getRoadConnections(2, 2, grid);
      expect(bottomRight).toEqual({
        north: false,
        south: false, // Out of bounds
        east: false,  // Out of bounds
        west: false
      });
    });

    it('should handle non-road cells correctly', () => {
      const grid = createMockGrid(3, 3, [
        [false, true,  false],
        [false, false, false],
        [false, true,  false]
      ]);
      
      const connections = getRoadConnections(1, 1, grid);
      
      expect(connections).toEqual({
        north: false,
        south: false,
        east: false,
        west: false
      });
    });
  });

  describe('Road Pattern Recognition', () => {
    it('should recognize horizontal straight road', () => {
      const grid = createMockGrid(5, 3, [
        [false, false, false, false, false],
        [false, true,  true,  true,  false],
        [false, false, false, false, false]
      ]);
      
      const leftRoad = getRoadConnections(1, 1, grid);
      const middleRoad = getRoadConnections(2, 1, grid);
      const rightRoad = getRoadConnections(3, 1, grid);
      
      expect(leftRoad).toEqual({ north: false, south: false, east: true, west: false });
      expect(middleRoad).toEqual({ north: false, south: false, east: true, west: true });
      expect(rightRoad).toEqual({ north: false, south: false, east: false, west: true });
    });

    it('should recognize vertical straight road', () => {
      const grid = createMockGrid(3, 5, [
        [false, false, false],
        [false, true,  false],
        [false, true,  false],
        [false, true,  false],
        [false, false, false]
      ]);
      
      const topRoad = getRoadConnections(1, 1, grid);
      const middleRoad = getRoadConnections(1, 2, grid);
      const bottomRoad = getRoadConnections(1, 3, grid);
      
      expect(topRoad).toEqual({ north: false, south: true, east: false, west: false });
      expect(middleRoad).toEqual({ north: true, south: true, east: false, west: false });
      expect(bottomRoad).toEqual({ north: true, south: false, east: false, west: false });
    });

    it('should recognize L-shaped corner', () => {
      const grid = createMockGrid(3, 3, [
        [false, true,  false],
        [false, true,  true ],
        [false, false, false]
      ]);
      
      const cornerRoad = getRoadConnections(1, 1, grid);
      const horizontalRoad = getRoadConnections(2, 1, grid);
      
      expect(cornerRoad).toEqual({ north: true, south: false, east: true, west: false });
      expect(horizontalRoad).toEqual({ north: false, south: false, east: false, west: true });
    });

    it('should recognize T-junction', () => {
      const grid = createMockGrid(3, 3, [
        [false, true,  false],
        [true,  true,  true ],
        [false, true,  false]
      ]);
      
      const centerRoad = getRoadConnections(1, 1, grid);
      const topRoad = getRoadConnections(1, 0, grid);
      const leftRoad = getRoadConnections(0, 1, grid);
      const rightRoad = getRoadConnections(2, 1, grid);
      const bottomRoad = getRoadConnections(1, 2, grid);
      
      expect(centerRoad).toEqual({ north: true, south: true, east: true, west: true });
      expect(topRoad).toEqual({ north: false, south: true, east: false, west: false });
      expect(leftRoad).toEqual({ north: false, south: false, east: true, west: false });
      expect(rightRoad).toEqual({ north: false, south: false, east: false, west: true });
      expect(bottomRoad).toEqual({ north: true, south: false, east: false, west: false });
    });

    it('should recognize four-way intersection', () => {
      const grid = createMockGrid(3, 3, [
        [false, true,  false],
        [true,  true,  true ],
        [false, true,  false]
      ]);
      
      const intersection = getRoadConnections(1, 1, grid);
      
      expect(intersection).toEqual({ north: true, south: true, east: true, west: true });
    });
  });

  describe('Complex Road Networks', () => {
    it('should handle grid pattern', () => {
      const grid = createMockGrid(4, 4, [
        [true,  true,  true,  true ],
        [true,  false, false, true ],
        [true,  false, false, true ],
        [true,  true,  true,  true ]
      ]);
      
      // Test corner intersections
      const topLeft = getRoadConnections(0, 0, grid);
      const topRight = getRoadConnections(3, 0, grid);
      const bottomLeft = getRoadConnections(0, 3, grid);
      const bottomRight = getRoadConnections(3, 3, grid);
      
      expect(topLeft).toEqual({ north: false, south: true, east: true, west: false });
      expect(topRight).toEqual({ north: false, south: true, east: false, west: true });
      expect(bottomLeft).toEqual({ north: true, south: false, east: true, west: false });
      expect(bottomRight).toEqual({ north: true, south: false, east: false, west: true });
    });

    it('should handle curved road pattern', () => {
      const grid = createMockGrid(4, 4, [
        [false, true,  true,  false],
        [false, true,  false, false],
        [false, true,  true,  false],
        [false, false, false, false]
      ]);
      
      const topRight = getRoadConnections(2, 0, grid);
      const middleLeft = getRoadConnections(1, 1, grid);
      const bottomRight = getRoadConnections(2, 2, grid);
      
      expect(topRight).toEqual({ north: false, south: false, east: false, west: true });
      expect(middleLeft).toEqual({ north: true, south: true, east: false, west: false });
      expect(bottomRight).toEqual({ north: false, south: false, east: false, west: true });
    });

    it('should handle cul-de-sac pattern', () => {
      const grid = createMockGrid(4, 3, [
        [false, false, false, false],
        [false, true,  true,  true ],
        [false, false, false, false]
      ]);
      
      const entrance = getRoadConnections(1, 1, grid);
      const middle = getRoadConnections(2, 1, grid);
      const deadEnd = getRoadConnections(3, 1, grid);
      
      expect(entrance).toEqual({ north: false, south: false, east: true, west: false });
      expect(middle).toEqual({ north: false, south: false, east: true, west: true });
      expect(deadEnd).toEqual({ north: false, south: false, east: false, west: true });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty grid', () => {
      const grid = createMockGrid(0, 0);
      expect(() => getRoadConnections(0, 0, grid)).toThrow();
    });

    it('should handle single cell grid', () => {
      const grid = createMockGrid(1, 1, [[true]]);
      const connections = getRoadConnections(0, 0, grid);
      
      expect(connections).toEqual({
        north: false,
        south: false,
        east: false,
        west: false
      });
    });

    it('should handle out of bounds coordinates', () => {
      const grid = createMockGrid(3, 3);
      
      expect(() => getRoadConnections(-1, 0, grid)).toThrow();
      expect(() => getRoadConnections(0, -1, grid)).toThrow();
      expect(() => getRoadConnections(3, 0, grid)).toThrow();
      expect(() => getRoadConnections(0, 3, grid)).toThrow();
    });

    it('should handle mixed infrastructure types', () => {
      const grid = createMockGrid(3, 3);
      
      // Add road to center cell
      grid[1][1].infrastructure = ['road'];
      // Add power to adjacent cells
      grid[0][1].infrastructure = ['power'];
      grid[1][0].infrastructure = ['power'];
      grid[1][2].infrastructure = ['power'];
      grid[2][1].infrastructure = ['power'];
      
      const connections = getRoadConnections(1, 1, grid);
      
      expect(connections).toEqual({
        north: false,
        south: false,
        east: false,
        west: false
      });
    });
  });
});

describe('Road Visual Type Selection', () => {
  // Helper function to determine road visual type based on connections
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

  it('should select correct visual type for isolated road', () => {
    const connections: RoadConnections = { north: false, south: false, east: false, west: false };
    expect(getRoadVisualType(connections)).toBe('isolated');
  });

  it('should select correct visual type for dead ends', () => {
    const northDeadEnd: RoadConnections = { north: true, south: false, east: false, west: false };
    const southDeadEnd: RoadConnections = { north: false, south: true, east: false, west: false };
    const eastDeadEnd: RoadConnections = { north: false, south: false, east: true, west: false };
    const westDeadEnd: RoadConnections = { north: false, south: false, east: false, west: true };

    expect(getRoadVisualType(northDeadEnd)).toBe('dead-end');
    expect(getRoadVisualType(southDeadEnd)).toBe('dead-end');
    expect(getRoadVisualType(eastDeadEnd)).toBe('dead-end');
    expect(getRoadVisualType(westDeadEnd)).toBe('dead-end');
  });

  it('should select correct visual type for straight roads', () => {
    const verticalStraight: RoadConnections = { north: true, south: true, east: false, west: false };
    const horizontalStraight: RoadConnections = { north: false, south: false, east: true, west: true };

    expect(getRoadVisualType(verticalStraight)).toBe('straight');
    expect(getRoadVisualType(horizontalStraight)).toBe('straight');
  });

  it('should select correct visual type for corners', () => {
    const topRightCorner: RoadConnections = { north: true, south: false, east: true, west: false };
    const topLeftCorner: RoadConnections = { north: true, south: false, east: false, west: true };
    const bottomRightCorner: RoadConnections = { north: false, south: true, east: true, west: false };
    const bottomLeftCorner: RoadConnections = { north: false, south: true, east: false, west: true };

    expect(getRoadVisualType(topRightCorner)).toBe('corner');
    expect(getRoadVisualType(topLeftCorner)).toBe('corner');
    expect(getRoadVisualType(bottomRightCorner)).toBe('corner');
    expect(getRoadVisualType(bottomLeftCorner)).toBe('corner');
  });

  it('should select correct visual type for T-junctions', () => {
    const tDown: RoadConnections = { north: false, south: true, east: true, west: true };
    const tUp: RoadConnections = { north: true, south: false, east: true, west: true };
    const tLeft: RoadConnections = { north: true, south: true, east: false, west: true };
    const tRight: RoadConnections = { north: true, south: true, east: true, west: false };

    expect(getRoadVisualType(tDown)).toBe('t-junction');
    expect(getRoadVisualType(tUp)).toBe('t-junction');
    expect(getRoadVisualType(tLeft)).toBe('t-junction');
    expect(getRoadVisualType(tRight)).toBe('t-junction');
  });

  it('should select correct visual type for intersections', () => {
    const intersection: RoadConnections = { north: true, south: true, east: true, west: true };
    expect(getRoadVisualType(intersection)).toBe('intersection');
  });

  it('should handle all possible connection combinations', () => {
    const allCombinations = [
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

    allCombinations.forEach(({ connections, expected }) => {
      expect(getRoadVisualType(connections)).toBe(expected);
    });
  });
});
