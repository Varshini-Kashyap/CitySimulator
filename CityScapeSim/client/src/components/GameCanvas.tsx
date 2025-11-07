import React, { useRef, useEffect } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useCityStore } from "../lib/stores/useCityStore";
import { CityRenderer } from "../lib/gameEngine/CityRenderer";
import { ZoneType, Tool } from "../lib/gameEngine/types";

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CityRenderer | null>(null);
  
  const { 
    grid, 
    selectedTool, 
    isBuilding, 
    setBuilding, 
    addZone, 
    addZoneBlock,
    addInfrastructure,
    addBuilding,
    happiness,
    pollution 
  } = useCityStore();

  // Initialize canvas and renderer
  const { canvasSize } = useCanvas(canvasRef);

  useEffect(() => {
    if (!canvasRef.current || canvasSize.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new CityRenderer(ctx, canvasSize);
  }, [canvasSize]);

  // Animation loop
  useEffect(() => {
    if (!rendererRef.current) return;

    let animationId: number;
    
    const animate = () => {
      if (rendererRef.current) {
        rendererRef.current.render(grid, happiness, pollution);
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [grid, happiness, pollution]);

  // Mouse handling
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!rendererRef.current) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const gridPos = rendererRef.current.screenToGrid(x, y);
    if (!gridPos) return;

    setBuilding(true);
    handleCellAction(gridPos.x, gridPos.y);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isBuilding || !rendererRef.current) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const gridPos = rendererRef.current.screenToGrid(x, y);
    if (!gridPos) return;

    handleCellAction(gridPos.x, gridPos.y);
  };

  const handleMouseUp = () => {
    setBuilding(false);
  };

  const handleCellAction = (x: number, y: number) => {
    // Handle different tool types
    if (selectedTool === Tool.RESIDENTIAL) {
      addZone(x, y, ZoneType.RESIDENTIAL);
    } else if (selectedTool === Tool.COMMERCIAL) {
      addZone(x, y, ZoneType.COMMERCIAL);
    } else if (selectedTool === Tool.INDUSTRIAL) {
      addZone(x, y, ZoneType.INDUSTRIAL);
    } else if (selectedTool === Tool.RESIDENTIAL_2X2) {
      addZoneBlock(x, y, ZoneType.RESIDENTIAL);
    } else if (selectedTool === Tool.COMMERCIAL_2X2) {
      addZoneBlock(x, y, ZoneType.COMMERCIAL);
    } else if (selectedTool === Tool.INDUSTRIAL_2X2) {
      addZoneBlock(x, y, ZoneType.INDUSTRIAL);
    } else if (selectedTool === Tool.ROAD) {
      addInfrastructure(x, y, 'road');
    } else if (selectedTool === Tool.POWER) {
      addInfrastructure(x, y, 'power');
    } else if (selectedTool === Tool.WATER) {
      addInfrastructure(x, y, 'water');
    } else {
      // Handle specific building tools
      const buildingCosts = {
        [Tool.HOUSE]: 200,
        [Tool.APARTMENT]: 350,
        [Tool.VILLA]: 500,
        [Tool.SHOP]: 300,
        [Tool.OFFICE]: 450,
        [Tool.MALL]: 800,
        [Tool.FACTORY]: 600,
        [Tool.WAREHOUSE]: 400,
        [Tool.POWERPLANT]: 5000,
        [Tool.HOSPITAL]: 3000,
        [Tool.SCHOOL]: 2000,
        [Tool.POLICE]: 500,
        [Tool.PARK]: 500,
      };
      
      const cost = buildingCosts[selectedTool as keyof typeof buildingCosts];
      if (cost) {
        addBuilding(x, y, selectedTool, cost);
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    if (!rendererRef.current) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const gridPos = rendererRef.current.screenToGrid(x, y);
    if (!gridPos) return;

    try {
      const toolData = JSON.parse(event.dataTransfer.getData('tool'));
      if (toolData && toolData.type) {
        // Place the dragged building directly
        const cost = toolData.cost || 0;
        
        if (toolData.type === Tool.ROAD) {
          addInfrastructure(gridPos.x, gridPos.y, 'road');
        } else if (toolData.type === Tool.POWER) {
          addInfrastructure(gridPos.x, gridPos.y, 'power');
        } else if (toolData.type === Tool.WATER) {
          addInfrastructure(gridPos.x, gridPos.y, 'water');
        } else if (toolData.type === Tool.RESIDENTIAL) {
          addZone(gridPos.x, gridPos.y, ZoneType.RESIDENTIAL);
        } else if (toolData.type === Tool.COMMERCIAL) {
          addZone(gridPos.x, gridPos.y, ZoneType.COMMERCIAL);
        } else if (toolData.type === Tool.INDUSTRIAL) {
          addZone(gridPos.x, gridPos.y, ZoneType.INDUSTRIAL);
        } else if (toolData.type === Tool.RESIDENTIAL_2X2) {
          addZoneBlock(gridPos.x, gridPos.y, ZoneType.RESIDENTIAL);
        } else if (toolData.type === Tool.COMMERCIAL_2X2) {
          addZoneBlock(gridPos.x, gridPos.y, ZoneType.COMMERCIAL);
        } else if (toolData.type === Tool.INDUSTRIAL_2X2) {
          addZoneBlock(gridPos.x, gridPos.y, ZoneType.INDUSTRIAL);
        } else {
          // It's a specific building
          addBuilding(gridPos.x, gridPos.y, toolData.type, cost);
        }
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    />
  );
};

export default GameCanvas;
