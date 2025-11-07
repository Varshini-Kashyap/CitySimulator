import { ZoneType } from "../types";
import { Building } from "./Building";
import { Zone } from "./Zone";

export enum WeatherType {
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  STORMY = 'stormy',
  FOGGY = 'foggy'
}

export interface WeatherEffect {
  type: WeatherType;
  duration: number;
  happinessModifier: number;
  pollutionModifier: number;
  growthModifier: number;
  description: string;
}

export class WeatherManager {
  private static readonly WEATHER_EFFECTS: Record<WeatherType, WeatherEffect> = {
    [WeatherType.SUNNY]: {
      type: WeatherType.SUNNY,
      duration: 5,
      happinessModifier: 5,
      pollutionModifier: -2,
      growthModifier: 1.2,
      description: 'Beautiful sunny weather boosts city morale'
    },
    [WeatherType.CLOUDY]: {
      type: WeatherType.CLOUDY,
      duration: 3,
      happinessModifier: 0,
      pollutionModifier: 0,
      growthModifier: 1.0,
      description: 'Overcast skies have neutral effects'
    },
    [WeatherType.RAINY]: {
      type: WeatherType.RAINY,
      duration: 4,
      happinessModifier: -3,
      pollutionModifier: -5,
      growthModifier: 0.8,
      description: 'Rain reduces pollution but dampens spirits'
    },
    [WeatherType.STORMY]: {
      type: WeatherType.STORMY,
      duration: 2,
      happinessModifier: -8,
      pollutionModifier: -10,
      growthModifier: 0.5,
      description: 'Severe storms cause damage and reduce growth'
    },
    [WeatherType.FOGGY]: {
      type: WeatherType.FOGGY,
      duration: 3,
      happinessModifier: -2,
      pollutionModifier: 3,
      growthModifier: 0.9,
      description: 'Fog traps pollution and reduces visibility'
    }
  };

  private static currentWeather: WeatherType = WeatherType.SUNNY;
  private static weatherDuration: number = 5;
  private static weatherChangeChance: number = 0.3;

  /**
   * Get current weather
   */
  static getCurrentWeather(): WeatherType {
    return this.currentWeather;
  }

  /**
   * Get current weather effect
   */
  static getCurrentWeatherEffect(): WeatherEffect {
    return this.WEATHER_EFFECTS[this.currentWeather];
  }

  /**
   * Update weather for the next simulation step
   */
  static updateWeather(): void {
    this.weatherDuration--;
    
    // Change weather when duration expires or randomly
    if (this.weatherDuration <= 0 || Math.random() < this.weatherChangeChance) {
      this.changeWeather();
    }
  }

  /**
   * Change to a new weather type
   */
  private static changeWeather(): void {
    const weatherTypes = Object.values(WeatherType);
    const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    this.currentWeather = newWeather;
    this.weatherDuration = this.WEATHER_EFFECTS[newWeather].duration;
  }

  /**
   * Apply weather effects to building happiness
   */
  static applyWeatherHappinessEffect(building: Building): void {
    const effect = this.getCurrentWeatherEffect();
    const currentHappiness = building.getHappiness();
    const newHappiness = Math.max(0, Math.min(100, currentHappiness + effect.happinessModifier));
    building.setHappiness(newHappiness);
  }

  /**
   * Apply weather effects to zone pollution
   */
  static applyWeatherPollutionEffect(zone: Zone): void {
    const effect = this.getCurrentWeatherEffect();
    const currentPollution = zone.getPollution();
    const newPollution = Math.max(0, Math.min(100, currentPollution + effect.pollutionModifier));
    zone.updatePollution(0, newPollution - currentPollution);
  }

  /**
   * Get weather-based growth modifier
   */
  static getGrowthModifier(): number {
    return this.getCurrentWeatherEffect().growthModifier;
  }

  /**
   * Check if weather conditions allow building growth
   */
  static canGrowInCurrentWeather(): boolean {
    const effect = this.getCurrentWeatherEffect();
    return Math.random() < effect.growthModifier;
  }

  /**
   * Apply weather effects to all zones and buildings
   */
  static applyWeatherEffects(zones: Zone[][]): void {
    for (let y = 0; y < zones.length; y++) {
      for (let x = 0; x < zones[y].length; x++) {
        const zone = zones[y][x];
        
        // Apply pollution effects
        this.applyWeatherPollutionEffect(zone);
        
        // Apply happiness effects to buildings
        const building = zone.getBuilding();
        if (building) {
          this.applyWeatherHappinessEffect(building);
        }
      }
    }
  }

  /**
   * Get weather forecast for next few turns
   */
  static getWeatherForecast(turns: number = 3): WeatherType[] {
    const forecast: WeatherType[] = [];
    let currentWeather = this.currentWeather;
    let remainingDuration = this.weatherDuration;
    
    for (let i = 0; i < turns; i++) {
      if (remainingDuration > 0) {
        forecast.push(currentWeather);
        remainingDuration--;
      } else {
        // Simulate weather change
        const weatherTypes = Object.values(WeatherType);
        currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        remainingDuration = this.WEATHER_EFFECTS[currentWeather].duration - 1;
        forecast.push(currentWeather);
      }
    }
    
    return forecast;
  }

  /**
   * Get weather statistics
   */
  static getWeatherStats(): {
    currentWeather: WeatherType;
    duration: number;
    effect: WeatherEffect;
    forecast: WeatherType[];
  } {
    return {
      currentWeather: this.currentWeather,
      duration: this.weatherDuration,
      effect: this.getCurrentWeatherEffect(),
      forecast: this.getWeatherForecast()
    };
  }

  /**
   * Force specific weather (for testing or special events)
   */
  static setWeather(weatherType: WeatherType, duration?: number): void {
    this.currentWeather = weatherType;
    this.weatherDuration = duration || this.WEATHER_EFFECTS[weatherType].duration;
  }

  /**
   * Check if weather is severe (affects gameplay significantly)
   */
  static isSevereWeather(): boolean {
    return this.currentWeather === WeatherType.STORMY;
  }

  /**
   * Get weather impact on specific zone types
   */
  static getZoneTypeWeatherImpact(zoneType: ZoneType): number {
    const effect = this.getCurrentWeatherEffect();
    
    switch (zoneType) {
      case ZoneType.RESIDENTIAL:
        // Residential zones are more sensitive to weather
        return effect.happinessModifier * 1.5;
      case ZoneType.COMMERCIAL:
        // Commercial zones are moderately affected
        return effect.happinessModifier;
      case ZoneType.INDUSTRIAL:
        // Industrial zones are less affected by weather
        return effect.happinessModifier * 0.5;
      default:
        return 0;
    }
  }
}

