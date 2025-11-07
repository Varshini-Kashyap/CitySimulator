// Export all modular classes
export { Building } from './Building';
export { Zone } from './Zone';
export type { ZoneCell } from './Zone';
export { City } from './City';
export { HappinessManager } from './HappinessManager';
export { EconomyManager } from './EconomyManager';
export { WeatherManager } from './WeatherManager';
export { TransportManager } from './TransportManager';
export { PowerGridManager } from './PowerGridManager';
export { InfrastructureConnectivityManager } from './InfrastructureConnectivityManager';
export { SimulationEngine } from './SimulationEngine';

// Re-export types for convenience
export type { Building as BuildingType } from '../types';
export type { SimulationUpdate } from '../types';
export type { EconomicStats } from './EconomyManager';
export type { WeatherEffect, WeatherType } from './WeatherManager';
export type { TransportNode, TransportRoute } from './TransportManager';
