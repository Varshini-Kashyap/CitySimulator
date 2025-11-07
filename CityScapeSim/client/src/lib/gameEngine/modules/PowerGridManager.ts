import { GridCell, PowerNode, PowerGrid, PowerConnection, BuildingType } from "../types";
import { Building } from "./Building";
import { Zone } from "./Zone";
import { calculateDistance } from "../utils";

export class PowerGridManager {
  private static readonly POWER_TRANSMISSION_RANGE = 8; // Maximum distance for power transmission
  private static readonly POWER_LINE_EFFICIENCY = 0.95; // 95% efficiency for power lines
  private static readonly BASE_POWER_DEMAND = 10; // Base power demand per building
  private static readonly POWERPLANT_CAPACITY = 1000; // Power plant capacity
  private static readonly POWER_OVERLOAD_THRESHOLD = 0.9; // 90% capacity triggers overload

  /**
   * Calculate power distribution across the city
   */
  static calculatePowerDistribution(grid: GridCell[][]): PowerGrid {
    const nodes = this.buildPowerNodes(grid);
    const connections = this.buildPowerConnections(nodes, grid);
    
    // Simulate power flow
    this.simulatePowerFlow(nodes, connections);
    
    // Calculate grid statistics
    const totalCapacity = nodes
      .filter(node => node.type === 'source')
      .reduce((sum, node) => sum + node.capacity, 0);
    
    const totalDemand = nodes
      .filter(node => node.type === 'consumer')
      .reduce((sum, node) => sum + node.demand, 0);
    
    const efficiency = totalCapacity > 0 ? Math.min(1, totalDemand / totalCapacity) : 0;
    
    return {
      nodes,
      connections,
      totalCapacity,
      totalDemand,
      efficiency
    };
  }

