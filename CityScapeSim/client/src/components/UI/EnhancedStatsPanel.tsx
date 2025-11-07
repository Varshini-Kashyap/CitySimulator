import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  CloudFog,
  Car,
  Zap,
  Droplets,
  TrendingUp,
  Users,
  Building2,
  DollarSign
} from "lucide-react";

interface WeatherStats {
  currentWeather: string;
  duration: number;
  effect: {
    description: string;
    happinessModifier: number;
    pollutionModifier: number;
    growthModifier: number;
  };
  forecast: string[];
}

interface TransportStats {
  averageConnectivity: number;
  wellConnectedZones: number;
  isolatedZones: number;
  totalInfrastructure: number;
  transportEfficiency: number;
}

interface EconomicStats {
  totalPopulation: number;
  totalTaxRevenue: number;
  employmentRate: number;
  averageIncome: number;
  cityRating: number;
  maintenanceCosts: number;
  infrastructureCosts: number;
}

interface EnhancedStatsPanelProps {
  weatherStats: WeatherStats;
  transportStats: TransportStats;
  economicStats: EconomicStats;
  happiness: number;
  pollution: number;
}

const getWeatherIcon = (weather: string) => {
  switch (weather) {
    case 'sunny':
      return <Sun className="h-4 w-4 text-yellow-500" />;
    case 'cloudy':
      return <Cloud className="h-4 w-4 text-gray-500" />;
    case 'rainy':
      return <CloudRain className="h-4 w-4 text-blue-500" />;
    case 'stormy':
      return <CloudLightning className="h-4 w-4 text-red-500" />;
    case 'foggy':
      return <CloudFog className="h-4 w-4 text-gray-400" />;
    default:
      return <Cloud className="h-4 w-4" />;
  }
};

const getWeatherColor = (weather: string) => {
  switch (weather) {
    case 'sunny':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cloudy':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rainy':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'stormy':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'foggy':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const EnhancedStatsPanel: React.FC<EnhancedStatsPanelProps> = ({
  weatherStats,
  transportStats,
  economicStats,
  happiness,
  pollution
}) => {
  return (
    <div className="absolute top-4 right-4 w-80 space-y-4 z-30">
      {/* Weather Card */}
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {getWeatherIcon(weatherStats.currentWeather)}
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={getWeatherColor(weatherStats.currentWeather)}>
              {weatherStats.currentWeather.charAt(0).toUpperCase() + weatherStats.currentWeather.slice(1)}
            </Badge>
            <span className="text-xs text-gray-600">
              {weatherStats.duration} turns left
            </span>
          </div>
          <p className="text-xs text-gray-600">{weatherStats.effect.description}</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium">Happiness</div>
              <div className={weatherStats.effect.happinessModifier >= 0 ? 'text-green-600' : 'text-red-600'}>
                {weatherStats.effect.happinessModifier >= 0 ? '+' : ''}{weatherStats.effect.happinessModifier}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Pollution</div>
              <div className={weatherStats.effect.pollutionModifier >= 0 ? 'text-red-600' : 'text-green-600'}>
                {weatherStats.effect.pollutionModifier >= 0 ? '+' : ''}{weatherStats.effect.pollutionModifier}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Growth</div>
              <div className="text-blue-600">
                {(weatherStats.effect.growthModifier * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transport Card */}
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-blue-500" />
            Transportation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Connectivity</span>
              <span>{transportStats.averageConnectivity.toFixed(1)}%</span>
            </div>
            <Progress value={transportStats.averageConnectivity} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-green-600">{transportStats.wellConnectedZones}</div>
              <div>Connected</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-red-600">{transportStats.isolatedZones}</div>
              <div>Isolated</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="h-3 w-3" />
            <span>Efficiency: {(transportStats.transportEfficiency * 100).toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Economy Card */}
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Economy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{economicStats.totalPopulation.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>${economicStats.totalTaxRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>{(economicStats.employmentRate).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{economicStats.cityRating}/100</span>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Income per capita:</span>
              <span>${economicStats.averageIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Maintenance costs:</span>
              <span>${economicStats.maintenanceCosts.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* City Health Card */}
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">City Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Happiness</span>
              <span>{happiness.toFixed(1)}%</span>
            </div>
            <Progress 
              value={happiness} 
              className="h-2" 
              style={{
                '--progress-background': happiness > 70 ? '#22c55e' : happiness > 40 ? '#eab308' : '#ef4444'
              } as React.CSSProperties}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Pollution</span>
              <span>{pollution.toFixed(1)}%</span>
            </div>
            <Progress 
              value={pollution} 
              className="h-2" 
              style={{
                '--progress-background': pollution < 30 ? '#22c55e' : pollution < 60 ? '#eab308' : '#ef4444'
              } as React.CSSProperties}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

