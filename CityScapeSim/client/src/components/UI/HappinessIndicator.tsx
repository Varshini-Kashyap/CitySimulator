import React from "react";
import { useCityStore } from "../../lib/stores/useCityStore";

const HappinessIndicator: React.FC = () => {
  const { happiness, pollution } = useCityStore();

  const getHappinessLevel = (happiness: number) => {
    if (happiness >= 80) return { level: 'Excellent', color: 'bg-green-600', icon: '🌟' };
    if (happiness >= 60) return { level: 'Good', color: 'bg-green-500', icon: '😊' };
    if (happiness >= 40) return { level: 'Average', color: 'bg-yellow-500', icon: '😐' };
    if (happiness >= 20) return { level: 'Poor', color: 'bg-orange-500', icon: '😟' };
    return { level: 'Critical', color: 'bg-red-600', icon: '😞' };
  };

  const happinessInfo = getHappinessLevel(happiness);

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 min-w-64">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-lg">City Happiness</h3>
          <span className="text-2xl">{happinessInfo.icon}</span>
        </div>

        {/* Happiness Meter */}
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>{happinessInfo.level}</span>
            <span>{Math.round(happiness)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
            <div 
              className={`h-full ${happinessInfo.color} transition-all duration-500 ease-out`}
              style={{ width: `${happiness}%` }}
            />
            {/* Gradient overlay for visual appeal */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20 rounded-full" />
          </div>
        </div>

        {/* Happiness Factors */}
        <div className="text-xs text-gray-400">
          <p className="mb-1">Factors affecting happiness:</p>
          <ul className="space-y-1">
            <li className="flex justify-between">
              <span>🏭 Pollution Impact</span>
              <span className={pollution > 50 ? 'text-red-400' : 'text-green-400'}>
                {pollution > 50 ? 'Negative' : 'Minimal'}
              </span>
            </li>
            <li className="flex justify-between">
              <span>🚗 Traffic Flow</span>
              <span className="text-yellow-400">Moderate</span>
            </li>
            <li className="flex justify-between">
              <span>🏥 Services</span>
              <span className="text-blue-400">Basic</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HappinessIndicator;
