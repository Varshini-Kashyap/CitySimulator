import { GridCell, Building, ZoneType, GridPosition } from "./types";
import { 
  GRID_WIDTH, 
  GRID_HEIGHT, 
  getZoneColor, 
  getBuildingColor, 
  getInfrastructureColor,
  hasInfrastructure,
  getRoadConnections,
  RoadConnections
} from "./utils";

export class CityRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasSize: { width: number; height: number };
  private cellWidth: number;
  private cellHeight: number;

  constructor(ctx: CanvasRenderingContext2D, canvasSize: { width: number; height: number }) {
    this.ctx = ctx;
    this.canvasSize = canvasSize;
    this.cellWidth = canvasSize.width / GRID_WIDTH;
    this.cellHeight = canvasSize.height / GRID_HEIGHT;
  }

  render(grid: GridCell[][], happiness: number, pollution: number): void {
    this.clear();
    this.drawGrid(grid);
    this.drawInfrastructure(grid);
    this.drawBuildings(grid);
    this.drawConnectivityOverlay(grid);
    this.drawInfrastructureStatusIndicators(grid);
    this.drawHappinessOverlay(grid);
    this.drawGridLines();
  }

  private clear(): void {
    this.ctx.fillStyle = '#1F2937';
    this.ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
  }

  private drawGrid(grid: GridCell[][]): void {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        const cellX = x * this.cellWidth;
        const cellY = y * this.cellHeight;

        // Draw zone background
        if (cell.zoneType) {
          this.ctx.fillStyle = getZoneColor(cell.zoneType);
          this.ctx.globalAlpha = 0.3;
          this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);
          this.ctx.globalAlpha = 1.0;
          
          // Draw 2x2 block zone borders
          if (cell.isBlockZone && cell.blockZoneX === x && cell.blockZoneY === y) {
            this.drawBlockZoneBorder(x, y, getZoneColor(cell.zoneType));
          }
        }
      }
    }
  }

  private drawInfrastructure(grid: GridCell[][]): void {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        const cellX = x * this.cellWidth;
        const cellY = y * this.cellHeight;
        const centerX = cellX + this.cellWidth / 2;
        const centerY = cellY + this.cellHeight / 2;

        // Draw roads with connections
        if (hasInfrastructure(cell, 'road')) {
          const connections = getRoadConnections(x, y, grid);
          this.drawRoadWithConnections(x, y, connections, cellX, cellY);
        }

        // Draw power lines with connections
        if (hasInfrastructure(cell, 'power')) {
          this.drawPowerLines(x, y, cell, cellX, cellY, centerX, centerY, grid);
        }

        // Draw water pipes
        if (hasInfrastructure(cell, 'water')) {
          this.ctx.strokeStyle = getInfrastructureColor('water');
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(centerX, cellY);
          this.ctx.lineTo(centerX, cellY + this.cellHeight);
          this.ctx.stroke();
        }
      }
    }
  }

  private drawBuildings(grid: GridCell[][]): void {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        if (!cell.building) continue;

        const cellX = x * this.cellWidth;
        const cellY = y * this.cellHeight;
        const building = cell.building;
        
        // Calculate building size based on type
        let buildingWidth = this.cellWidth * 0.6;
        let buildingHeight = this.cellHeight * 0.6;
        
        // Handle 2x2 block buildings
        if (building.isBlock && building.blockWidth && building.blockHeight) {
          buildingWidth = this.cellWidth * building.blockWidth * 0.8;
          buildingHeight = this.cellHeight * building.blockHeight * 0.8;
        } else {
          switch (building.size) {
            case 'medium':
              buildingWidth = this.cellWidth * 0.7;
              buildingHeight = this.cellHeight * 0.7;
              break;
            case 'large':
              buildingWidth = this.cellWidth * 0.8;
              buildingHeight = this.cellHeight * 0.8;
              break;
            case 'block_2x2':
              buildingWidth = this.cellWidth * 2 * 0.8;
              buildingHeight = this.cellHeight * 2 * 0.8;
              break;
          }
        }

        const buildingX = cellX + (this.cellWidth - buildingWidth) / 2;
        const buildingY = cellY + (this.cellHeight - buildingHeight) / 2;

        // Draw building shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(buildingX + 2, buildingY + 2, buildingWidth, buildingHeight);

        // Draw building
        this.ctx.fillStyle = getBuildingColor(building);
        this.ctx.fillRect(buildingX, buildingY, buildingWidth, buildingHeight);

        // Draw building outline
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(buildingX, buildingY, buildingWidth, buildingHeight);

        // Draw building details based on type
        // Draw building details
        if (building.isBlock && building.blockWidth && building.blockHeight) {
          this.drawBlockBuildingDetails(building, buildingX, buildingY, buildingWidth, buildingHeight);
        } else {
          this.drawBuildingDetails(building, buildingX, buildingY, buildingWidth, buildingHeight);
        }
      }
    }
  }

  private drawBuildingDetails(
    building: Building, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): void {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Handle service buildings first
    if (building.buildingType) {
      this.drawServiceBuildingDetails(building, x, y, width, height);
      return;
    }
    
    // Handle zone-based buildings
    switch (building.type) {
      case ZoneType.RESIDENTIAL:
        // Draw windows for residential
        const windowSize = Math.min(width, height) / 8;
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            this.ctx.fillRect(
              x + width * 0.25 + i * width * 0.35,
              y + height * 0.25 + j * height * 0.35,
              windowSize,
              windowSize
            );
          }
        }
        break;
        
      case ZoneType.COMMERCIAL:
        // Draw storefront for commercial
        this.ctx.fillRect(x + width * 0.1, y + height * 0.7, width * 0.8, height * 0.2);
        break;
        
      case ZoneType.INDUSTRIAL:
        // Draw smokestacks for industrial
        if (building.size !== 'small') {
          this.ctx.fillStyle = '#4B5563';
          this.ctx.fillRect(x + width * 0.8, y - height * 0.2, width * 0.15, height * 0.4);
        }
        break;
    }
  }

  private drawBlockBuildingDetails(building: Building, x: number, y: number, width: number, height: number): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const iconSize = Math.min(width, height) * 0.3;

    // Draw block building icon
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = `${iconSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    switch (building.buildingType) {
      case 'residential_block':
        this.ctx.fillText('🏘️', centerX, centerY);
        break;
      case 'commercial_block':
        this.ctx.fillText('🏬', centerX, centerY);
        break;
      case 'industrial_block':
        this.ctx.fillText('🏭', centerX, centerY);
        break;
      default:
        this.ctx.fillText('🏢', centerX, centerY);
        break;
    }

    // Draw block size indicator
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = `${iconSize * 0.3}px Arial`;
    this.ctx.fillText('2x2', centerX, centerY + iconSize * 0.4);
  }

  private drawServiceBuildingDetails(
    building: Building, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const iconSize = Math.min(width, height) * 0.4;

    switch (building.buildingType) {
      case 'park':
        // Draw tree icon for park
        this.ctx.fillStyle = '#22C55E'; // Green
        // Tree trunk
        this.ctx.fillRect(centerX - width * 0.05, centerY + height * 0.1, width * 0.1, height * 0.3);
        // Tree canopy
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - height * 0.1, iconSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'school':
        // Draw book icon for school
        this.ctx.fillStyle = '#3B82F6'; // Blue
        // Book base
        this.ctx.fillRect(centerX - width * 0.2, centerY - height * 0.15, width * 0.4, height * 0.3);
        // Book pages
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 3; i++) {
          this.ctx.fillRect(
            centerX - width * 0.15 + i * width * 0.05, 
            centerY - height * 0.1, 
            width * 0.02, 
            height * 0.2
          );
        }
        break;
        
      case 'hospital':
        // Draw red cross icon for hospital
        this.ctx.fillStyle = '#EF4444'; // Red
        // Cross horizontal
        this.ctx.fillRect(centerX - width * 0.2, centerY - height * 0.05, width * 0.4, height * 0.1);
        // Cross vertical
        this.ctx.fillRect(centerX - width * 0.05, centerY - height * 0.2, width * 0.1, height * 0.4);
        break;
        
      case 'powerplant':
        // Draw industrial smokestack icon for power plant
        this.ctx.fillStyle = '#6B7280'; // Gray
        // Main building
        this.ctx.fillRect(centerX - width * 0.3, centerY - height * 0.1, width * 0.6, height * 0.2);
        // Smokestack
        this.ctx.fillRect(centerX - width * 0.05, centerY - height * 0.3, width * 0.1, height * 0.4);
        // Smoke
        this.ctx.fillStyle = 'rgba(107, 114, 128, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - height * 0.35, width * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
        break;
    }
  }

  private drawPowerLines(x: number, y: number, cell: GridCell, cellX: number, cellY: number, centerX: number, centerY: number, grid: GridCell[][]): void {
    const powerConnections = this.getPowerConnections(x, y, grid);
    const connectionCount = (powerConnections.north ? 1 : 0) + 
                          (powerConnections.south ? 1 : 0) + 
                          (powerConnections.east ? 1 : 0) + 
                          (powerConnections.west ? 1 : 0);

    this.ctx.strokeStyle = getInfrastructureColor('power');
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    if (connectionCount === 0) {
      // Isolated power line - draw a small circle
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Draw power line connections
      this.ctx.beginPath();
      
      if (powerConnections.north) {
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX, cellY);
      }
      if (powerConnections.south) {
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX, cellY + this.cellHeight);
      }
      if (powerConnections.east) {
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(cellX + this.cellWidth, centerY);
      }
      if (powerConnections.west) {
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(cellX, centerY);
      }
      
      this.ctx.stroke();
      
      // Draw center node
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private getPowerConnections(x: number, y: number, grid: GridCell[][]): { north: boolean; south: boolean; east: boolean; west: boolean } {
    return {
      north: y > 0 && hasInfrastructure(grid[y - 1][x], 'power'),
      south: y < GRID_HEIGHT - 1 && hasInfrastructure(grid[y + 1][x], 'power'),
      east: x < GRID_WIDTH - 1 && hasInfrastructure(grid[y][x + 1], 'power'),
      west: x > 0 && hasInfrastructure(grid[y][x - 1], 'power')
    };
  }

  private drawConnectivityOverlay(grid: GridCell[][]): void {
    this.ctx.globalAlpha = 0.2;
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        const cellX = x * this.cellWidth;
        const cellY = y * this.cellHeight;
        
        if (cell.building && cell.connectivityStatus) {
          switch (cell.connectivityStatus) {
            case 'bright':
              // Fully connected - bright green glow
              this.ctx.fillStyle = '#10B981';
              this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);
              break;
            case 'dim':
              // Partially connected - yellow/orange glow
              this.ctx.fillStyle = '#F59E0B';
              this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);
              break;
            case 'dark':
              // Poorly connected - red overlay
              this.ctx.fillStyle = '#EF4444';
              this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);
              break;
          }
        }
      }
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  private drawInfrastructureStatusIndicators(grid: GridCell[][]): void {
    this.ctx.globalAlpha = 0.8;
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        if (cell.building) {
          const cellX = x * this.cellWidth;
          const cellY = y * this.cellHeight;
          const centerX = cellX + this.cellWidth / 2;
          const centerY = cellY + this.cellHeight / 2;
          
          // Draw infrastructure status indicators
          this.drawInfrastructureIndicator(centerX - 8, centerY - 8, cell.hasRoad, 'road');
          this.drawInfrastructureIndicator(centerX + 2, centerY - 8, cell.hasPower, 'power');
          this.drawInfrastructureIndicator(centerX - 3, centerY + 2, cell.hasWater, 'water');
        }
      }
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  private drawInfrastructureIndicator(x: number, y: number, isConnected: boolean, type: 'road' | 'power' | 'water'): void {
    const size = 4;
    const color = isConnected ? '#10B981' : '#EF4444'; // Green if connected, red if not
    
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    
    switch (type) {
      case 'road':
        // Square for road
        this.ctx.fillRect(x, y, size, size);
        break;
      case 'power':
        // Circle for power
        this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'water':
        // Triangle for water
        this.ctx.moveTo(x + size/2, y);
        this.ctx.lineTo(x, y + size);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.closePath();
        this.ctx.fill();
        break;
    }
  }

  private drawPowerOverlay(grid: GridCell[][]): void {
    this.ctx.globalAlpha = 0.15;
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        const cellX = x * this.cellWidth;
        const cellY = y * this.cellHeight;
        
        if (cell.building) {
          if (cell.hasPower) {
            // Powered building - subtle blue glow
            this.ctx.fillStyle = '#3B82F6';
            this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);
          } else {
            // Unpowered building - red overlay
            this.ctx.fillStyle = '#EF4444';
            this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);
          }
        }
      }
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  private drawHappinessOverlay(grid: GridCell[][]): void {
    this.ctx.globalAlpha = 0.2;
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = grid[y][x];
        const cellX = x * this.cellWidth;
        const cellY = y * this.cellHeight;
        
        // Color based on happiness level
        if (cell.happiness >= 70) {
          this.ctx.fillStyle = '#10B981'; // Green
        } else if (cell.happiness >= 40) {
          this.ctx.fillStyle = '#F59E0B'; // Yellow
        } else {
          this.ctx.fillStyle = '#EF4444'; // Red
        }
        
        if (cell.building || cell.zoneType) {
          this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);
        }
      }
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  private drawBlockZoneBorder(x: number, y: number, color: string): void {
    this.ctx.strokeStyle = this.darkenColor(color, 0.3);
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(
      x * this.cellWidth, 
      y * this.cellHeight, 
      this.cellWidth * 2, 
      this.cellHeight * 2
    );
    
    // Add corner indicators
    this.ctx.fillStyle = this.darkenColor(color, 0.5);
    const cornerSize = 4;
    this.ctx.fillRect(x * this.cellWidth, y * this.cellHeight, cornerSize, cornerSize);
    this.ctx.fillRect((x + 2) * this.cellWidth - cornerSize, y * this.cellHeight, cornerSize, cornerSize);
    this.ctx.fillRect(x * this.cellWidth, (y + 2) * this.cellHeight - cornerSize, cornerSize, cornerSize);
    this.ctx.fillRect((x + 2) * this.cellWidth - cornerSize, (y + 2) * this.cellHeight - cornerSize, cornerSize, cornerSize);
  }

  private darkenColor(color: string, factor: number): string {
    // Simple color darkening for borders
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }

  private drawRoadWithConnections(x: number, y: number, connections: RoadConnections, cellX: number, cellY: number): void {
    const centerX = cellX + this.cellWidth / 2;
    const centerY = cellY + this.cellHeight / 2;
    const roadWidth = Math.min(this.cellWidth, this.cellHeight) * 0.15; // 15% of cell size
    
    this.ctx.strokeStyle = getInfrastructureColor('road');
    this.ctx.fillStyle = getInfrastructureColor('road');
    this.ctx.lineWidth = roadWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Count connections
    const connectionCount = (connections.north ? 1 : 0) + 
                          (connections.south ? 1 : 0) + 
                          (connections.east ? 1 : 0) + 
                          (connections.west ? 1 : 0);

    if (connectionCount === 0) {
      // Isolated road - draw a small square
      this.drawIsolatedRoad(centerX, centerY, roadWidth);
    } else if (connectionCount === 1) {
      // Dead end - draw line to edge
      this.drawDeadEndRoad(connections, centerX, centerY, roadWidth);
    } else if (connectionCount === 2) {
      // Straight road or corner
      if ((connections.north && connections.south) || (connections.east && connections.west)) {
        this.drawStraightRoad(connections, centerX, centerY, roadWidth);
      } else {
        this.drawCornerRoad(connections, centerX, centerY, roadWidth);
      }
    } else if (connectionCount === 3) {
      // T-junction
      this.drawTJunction(connections, centerX, centerY, roadWidth);
    } else {
      // Four-way intersection
      this.drawIntersection(centerX, centerY, roadWidth);
    }
  }

  private drawIsolatedRoad(centerX: number, centerY: number, roadWidth: number): void {
    const size = roadWidth * 2;
    this.ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
  }

  private drawDeadEndRoad(connections: RoadConnections, centerX: number, centerY: number, roadWidth: number): void {
    this.ctx.beginPath();
    
    if (connections.north) {
      this.ctx.moveTo(centerX, centerY + roadWidth/2);
      this.ctx.lineTo(centerX, centerY - this.cellHeight/2);
    } else if (connections.south) {
      this.ctx.moveTo(centerX, centerY - roadWidth/2);
      this.ctx.lineTo(centerX, centerY + this.cellHeight/2);
    } else if (connections.east) {
      this.ctx.moveTo(centerX - roadWidth/2, centerY);
      this.ctx.lineTo(centerX + this.cellWidth/2, centerY);
    } else if (connections.west) {
      this.ctx.moveTo(centerX + roadWidth/2, centerY);
      this.ctx.lineTo(centerX - this.cellWidth/2, centerY);
    }
    
    this.ctx.stroke();
    
    // Draw dead end cap
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, roadWidth/2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawStraightRoad(connections: RoadConnections, centerX: number, centerY: number, roadWidth: number): void {
    this.ctx.beginPath();
    
    if (connections.north && connections.south) {
      // Vertical straight road
      this.ctx.moveTo(centerX, centerY - this.cellHeight/2);
      this.ctx.lineTo(centerX, centerY + this.cellHeight/2);
    } else {
      // Horizontal straight road
      this.ctx.moveTo(centerX - this.cellWidth/2, centerY);
      this.ctx.lineTo(centerX + this.cellWidth/2, centerY);
    }
    
    this.ctx.stroke();
  }

  private drawCornerRoad(connections: RoadConnections, centerX: number, centerY: number, roadWidth: number): void {
    this.ctx.beginPath();
    
    if (connections.north && connections.east) {
      // Top-right corner
      this.ctx.moveTo(centerX, centerY - this.cellHeight/2);
      this.ctx.lineTo(centerX, centerY);
      this.ctx.lineTo(centerX + this.cellWidth/2, centerY);
    } else if (connections.north && connections.west) {
      // Top-left corner
      this.ctx.moveTo(centerX, centerY - this.cellHeight/2);
      this.ctx.lineTo(centerX, centerY);
      this.ctx.lineTo(centerX - this.cellWidth/2, centerY);
    } else if (connections.south && connections.east) {
      // Bottom-right corner
      this.ctx.moveTo(centerX, centerY + this.cellHeight/2);
      this.ctx.lineTo(centerX, centerY);
      this.ctx.lineTo(centerX + this.cellWidth/2, centerY);
    } else if (connections.south && connections.west) {
      // Bottom-left corner
      this.ctx.moveTo(centerX, centerY + this.cellHeight/2);
      this.ctx.lineTo(centerX, centerY);
      this.ctx.lineTo(centerX - this.cellWidth/2, centerY);
    }
    
    this.ctx.stroke();
  }

  private drawTJunction(connections: RoadConnections, centerX: number, centerY: number, roadWidth: number): void {
    this.ctx.beginPath();
    
    if (!connections.north) {
      // T pointing down
      this.ctx.moveTo(centerX - this.cellWidth/2, centerY);
      this.ctx.lineTo(centerX + this.cellWidth/2, centerY);
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX, centerY + this.cellHeight/2);
    } else if (!connections.south) {
      // T pointing up
      this.ctx.moveTo(centerX - this.cellWidth/2, centerY);
      this.ctx.lineTo(centerX + this.cellWidth/2, centerY);
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX, centerY - this.cellHeight/2);
    } else if (!connections.east) {
      // T pointing left
      this.ctx.moveTo(centerX, centerY - this.cellHeight/2);
      this.ctx.lineTo(centerX, centerY + this.cellHeight/2);
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX - this.cellWidth/2, centerY);
    } else if (!connections.west) {
      // T pointing right
      this.ctx.moveTo(centerX, centerY - this.cellHeight/2);
      this.ctx.lineTo(centerX, centerY + this.cellHeight/2);
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX + this.cellWidth/2, centerY);
    }
    
    this.ctx.stroke();
  }

  private drawIntersection(centerX: number, centerY: number, roadWidth: number): void {
    this.ctx.beginPath();
    
    // Draw cross intersection
    this.ctx.moveTo(centerX - this.cellWidth/2, centerY);
    this.ctx.lineTo(centerX + this.cellWidth/2, centerY);
    this.ctx.moveTo(centerX, centerY - this.cellHeight/2);
    this.ctx.lineTo(centerX, centerY + this.cellHeight/2);
    
    this.ctx.stroke();
    
    // Draw center circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, roadWidth/2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawGridLines(): void {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= GRID_WIDTH; x++) {
      const xPos = x * this.cellWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos, 0);
      this.ctx.lineTo(xPos, this.canvasSize.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      const yPos = y * this.cellHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(this.canvasSize.width, yPos);
      this.ctx.stroke();
    }
  }

  screenToGrid(screenX: number, screenY: number): GridPosition | null {
    const gridX = Math.floor(screenX / this.cellWidth);
    const gridY = Math.floor(screenY / this.cellHeight);
    
    if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
      return { x: gridX, y: gridY };
    }
    
    return null;
  }

  gridToScreen(gridX: number, gridY: number): { x: number, y: number } {
    return {
      x: gridX * this.cellWidth,
      y: gridY * this.cellHeight
    };
  }
}
