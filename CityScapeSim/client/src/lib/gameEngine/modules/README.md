# City Simulation Modular Architecture

This directory contains the enhanced modular architecture for the city simulation game engine. The code has been restructured to use proper separation of concerns with ES6 modules and includes advanced simulation features.

## Architecture Overview

The simulation engine is now divided into seven main classes, each with a specific responsibility:

### 1. Building Class (`Building.ts`)
**Responsibility**: Manages individual building properties and behavior.

**Key Features**:
- Encapsulates building properties (population, jobs, pollution, happiness)
- Handles building upgrades (small → medium → large)
- Calculates building statistics based on type and size
- Provides tax calculation methods
- Supports serialization/deserialization

**Usage**:
```typescript
import { Building } from './modules/Building';

const building = new Building('building_1', 10, 15, ZoneType.RESIDENTIAL);
building.upgrade(); // Upgrade to next size
const tax = building.calculateTax();
```

### 2. Zone Class (`Zone.ts`)
**Responsibility**: Manages zones and their infrastructure, coordinates building creation.

**Key Features**:
- Manages infrastructure (roads, power, water)
- Handles building creation and upgrades within zones
- Calculates zone-specific happiness and pollution
- Determines growth conditions for buildings

**Usage**:
```typescript
import { Zone } from './modules/Zone';

const zone = new Zone(10, 15, ZoneType.RESIDENTIAL);
zone.addInfrastructure('road');
zone.addInfrastructure('power');
const building = zone.createBuilding('building_1');
```

### 3. HappinessManager Class (`HappinessManager.ts`)
**Responsibility**: Calculates happiness and related metrics across the city.

**Key Features**:
- Calculates zone happiness based on infrastructure, pollution, and neighbors
- Manages pollution spread from industrial zones
- Counts nearby jobs for residential zones
- Provides city-wide happiness statistics

**Usage**:
```typescript
import { HappinessManager } from './modules/HappinessManager';

const happiness = HappinessManager.calculateZoneHappiness(zone, neighbors, pollution, jobs);
HappinessManager.updateAllZoneHappiness(zones, width, height);
```

### 4. EconomyManager Class (`EconomyManager.ts`)
**Responsibility**: Handles all economic calculations and city finances.

**Key Features**:
- Calculates tax revenue from different building types
- Manages employment rates and population statistics
- Tracks maintenance costs and infrastructure expenses
- Provides city rating based on various factors
- Offers cost calculations for zones and infrastructure

**Usage**:
```typescript
import { EconomyManager } from './modules/EconomyManager';

const taxRevenue = EconomyManager.calculateTaxRevenue(buildings);
const employmentRate = EconomyManager.calculateEmploymentRate(buildings);
const economicStats = EconomyManager.calculateEconomicStats(buildings, zones, happiness, pollution);
```

### 5. WeatherManager Class (`WeatherManager.ts`)
**Responsibility**: Manages weather conditions and their effects on the city.

**Key Features**:
- Simulates different weather types (sunny, rainy, stormy, etc.)
- Applies weather effects to building happiness and pollution
- Influences city growth rates based on weather conditions
- Provides weather forecasts for planning
- Affects different zone types differently

**Usage**:
```typescript
import { WeatherManager } from './modules/WeatherManager';

WeatherManager.updateWeather();
WeatherManager.applyWeatherEffects(zones);
const canGrow = WeatherManager.canGrowInCurrentWeather();
const weatherStats = WeatherManager.getWeatherStats();
```

### 6. TransportManager Class (`TransportManager.ts`)
**Responsibility**: Handles transportation networks and connectivity.

**Key Features**:
- Calculates connectivity scores for zones
- Manages transportation efficiency
- Provides job accessibility for residential zones
- Calculates service accessibility for commercial zones
- Tracks supply chain efficiency for industrial zones
- Finds optimal infrastructure placement

