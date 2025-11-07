# Road Connection Tests

This directory contains comprehensive tests for the dynamic road tile system in CityScapeSim.

## Test Files

### 1. `roadConnections.test.ts`
Tests the core road connection detection logic:
- **Connection Detection**: Tests `getRoadConnections()` function
- **Pattern Recognition**: Tests various road patterns (straight, corner, T-junction, intersection)
- **Edge Cases**: Tests boundary conditions and error handling
- **Complex Networks**: Tests real-world road network patterns

### 2. `roadRenderer.test.ts`
Tests the visual rendering system:
- **Canvas Integration**: Tests CityRenderer road drawing methods
- **Visual Type Selection**: Tests road visual type determination
- **Drawing Parameters**: Tests stroke styles, colors, and dimensions
- **Position Accuracy**: Tests road positioning and scaling

### 3. `roadIntegration.test.ts`
Integration tests for the complete road system:
- **Real-world Patterns**: Tests common city road layouts
- **Connection Validation**: Tests bidirectional connection consistency
- **Performance**: Tests large grid handling
- **Visual Consistency**: Tests all possible connection combinations

## Test Coverage

The test suite covers:

### ✅ Road Connection Types
- **Isolated Roads**: Standalone road segments
- **Dead Ends**: Roads ending at cell edges
- **Straight Roads**: Horizontal and vertical continuous roads
- **Corner Roads**: L-shaped road connections
- **T-Junctions**: Three-way road intersections
- **Intersections**: Four-way road crossings

### ✅ Road Patterns
- **Grid Patterns**: City street grids
- **Cul-de-sacs**: Dead-end residential streets
- **Curved Roads**: Non-linear road layouts
- **Complex Networks**: Multi-intersection road systems

### ✅ Edge Cases
- **Grid Boundaries**: Edge and corner cells
- **Empty Grids**: Zero-size grids
- **Single Cells**: Minimal grid sizes
- **Mixed Infrastructure**: Roads with other utilities
- **Large Grids**: Performance with maximum grid size

### ✅ Visual Types
- **All 16 Combinations**: Every possible connection pattern
- **Consistent Mapping**: Same patterns always produce same visual types
- **Bidirectional Validation**: Connection symmetry verification

## Running Tests

### Using Jest (Recommended)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Using Simple Test Runner
```bash
# Run the simple demonstration test
node test-road-connections.js
```

## Test Results

The test suite validates that:

1. **Road connections are detected correctly** for all patterns
2. **Visual types are selected appropriately** based on connections
3. **Road rendering works properly** with canvas drawing
4. **Edge cases are handled gracefully** without errors
5. **Performance is acceptable** even with large grids
6. **All connection combinations work** (16 total patterns)

## Expected Output

When all tests pass, you should see:
```
🛣️  Road Connection Detection Tests

✅ Isolated road detection
✅ Dead end detection
✅ Straight road detection
✅ Corner road detection
✅ T-junction detection
✅ Complex grid pattern
✅ All connection combinations

📊 Test Results: 7 passed, 0 failed
🎉 All tests passed! Road connection detection is working correctly.
```

## Test Architecture

The tests use a modular approach:

1. **Mock Data**: Factory functions create test grids and cells
2. **Helper Functions**: Utility functions for common test operations
3. **Comprehensive Coverage**: Tests cover all possible scenarios
4. **Performance Testing**: Tests verify acceptable performance
5. **Integration Testing**: Tests verify system-wide functionality

This ensures the road connection system is robust, reliable, and performs well under all conditions.

