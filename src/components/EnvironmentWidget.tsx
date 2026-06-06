"use client";

import { useEffect, useState } from "react";
import { Globe, Sun, Moon, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake } from "lucide-react";

interface WeatherData {
  temp: number;
  code: number;
  isDay: number;
}

function getWeatherIcon(code: number, isDay: number) {
  if (code === 0) return isDay ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-300" />;
  if (code === 1 || code === 2 || code === 3) return <Cloud size={14} className="text-gray-400" />;
  if (code === 45 || code === 48) return <CloudFog size={14} className="text-gray-400" />;
  if (code >= 51 && code <= 67) return <CloudRain size={14} className="text-blue-400" />;
  if (code >= 71 && code <= 77) return <Snowflake size={14} className="text-white" />;
  if (code >= 80 && code <= 82) return <CloudRain size={14} className="text-blue-500" />;
  if (code >= 95) return <CloudLightning size={14} className="text-yellow-400" />;
  return isDay ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-300" />;
}

export function EnvironmentWidget() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Time interval for IST
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setTime(formatter.format(new Date()));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Fetch Weather (Navi Mumbai coordinates)
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=19.0330&longitude=73.0297&current_weather=true"
        );
        const data = await res.json();
        setWeather({
          temp: data.current_weather.temperature,
          code: data.current_weather.weathercode,
          isDay: data.current_weather.is_day,
        });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    fetchWeather();
    // Refresh weather every 15 minutes
    const weatherInterval = setInterval(fetchWeather, 15 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(weatherInterval);
    };
  }, []);

  // Prevent hydration errors by not rendering exact time until mounted
  if (!mounted) {
    return (
      <div className="mt-16 flex items-center justify-center gap-4 text-xs font-mono text-[var(--muted)] opacity-50">
        <div className="h-8 w-64 animate-pulse rounded-full bg-[var(--surface)]"></div>
      </div>
    );
  }

  return (
    <div className="mt-16 flex justify-center">
      <div className="group relative flex items-center gap-4 rounded-full border border-[var(--line-strong)] bg-[var(--surface-soft)] px-4 py-2 shadow-sm backdrop-blur-md transition-colors hover:border-[var(--teal)]">
        
        {/* Location & Globe */}
        <div className="flex items-center gap-2 border-r border-[var(--line-strong)] pr-4">
          <Globe size={14} className="animate-[spin_10s_linear_infinite] text-[var(--teal)]" />
          <span className="font-mono text-xs font-medium text-[var(--text)]">Navi Mumbai, IN</span>
        </div>

        {/* Live Time */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--teal)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--teal)]"></span>
          </span>
          <span className="w-[85px] font-mono text-xs text-[var(--muted)]">{time}</span>
        </div>

        {/* Weather */}
        {weather && (
          <div className="flex items-center gap-1.5 border-l border-[var(--line-strong)] pl-4">
            {getWeatherIcon(weather.code, weather.isDay)}
            <span className="font-mono text-xs font-medium text-[var(--text)]">
              {Math.round(weather.temp)}°C
            </span>
          </div>
        )}
        
      </div>
    </div>
  );
}
