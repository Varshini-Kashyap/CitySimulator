# Power Grid System - CityScapeSim

## Overview

The Power Grid System adds realistic power distribution mechanics to CityScapeSim. Buildings now require power to function efficiently, and power flows through connected power lines from power plants to consumers.

## Features

### 🔌 Power Infrastructure
- **Power Plants**: Generate electricity for the city
- **Power Lines**: Transmit electricity between buildings
- **Power Distribution**: Automatic power flow calculation
- **Power Overload Detection**: System alerts when demand exceeds capacity

### 🏢 Building Power Requirements
- **Power Consumption**: All buildings (except power plants) consume electricity
- **Variable Demand**: Different building types and sizes have different power needs
- **Service Buildings**: Hospitals, schools, and parks have higher power demands
- **Efficiency Impact**: Unpowered buildings operate at 30% efficiency

### 🎨 Visual Indicators
- **Powered Buildings**: Blue glow overlay for buildings with power
- **Unpowered Buildings**: Red overlay for buildings without power
- **Power Lines**: Connected power line visualization
- **Power Grid Status**: Real-time power grid statistics

## Technical Implementation

### Core Components

#### PowerGridManager
- Calculates power distribution across the city
- Manages power flow from sources to consumers
- Detects power shortages and overloads
- Updates grid cell power status

#### Building Power Integration
- `requiresPower()`: Check if building needs electricity
- `getPowerDemand()`: Calculate building's power consumption
- `getEfficiency(hasPower)`: Get building efficiency based on power status
- `isPowered(hasPower)`: Check if building is receiving power

#### Visual Rendering
- `drawPowerOverlay()`: Shows powered vs unpowered buildings
- `drawPowerLines()`: Renders connected power line infrastructure
- `getPowerConnections()`: Determines power line connections

### Power Grid Mechanics

#### Power Sources
- **Power Plants**: Generate 1000 units of electricity
- **Capacity**: Fixed capacity per power plant
- **Location**: Must be connected via power lines

#### Power Consumers
- **Base Demand**: 10 units per building
- **Size Multipliers**: Small (1x), Medium (2x), Large (4x), Block (6x)
- **Service Buildings**: 2x multiplier for hospitals, schools, parks
- **Block Buildings**: 1.5x multiplier for 2x2 buildings

#### Power Transmission
- **Range**: 8 cell maximum transmission distance
- **Efficiency**: 95% base efficiency, decreases with distance
- **Pathfinding**: Requires continuous power line connections
- **Overload Threshold**: 90% capacity triggers overload warning

### Power Grid Statistics

The system provides real-time statistics:
- **Total Capacity**: Combined power plant output
- **Total Demand**: Combined building power needs
- **Efficiency**: Ratio of demand to capacity
- **Overload Status**: Whether grid is over capacity
- **Shortage Areas**: Number of unpowered buildings

## Usage Examples

### Basic Power Grid Setup
1. Place a power plant in your city
2. Connect power lines from the plant to buildings
3. Ensure all buildings are within transmission range
4. Monitor power grid efficiency in the stats panel

### Power Grid Optimization
1. Build additional power plants for high-demand areas
2. Create power line networks to distribute electricity
3. Monitor for power shortages and overloads
4. Upgrade buildings to improve efficiency

### Troubleshooting Power Issues
1. **Red Building Overlays**: Indicates unpowered buildings
2. **Low Efficiency**: Add more power plants or improve connections
3. **Power Shortages**: Check power line connections and range
4. **Overload Warnings**: Reduce demand or increase capacity

## API Reference

### PowerGridManager Methods

```typescript
// Calculate power distribution for the entire city
PowerGridManager.calculatePowerDistribution(grid: GridCell[][]): PowerGrid

// Update grid cells with power status
PowerGridManager.updateGridPowerStatus(grid: GridCell[][], powerGrid: PowerGrid): void

// Check if power grid is overloaded
PowerGridManager.isPowerGridOverloaded(powerGrid: PowerGrid): boolean

// Get areas with power shortages
PowerGridManager.getPowerShortageAreas(powerGrid: PowerGrid): PowerNode[]
```

### Building Power Methods

```typescript
// Check if building requires power
building.requiresPower(): boolean

// Get building's power demand
building.getPowerDemand(): number

// Check if building is powered
building.isPowered(hasPower: boolean): boolean

// Get building efficiency based on power status
building.getEfficiency(hasPower: boolean): number
```

## Testing

The power grid system includes comprehensive tests:

### Test Coverage
- Power source identification
- Power consumer detection
- Power demand calculations
- Power grid distribution
- Overload detection
- Shortage area identification
- Performance with large grids

### Running Tests
```bash
# Run power grid tests
node test-power-grid.js

# Run Jest tests (if configured)
npm test
```

## Performance Considerations

- **Grid Size**: Optimized for 50x30 grids
- **Calculation Time**: Power distribution completes in <100ms for large grids
- **Memory Usage**: Minimal overhead for power grid data
- **Rendering**: Efficient power overlay rendering

## Future Enhancements

### Planned Features
- **Renewable Energy**: Solar and wind power sources
- **Power Storage**: Battery systems for power backup
- **Smart Grids**: Advanced power distribution algorithms
- **Power Outages**: Random power failures and restoration
- **Power Trading**: Buy/sell electricity with neighboring cities

### Advanced Mechanics
- **Power Quality**: Voltage and frequency considerations
- **Power Losses**: Transmission line efficiency losses
- **Peak Demand**: Time-based power consumption patterns
- **Emergency Power**: Backup generators for critical buildings

## Integration Notes

The power grid system integrates seamlessly with existing CityScapeSim systems:

- **Economy Manager**: Power status affects building tax revenue
- **Happiness Manager**: Power outages reduce citizen happiness
- **Transport Manager**: Power affects transportation efficiency
- **Weather Manager**: Storms can cause power outages
- **Building System**: All building types support power requirements

## Troubleshooting

### Common Issues
1. **Buildings not getting power**: Check power line connections
2. **Low efficiency**: Verify power plant capacity vs demand
3. **Performance issues**: Reduce grid size or optimize power calculations
4. **Visual glitches**: Ensure power overlay is rendered after buildings

### Debug Information
- Power grid statistics are available in the simulation update
- Building power status is stored in grid cell properties
- Power line connections are calculated in real-time
- Power flow simulation runs every update cycle

---

*The Power Grid System adds a new layer of strategic depth to CityScapeSim, requiring players to carefully plan their city's electrical infrastructure while managing power supply and demand.*
