import React from "react";
import { useCityStore } from "../../lib/stores/useCityStore";

const StatsPanel: React.FC = () => {
  const { 
    population, 
    happiness, 
    pollution, 
    taxRevenue, 
    employmentRate,
    money 
  } = useCityStore();

  const stats = [
    {
      label: 'Population',
      value: population.toLocaleString(),
      icon: '👥',
      color: 'text-blue-400'
    },
    {
      label: 'Happiness',
      value: `${Math.round(happiness)}%`,
      icon: happiness >= 70 ? '😊' : happiness >= 40 ? '😐' : '😞',
      color: happiness >= 70 ? 'text-green-400' : happiness >= 40 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      label: 'Pollution',
      value: `${Math.round(pollution)}%`,
      icon: '🏭',
      color: pollution <= 30 ? 'text-green-400' : pollution <= 60 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      label: 'Tax Revenue',
      value: `$${taxRevenue}/turn`,
      icon: '💰',
      color: 'text-green-400'
    },
    {
      label: 'Employment',
      value: `${Math.round(employmentRate)}%`,
      icon: '💼',
      color: employmentRate >= 70 ? 'text-green-400' : employmentRate >= 40 ? 'text-yellow-400' : 'text-red-400'
    }
  ];

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 min-w-48">
        <h3 className="text-white font-bold text-lg mb-3 text-center border-b border-gray-600 pb-2">
          City Stats
        </h3>
        
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-gray-300 text-sm">{stat.label}</span>
              </div>
              <span className={`font-bold text-sm ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Mini Progress Bars */}
        <div className="mt-4 space-y-2">
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Happiness</span>
              <span>{Math.round(happiness)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  happiness >= 70 ? 'bg-green-500' : happiness >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${happiness}%` }}
              />
            </div>
          </div>

          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Pollution</span>
              <span>{Math.round(pollution)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 bg-red-500 rounded-full transition-all duration-300"
                style={{ width: `${pollution}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