  /**
   * Build power nodes from grid cells
   */
  private static buildPowerNodes(grid: GridCell[][]): PowerNode[] {
    const nodes: PowerNode[] = [];
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        
        // Add power plant as source node
        if (cell.building && this.isPowerSource(cell.building)) {
          nodes.push({
            id: `power_source_${x}_${y}`,
            x,
            y,
            type: 'source',
            capacity: this.getPowerSourceCapacity(cell.building),
            demand: 0,
            connected: true,
            powerSource: `power_source_${x}_${y}`
          });
        }
        
        // Add buildings as consumer nodes
        if (cell.building && this.isPowerConsumer(cell.building)) {
          nodes.push({
            id: `power_consumer_${x}_${y}`,
            x,
            y,
            type: 'consumer',
            capacity: 0,
            demand: this.getBuildingPowerDemand(cell.building),
            connected: false,
            powerSource: null
          });
        }
      }
    }
    
    return nodes;
  }

  /**
   * Build power connections between nodes
   */
  private static buildPowerConnections(nodes: PowerNode[], grid: GridCell[][]): PowerConnection[] {
    const connections: PowerConnection[] = [];
    const powerSources = nodes.filter(node => node.type === 'source');
    const consumers = nodes.filter(node => node.type === 'consumer');
    
    // Connect consumers to nearest power sources through power lines
    for (const consumer of consumers) {
      const nearestSource = this.findNearestPowerSource(consumer, powerSources, grid);
      
      if (nearestSource && this.canTransmitPower(consumer, nearestSource, grid)) {
        const distance = calculateDistance(consumer.x, consumer.y, nearestSource.x, nearestSource.y);
        const efficiency = Math.max(0.1, this.POWER_LINE_EFFICIENCY - (distance * 0.01));
        
        connections.push({
          from: nearestSource.id,
          to: consumer.id,
          capacity: Math.min(nearestSource.capacity, consumer.demand),
          distance,
          efficiency
        });
        
        // Mark consumer as connected
        consumer.connected = true;
        consumer.powerSource = nearestSource.id;
      }
    }
    
    return connections;
  }

  /**
   * Simulate power flow through the grid
   */
  private static simulatePowerFlow(nodes: PowerNode[], connections: PowerConnection[]): void {
    // Reset all nodes
    nodes.forEach(node => {
      if (node.type === 'consumer') {
        node.connected = false;
        node.powerSource = null;
      }
    });
    
    // Process connections and distribute power
    for (const connection of connections) {
      const sourceNode = nodes.find(node => node.id === connection.from);
      const consumerNode = nodes.find(node => node.id === connection.to);
      
      if (sourceNode && consumerNode) {
        const availablePower = sourceNode.capacity;
        const requiredPower = consumerNode.demand;
        
        if (availablePower >= requiredPower) {
          // Sufficient power available
          consumerNode.connected = true;
          consumerNode.powerSource = sourceNode.id;
          sourceNode.capacity -= requiredPower;
        } else {
          // Insufficient power - partial connection
          consumerNode.connected = true;
          consumerNode.powerSource = sourceNode.id;
          consumerNode.demand = availablePower; // Reduce demand to available power
          sourceNode.capacity = 0;
        }
      }
    }
  }

  /**
   * Check if a building is a power source
   */
  private static isPowerSource(building: Building): boolean {
    return building.getBuildingType() === BuildingType.POWERPLANT;
  }

  /**
   * Check if a building consumes power
   */
  private static isPowerConsumer(building: Building): boolean {
    // All buildings except power plants consume power
    return building.getBuildingType() !== BuildingType.POWERPLANT;
  }

  /**
   * Get power source capacity
   */
  private static getPowerSourceCapacity(building: Building): number {
    if (building.getBuildingType() === BuildingType.POWERPLANT) {
      return this.POWERPLANT_CAPACITY;
    }
    return 0;
  }

  /**
   * Get building power demand
   */
  private static getBuildingPowerDemand(building: Building): number {
    const baseDemand = this.BASE_POWER_DEMAND;
    const sizeMultiplier = building.getSize() === 'small' ? 1 : 
                          building.getSize() === 'medium' ? 2 : 
                          building.getSize() === 'large' ? 4 : 6;
    
    // Service buildings have higher power demand
    if (building.isServiceBuilding()) {
      return baseDemand * sizeMultiplier * 2;
    }
    
    // Block buildings have higher power demand
    if (building.getIsBlock()) {
      return baseDemand * sizeMultiplier * 1.5;
    }
    
    return baseDemand * sizeMultiplier;
  }

  /**
   * Find nearest power source to a consumer
   */
  private static findNearestPowerSource(
    consumer: PowerNode, 
    sources: PowerNode[], 
    grid: GridCell[][]
  ): PowerNode | null {
    let nearestSource: PowerNode | null = null;
    let minDistance = Infinity;
    
    for (const source of sources) {
      const distance = calculateDistance(consumer.x, consumer.y, source.x, source.y);
      
      if (distance < minDistance && distance <= this.POWER_TRANSMISSION_RANGE) {
        minDistance = distance;
        nearestSource = source;
      }
    }
    
    return nearestSource;
  }

  /**
   * Check if power can be transmitted between two nodes
   */
  private static canTransmitPower(
    consumer: PowerNode, 
    source: PowerNode, 
    grid: GridCell[][]
  ): boolean {
    // Check if there's a continuous path of power lines between source and consumer
    return this.hasPowerLinePath(consumer.x, consumer.y, source.x, source.y, grid);
  }

  /**
   * Check if there's a continuous path of power lines between two points
   */
  private static hasPowerLinePath(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number, 
    grid: GridCell[][]
  ): boolean {
    // Simple pathfinding - check if there's a direct line of power infrastructure
    const dx = endX - startX;
    const dy = endY - startY;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(startX + (dx * i) / steps);
      const y = Math.round(startY + (dy * i) / steps);
      
      if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
        const cell = grid[y][x];
        if (!cell.infrastructure.includes('power')) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Update grid cells with power status
   */
  static updateGridPowerStatus(grid: GridCell[][], powerGrid: PowerGrid): void {
    // Reset all power status
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        grid[y][x].hasPower = false;
        grid[y][x].powerSource = null;
        grid[y][x].powerCapacity = 0;
        grid[y][x].powerDemand = 0;
      }
    }
    
    // Update with power grid data
    for (const node of powerGrid.nodes) {
      if (node.x >= 0 && node.x < grid[0].length && node.y >= 0 && node.y < grid.length) {
        const cell = grid[node.y][node.x];
        cell.hasPower = node.connected;
        cell.powerSource = node.powerSource || null;
        cell.powerCapacity = node.capacity;
        cell.powerDemand = node.demand;
      }
    }
  }

  /**
   * Check if a building has power
   */
  static hasBuildingPower(x: number, y: number, grid: GridCell[][]): boolean {
    if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
      return grid[y][x].hasPower || false;
    }
    return false;
  }

  /**
   * Get power grid efficiency
   */
  static getPowerGridEfficiency(powerGrid: PowerGrid): number {
    return powerGrid.efficiency;
  }

  /**
   * Check if power grid is overloaded
   */
  static isPowerGridOverloaded(powerGrid: PowerGrid): boolean {
    return powerGrid.efficiency > this.POWER_OVERLOAD_THRESHOLD;
  }

  /**
   * Get power shortage areas
   */
  static getPowerShortageAreas(powerGrid: PowerGrid): PowerNode[] {
    return powerGrid.nodes.filter(node => 
      node.type === 'consumer' && !node.connected
    );
  }
}

