import React from "react";
import GameCanvas from "./GameCanvas";
import Toolbar from "./UI/Toolbar";
import StatsPanel from "./UI/StatsPanel";
import HappinessIndicator from "./UI/HappinessIndicator";
import { EnhancedStatsPanel } from "./UI/EnhancedStatsPanel";
import { useCityStore } from "../lib/stores/useCityStore";
import { useGameEngine } from "../hooks/useGameEngine";

const CitySimulation: React.FC = () => {
  const { 
    isRunning, 
    happiness, 
    pollution,
    money,
    population,
    taxRevenue,
    employmentRate
  } = useCityStore();
  
  // Initialize game engine
  useGameEngine();

  // Mock data for enhanced stats (in a real implementation, this would come from the game engine)
  const mockWeatherStats = {
    currentWeather: 'sunny',
    duration: 3,
    effect: {
      description: 'Beautiful sunny weather boosts city morale',
      happinessModifier: 5,
      pollutionModifier: -2,
      growthModifier: 1.2
    },
    forecast: ['sunny', 'cloudy', 'rainy']
  };

  const mockTransportStats = {
    averageConnectivity: 65.5,
    wellConnectedZones: 12,
    isolatedZones: 3,
    totalInfrastructure: 45,
    transportEfficiency: 0.78
  };

  const mockEconomicStats = {
    totalPopulation: population,
    totalTaxRevenue: taxRevenue,
    employmentRate: employmentRate,
    averageIncome: 2500,
    cityRating: 75,
    maintenanceCosts: 1200,
    infrastructureCosts: 800
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Main game canvas */}
      <GameCanvas />
      
      {/* UI Overlays */}
      <Toolbar />
      <StatsPanel />
      <HappinessIndicator />
      
      {/* Enhanced Stats Panel */}
      <EnhancedStatsPanel
        weatherStats={mockWeatherStats}
        transportStats={mockTransportStats}
        economicStats={mockEconomicStats}
        happiness={happiness}
        pollution={pollution}
      />
      
      {/* Game status indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
          isRunning ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
        }`}>
          {isRunning ? 'City Growing...' : 'Paused'}
        </div>
      </div>
    </div>
  );
};

export default CitySimulation;
