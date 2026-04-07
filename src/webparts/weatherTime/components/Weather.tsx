import * as React from 'react';
import { useEffect, useState } from 'react';

export interface IWeatherProps {
  azureMapsKey: string;
}

interface ICurrentWeather {
  phrase?: string;  iconCode?: string | number;  temperature?: number;
  temperatureApparent?: number;
  humidity?: number;
  windSpeed?: number;
  observationTime?: string;
  [key: string]: any;
}

const DEFAULT_LOCATION = 'New York, NY';

export default function Weather({ azureMapsKey }: IWeatherProps) {
  const [query, setQuery] = useState(DEFAULT_LOCATION);
  const [locationName, setLocationName] = useState(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<ICurrentWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState<'C' | 'F'>('F');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const getNumericValue = (value: any): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'object' && value !== null && 'value' in value) {
      const parsed = Number(value.value);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  const getStringValue = (value: any, fallback = 'Unknown') => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'object' && value !== null && 'value' in value) {
      return String(value.value);
    }
    return String(value);
  };

  const formatMetric = (value: any, fallback = '—') => {
    const numeric = getNumericValue(value);
    return numeric !== null ? String(numeric) : fallback;
  };

  const formatTemperature = (value: any) => {
    const celsius = getNumericValue(value);
    if (celsius === null) {
      return '—';
    }
    return String(Math.round(unit === 'C' ? celsius : (celsius * 9) / 5 + 32));
  };

  const unitLabel = unit === 'C' ? '°C' : '°F';
  const toggleUnit = () => setUnit(current => (current === 'C' ? 'F' : 'C'));
  const isPostalCode = (search: string) => /^\d{5}(-\d{4})?$/.test(search.trim());

  const buildSearchUrl = (search: string) =>
    `https://atlas.microsoft.com/search/address/json?api-version=1.0&query=${encodeURIComponent(search)}&subscription-key=${encodeURIComponent(azureMapsKey)}${isPostalCode(search) ? '&countrySet=US' : ''}&limit=1`;

  const buildWeatherUrl = (lat: number, lon: number) =>
    `https://atlas.microsoft.com/weather/currentConditions/json?api-version=1.1&query=${lat},${lon}&unit=metric&subscription-key=${encodeURIComponent(azureMapsKey)}`;

  const fetchWeatherForCoordinates = async (lat: number, lon: number, locationLabel: string) => {
    const response = await fetch(buildWeatherUrl(lat, lon));
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Weather API error: ${response.status} ${text}`);
    }

    const json = await response.json();
    const current = Array.isArray(json?.results) ? json.results[0] : null;
    if (!current) {
      throw new Error('No weather data returned from Azure Maps.');
    }

    setLocationName(locationLabel);
    setWeather(current);
  };

  const loadWeatherByCoordinates = async (lat: number, lon: number, label: string) => {
    if (!azureMapsKey) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await fetchWeatherForCoordinates(lat, lon, label);
    } catch (err: any) {
      console.error('Weather lookup failed', err);
      setWeather(null);
      setError(err?.message ?? 'Unable to load weather.');
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const resolveLocation = async (location: string) => {
    const response = await fetch(buildSearchUrl(location));
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Location search error: ${response.status} ${text}`);
    }

    const json = await response.json();
    const candidate = Array.isArray(json?.results) ? json.results[0] : null;
    if (!candidate || !candidate.position) {
      throw new Error('Unable to resolve location. Try a different city or address.');
    }

    return {
      lat: candidate.position.lat,
      lon: candidate.position.lon,
      label: candidate.address?.freeformAddress || location
    };
  };

  const getWeatherSymbol = (weatherData: ICurrentWeather | null) => {
    if (!weatherData) {
      return '🌤️';
    }

    const code = weatherData.iconCode ?? weatherData.weatherIcon ?? weatherData.icon;
    const numericCode = Number(code);
    const iconMap: Record<number, string> = {
      1: '☀️',
      2: '🌤️',
      3: '⛅',
      4: '⛅',
      5: '🌤️',
      6: '☁️',
      7: '☁️',
      8: '☁️',
      11: '🌫️',
      12: '🌦️',
      13: '🌦️',
      14: '⛈️',
      15: '⛈️',
      16: '⛈️',
      17: '⛈️',
      18: '🌧️',
      19: '🌨️',
      20: '🌨️',
      21: '🌨️',
      22: '❄️',
      23: '❄️',
      24: '🧊',
      25: '🌨️',
      26: '🌧️',
      29: '🌧️',
      30: '🔥',
      31: '🥶',
      32: '💨',
      33: '🌙',
      34: '🌙',
      35: '🌥️',
      36: '☁️',
      37: '🌙',
      38: '☁️',
      39: '🌧️',
      40: '🌧️',
      41: '⛈️',
      42: '⛈️',
      43: '🌨️',
      44: '❄️'
    };

    return iconMap[numericCode] ?? (weatherData.phrase ? getWeatherEmoji(weatherData.phrase) : '🌤️');
  };

  const getWeatherEmoji = (phrase: string) => {
    const text = phrase?.toLowerCase() ?? '';
    if (text.includes('sun') || text.includes('clear')) return '☀️';
    if (text.includes('cloud') || text.includes('overcast')) return '☁️';
    if (text.includes('rain') || text.includes('shower') || text.includes('drizzle')) return '🌧️';
    if (text.includes('snow') || text.includes('sleet') || text.includes('flurries')) return '❄️';
    if (text.includes('storm') || text.includes('thunder')) return '⛈️';
    if (text.includes('fog') || text.includes('mist') || text.includes('haze')) return '🌫️';
    if (text.includes('wind')) return '💨';
    return '🌤️';
  };

  const loadWeather = async (location: string) => {
    if (!azureMapsKey) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const resolved = await resolveLocation(location);
      await fetchWeatherForCoordinates(resolved.lat, resolved.lon, resolved.label);
    } catch (err: any) {
      console.error('Weather lookup failed', err);
      setWeather(null);
      setError(err?.message ?? 'Unable to load weather.');
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (!azureMapsKey) {
      setError('Enter your Azure Maps API key in the web part settings.');
      setWeather(null);
      setLoaded(false);
      return;
    }

    setError(null);
    setWeather(null);
    setLoaded(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          loadWeatherByCoordinates(latitude, longitude, 'Your location').catch(err => {
            console.error('Browser location weather failed', err);
            setError(err?.message ?? 'Unable to load weather from your location.');
            loadWeather(DEFAULT_LOCATION);
          });
        },
        () => {
          loadWeather(DEFAULT_LOCATION);
        },
        { timeout: 10000 }
      );
    } else {
      loadWeather(DEFAULT_LOCATION);
    }
  }, [azureMapsKey]);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Please enter a city or address.');
      return;
    }

    await loadWeather(trimmed);
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await handleSearch();
    }
  };

  if (!azureMapsKey) {
    return (
      <div style={{ maxWidth: 400, fontFamily: 'Segoe UI, sans-serif' }}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Azure Maps Weather</h2>
        <p style={{ margin: 0 }}>Enter your Azure Maps API key in the web part settings to enable weather lookups.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', minWidth: 0 }}>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search city or address — press Enter"
            aria-label="Search city or address"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '10px 0',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>
      <div style={{ padding: 14, border: '1px solid #e1dfdd', borderRadius: 6, backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: '#323130', fontWeight: 600, marginBottom: 4 }}>{currentTime.toLocaleTimeString()}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#323130', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{locationName}</div>
          </div>
        </div>

        {loading && <p style={{ margin: 0, fontSize: 13 }}>Loading weather…</p>}
        {error && <p style={{ margin: 0, color: '#d13438', fontSize: 13 }}>{error}</p>}
        {!loading && !error && !weather && loaded && (
          <p style={{ margin: 0, color: '#605e5c', fontSize: 13 }}>No weather data available. Try a different location.</p>
        )}

        {!loading && !error && weather && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#605e5c' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  backgroundColor: '#f3f2f1',
                  fontSize: 24
                }}
              >
                {getWeatherSymbol(weather)}
              </div>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                <span style={{ fontSize: 36, fontWeight: 700 }}>{formatTemperature(weather.temperature)}</span>
                <span
                  onClick={toggleUnit}
                  role="button"
                  tabIndex={0}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleUnit();
                    }
                  }}
                  title={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    cursor: 'pointer',
                    color: '#0078d4',
                    fontSize: 12,
                    fontWeight: 600,
                    userSelect: 'none'
                  }}
                >
                  {unitLabel}
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: '#605e5c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getStringValue(weather.phrase, 'Unknown')}</div>
                {getNumericValue(weather.temperatureApparent) !== null && (
                  <div style={{ fontSize: 12, color: '#605e5c' }}>Feels like {formatTemperature(weather.temperatureApparent)}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {getNumericValue(weather.humidity) !== null && <div>Humidity: {formatMetric(weather.humidity)}%</div>}
              {getNumericValue(weather.windSpeed) !== null && <div>Wind: {formatMetric(weather.windSpeed)} km/h</div>}
              {weather.observationTime && (
                <div style={{ fontSize: 12, color: '#605e5c' }}>{new Date(weather.observationTime).toLocaleTimeString()}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