**Usage**:
```typescript
import { TransportManager } from './modules/TransportManager';

const connectivity = TransportManager.calculateConnectivity(x, y, zones, width, height);
const jobAccess = TransportManager.calculateJobAccessibility(x, y, zones, width, height);
TransportManager.applyTransportHappinessEffect(zone, zones, width, height);
```

### 7. City Class (`City.ts`)
**Responsibility**: Coordinates the overall city simulation and manages the grid.

**Key Features**:
- Manages the grid of zones
- Coordinates simulation steps with all managers
- Calculates city-wide statistics
- Handles zone and infrastructure placement
- Provides conversion between internal and external data formats
- Integrates weather, transport, and economic effects

**Usage**:
```typescript
import { City } from './modules/City';

const city = new City(50, 30);
city.addZone(10, 15, ZoneType.RESIDENTIAL);
city.addInfrastructure(10, 15, 'road');
const update = city.simulate();
const weatherInfo = city.getWeatherInfo();
const transportInfo = city.getTransportInfo();
```

### 8. SimulationEngine Class (`SimulationEngine.ts`)
**Responsibility**: Provides a unified interface for the simulation system.

**Key Features**:
- Coordinates all other classes
- Provides backward compatibility with existing code
- Handles data conversion between old and new formats
- Offers high-level simulation control

**Usage**:
```typescript
import { SimulationEngine } from './modules/SimulationEngine';

const engine = new SimulationEngine();
const update = engine.simulate(grid);
```

## Benefits of the Enhanced Architecture

### 1. Separation of Concerns
Each class has a single, well-defined responsibility:
- **Building**: Individual building logic
- **Zone**: Zone management and growth
- **HappinessManager**: Happiness and pollution calculations
- **EconomyManager**: Economic calculations and finances
- **WeatherManager**: Weather simulation and effects
- **TransportManager**: Transportation and connectivity
- **City**: Overall city coordination
- **SimulationEngine**: External interface

### 2. Modularity
- Classes can be tested independently
- Easy to extend or modify individual components
- Clear interfaces between modules
- Reduced coupling between components

### 3. Maintainability
- Code is more organized and easier to understand
- Changes to one component don't affect others
- Better error isolation
- Easier to add new features

### 4. Reusability
- Classes can be reused in different contexts
- Easy to create different simulation scenarios
- Modular design supports future extensions

### 5. Advanced Simulation Features
- **Weather System**: Dynamic weather affects city growth and happiness
- **Economic Modeling**: Realistic tax calculations and economic indicators
- **Transportation Networks**: Connectivity and accessibility calculations
- **Environmental Effects**: Pollution spread and weather interactions
- **Comprehensive Statistics**: Detailed city health and performance metrics

## Migration Guide

The new architecture maintains backward compatibility through the existing `SimulationEngine` class. The old interface continues to work:

```typescript
// Old way (still works)
import { SimulationEngine } from '../SimulationEngine';
const engine = new SimulationEngine();
const update = engine.simulate(grid);

// New way (recommended)
import { SimulationEngine } from './modules';
const engine = new SimulationEngine();
const update = engine.simulate(grid);
```

## Future Enhancements

The modular architecture makes it easy to add new features:

1. **New Building Types**: Extend the Building class
2. **New Zone Types**: Add new zone logic to the Zone class
3. **Advanced Happiness Models**: Enhance the HappinessManager
4. **City Services**: Add new services to the City class
5. **AI Players**: Create AI modules that use the existing classes

## Testing

Each module can be tested independently:

```typescript
// Test Building class
import { Building } from './Building';
// Test building creation, upgrades, tax calculation

// Test Zone class
import { Zone } from './Zone';
// Test zone management, infrastructure, building creation

// Test HappinessManager
import { HappinessManager } from './HappinessManager';
// Test happiness calculations, pollution spread

// Test City class
import { City } from './City';
// Test city simulation, zone management
```

This modular architecture provides a solid foundation for future development while maintaining compatibility with existing code.
