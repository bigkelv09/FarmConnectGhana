import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, CloudRain, Wind, Sun, CloudSun } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  rainfall: number;
}

export function WeatherWidget() {
  const { data: weather, isLoading } = useQuery<WeatherData>({
    queryKey: ['/api/weather'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-forest-green to-lime-green rounded-xl shadow-lg p-8 text-white">
            <div className="text-center">
              <p className="text-lg">Loading weather data...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const mockForecast = [
    { day: 'Today', icon: Sun, high: 28, low: 22 },
    { day: 'Tomorrow', icon: CloudSun, high: 26, low: 20 },
    { day: 'Thursday', icon: CloudRain, high: 24, low: 18 },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-forest-green to-lime-green rounded-xl shadow-lg p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4" data-testid="weather-title">
                Agricultural Weather Insights
              </h2>
              <p className="text-lg opacity-90 mb-6" data-testid="weather-description">
                Stay informed with real-time weather data to make better farming decisions
              </p>
              
              {weather && (
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-white bg-opacity-20 border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Thermometer className="text-2xl mr-3" />
                        <div>
                          <p className="text-sm opacity-75">Temperature</p>
                          <p className="text-2xl font-bold" data-testid="weather-temperature">
                            {weather.temperature}°C
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white bg-opacity-20 border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Droplets className="text-2xl mr-3" />
                        <div>
                          <p className="text-sm opacity-75">Humidity</p>
                          <p className="text-2xl font-bold" data-testid="weather-humidity">
                            {weather.humidity}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white bg-opacity-20 border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <CloudRain className="text-2xl mr-3" />
                        <div>
                          <p className="text-sm opacity-75">Rainfall</p>
                          <p className="text-2xl font-bold" data-testid="weather-rainfall">
                            {weather.rainfall}mm
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white bg-opacity-20 border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Wind className="text-2xl mr-3" />
                        <div>
                          <p className="text-sm opacity-75">Wind Speed</p>
                          <p className="text-2xl font-bold" data-testid="weather-windspeed">
                            {weather.windSpeed} km/h
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <Card className="bg-white bg-opacity-20 border-none">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4" data-testid="forecast-title">
                    7-Day Forecast
                  </h3>
                  <div className="space-y-3">
                    {mockForecast.map((forecast, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center"
                        data-testid={`forecast-day-${index}`}
                      >
                        <span>{forecast.day}</span>
                        <div className="flex items-center">
                          <forecast.icon className="w-5 h-5 mr-2" />
                          <span>{forecast.high}°C / {forecast.low}°C</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="bg-white text-forest-green hover:bg-white/90 font-semibold mt-4"
                    data-testid="view-full-forecast"
                  >
                    View Full Forecast
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
