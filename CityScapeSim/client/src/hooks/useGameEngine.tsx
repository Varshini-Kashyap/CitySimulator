import { useEffect, useRef } from "react";
import { useCityStore } from "../lib/stores/useCityStore";
import { SimulationEngine } from "../lib/gameEngine/SimulationEngine";

export const useGameEngine = () => {
  const engineRef = useRef<SimulationEngine | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    isRunning, 
    grid, 
    updateCity, 
    updateEconomics, 
    updateHappiness,
    updatePollution
  } = useCityStore();

  useEffect(() => {
    // Initialize the simulation engine
    engineRef.current = new SimulationEngine();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;

    if (isRunning) {
      // Start the simulation loop - city grows every 3 seconds
      intervalRef.current = setInterval(() => {
        if (engineRef.current) {
          // Run simulation step
          const updates = engineRef.current.simulate(grid);
          
          // Apply updates to store
          updateCity(updates.buildings);
          updateEconomics(updates.economics);
          updateHappiness(updates.happiness);
          updatePollution(updates.pollution);
        }
      }, 3000); // 3 second intervals
    } else {
      // Stop the simulation
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, grid, updateCity, updateEconomics, updateHappiness, updatePollution]);

  return engineRef.current;
};
