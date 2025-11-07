import React, { useState } from "react";
import { useCityStore } from "../../lib/stores/useCityStore";
import { Tool } from "../../lib/gameEngine/types";

const Toolbar: React.FC = () => {
  const { selectedTool, setSelectedTool, money, toggleSimulation, isRunning } = useCityStore();
  const [activeTab, setActiveTab] = useState<'zones' | 'blocks' | 'buildings' | 'infrastructure' | 'services'>('zones');

  const zoneTools = [
    { type: Tool.RESIDENTIAL, label: 'Residential', icon: '🏠', color: 'bg-green-500', cost: 100 },
    { type: Tool.COMMERCIAL, label: 'Commercial', icon: '🏢', color: 'bg-blue-500', cost: 150 },
    { type: Tool.INDUSTRIAL, label: 'Industrial', icon: '🏭', color: 'bg-gray-500', cost: 200 },
  ];

  const blockZoneTools = [
    { type: Tool.RESIDENTIAL_2X2, label: 'Residential Block', icon: '🏘️', color: 'bg-green-600', cost: 400 },
    { type: Tool.COMMERCIAL_2X2, label: 'Commercial Block', icon: '🏬', color: 'bg-blue-600', cost: 600 },
    { type: Tool.INDUSTRIAL_2X2, label: 'Industrial Block', icon: '🏭', color: 'bg-gray-600', cost: 800 },
  ];

  const buildingTools = [
    { type: Tool.HOUSE, label: 'House', icon: '🏘️', color: 'bg-green-400', cost: 200, category: 'residential' },
    { type: Tool.APARTMENT, label: 'Apartment', icon: '🏬', color: 'bg-green-500', cost: 350, category: 'residential' },
    { type: Tool.VILLA, label: 'Villa', icon: '🏰', color: 'bg-green-600', cost: 500, category: 'residential' },
    { type: Tool.SHOP, label: 'Shop', icon: '🏪', color: 'bg-blue-400', cost: 300, category: 'commercial' },
    { type: Tool.OFFICE, label: 'Office', icon: '🏢', color: 'bg-blue-500', cost: 450, category: 'commercial' },
    { type: Tool.MALL, label: 'Mall', icon: '🏬', color: 'bg-blue-600', cost: 800, category: 'commercial' },
    { type: Tool.FACTORY, label: 'Factory', icon: '🏭', color: 'bg-gray-500', cost: 600, category: 'industrial' },
    { type: Tool.WAREHOUSE, label: 'Warehouse', icon: '🏗️', color: 'bg-gray-400', cost: 400, category: 'industrial' },
    { type: Tool.POWERPLANT, label: 'Power Plant', icon: '⚡', color: 'bg-yellow-500', cost: 1000, category: 'industrial' },
  ];

  const infrastructureTools = [
    { type: Tool.ROAD, label: 'Road', icon: '🛣️', color: 'bg-yellow-600', cost: 10 },
    { type: Tool.POWER, label: 'Power', icon: '⚡', color: 'bg-yellow-400', cost: 20 },
    { type: Tool.WATER, label: 'Water', icon: '💧', color: 'bg-blue-400', cost: 15 },
  ];

  const serviceTools = [
    { type: Tool.PARK, label: 'Park', icon: '🌳', color: 'bg-green-700', cost: 500, category: 'service' },
    { type: Tool.SCHOOL, label: 'School', icon: '🏫', color: 'bg-purple-500', cost: 2000, category: 'service' },
    { type: Tool.HOSPITAL, label: 'Hospital', icon: '🏥', color: 'bg-red-500', cost: 3000, category: 'service' },
    { type: Tool.POWERPLANT, label: 'Power Plant', icon: '⚡', color: 'bg-yellow-600', cost: 5000, category: 'service' },
  ];

  const getCurrentTools = () => {
    switch (activeTab) {
      case 'zones': return zoneTools;
      case 'blocks': return blockZoneTools;
      case 'buildings': return buildingTools;
      case 'infrastructure': return infrastructureTools;
      case 'services': return serviceTools;
      default: return zoneTools;
    }
  };

  const handleDragStart = (e: React.DragEvent, tool: any) => {
    e.dataTransfer.setData('tool', JSON.stringify(tool));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 max-w-80">
        {/* Money Display */}
        <div className="mb-4 text-center">
          <div className="text-green-400 font-bold text-lg">
            💰 ${money.toLocaleString()}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 bg-gray-700 rounded-lg p-1">
          {[
            { id: 'zones', label: 'Zones', icon: '🏠' },
            { id: 'blocks', label: 'Blocks', icon: '🏘️' },
            { id: 'buildings', label: 'Buildings', icon: '🏢' },
            { id: 'infrastructure', label: 'Roads', icon: '🛣️' },
            { id: 'services', label: 'Services', icon: '🏥' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 px-2 py-2 rounded text-xs font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-gray-600 text-white' 
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{tab.icon}</span>
                <span className="text-xs">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tool Selection */}
        <div className="grid grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto">
          {getCurrentTools().map((tool) => (
            <div
              key={tool.type}
              draggable
              onDragStart={(e) => handleDragStart(e, tool)}
              onClick={() => setSelectedTool(tool.type)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing
                ${selectedTool === tool.type 
                  ? `${tool.color} border-white text-white` 
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }
                ${money < tool.cost ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={`${tool.label} - $${tool.cost} (Click to select or drag to place)`}
            >
              <span className="text-lg mb-1">{tool.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">{tool.label}</span>
              <span className="text-xs text-gray-400">${tool.cost}</span>
            </div>
          ))}
        </div>

        {/* Drag instruction */}
        <div className="text-xs text-gray-500 text-center mb-3 border-t border-gray-600 pt-2">
          💡 Click to select tool or drag buildings directly to the city grid
        </div>

        {/* Simulation Controls */}
        <div>
          <button
            onClick={toggleSimulation}
            className={`
              w-full py-2 px-4 rounded-lg font-medium transition-colors
              ${isRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
              }
            `}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Start'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
