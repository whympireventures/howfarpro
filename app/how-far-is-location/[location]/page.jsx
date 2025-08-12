// app/how-far-is-location/[location]/page.jsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Head from 'next/head';

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import dynamic from 'next/dynamic';

import {
  FaMapMarkerAlt, FaRoad, FaPlane, FaWalking,
  FaGlobeAmericas as FaGlobe, FaMapMarkedAlt, FaSun, FaCloud,
  FaCloudRain, FaSnowflake, FaWind, FaArrowUp, FaArrowDown,
  FaUmbrella, FaCloudSun, FaBolt, FaClock, FaMoneyBillWave, FaLanguage
} from 'react-icons/fa';

// Lazy load the Map component (no SSR)
const Map = dynamic(() => import('../../../components/Map-comp'), {
  ssr: false,
  loading: () => <div className="map-loading">Loading map...</div>
});

// ---- helpers ----
const toRad = (d) => d * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;
const formatTime = (ts, tzOffset) => new Date((ts + tzOffset) * 1000)
  .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getFirstCurrency = (currencies) => {
  if (!currencies) return '--';
  const code = Object.keys(currencies)[0];
  const c = currencies[code];
  return `${code}${c?.symbol ? ` (${c.symbol})` : ''}`;
};

const formatTimezone = (tz) => {
  if (!tz) return '--';
  try {
    const short = new Date().toLocaleString('en', { timeZone: tz, timeZoneName: 'short' }).split(' ').pop();
    return short || tz.split('/').pop() || '--';
  } catch { return tz.split('/').pop() || '--'; }
};

const WEATHER_ICONS = {
  clear: { icon: FaSun, color: '#FFD700' },
  clouds: { icon: FaCloud, color: '#A9A9A9' },
  rain: { icon: FaCloudRain, color: '#4682B4' },
  drizzle: { icon: FaUmbrella, color: '#4682B4' },
  thunderstorm: { icon: FaBolt, color: '#9400D3' },
  snow: { icon: FaSnowflake, color: '#E0FFFF' },
  default: { icon: FaCloudSun, color: '#A9A9A9' },
};

export default function DistanceFromMePage({ params }) {
  // ✅ use the dynamic segment
  const destinationSlug = params.location || '';
  const destination = useMemo(
    () => decodeURIComponent(destinationSlug).replace(/-/g, ' ').trim(),
    [destinationSlug]
  );

  // ----- state -----
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(0);
  const [unit, setUnit] = useState('km');
  const [currentLocationText, setCurrentLocationText] = useState('');
  const [destinationCoords, setDestinationCoords] = useState('--');
  const [destinationCountry, setDestinationCountry] = useState('--');
  const [isCalculating, setIsCalculating] = useState(false);
  const [travelTime, setTravelTime] = useState({ driving: null, flying: null, walking: null });
  const [weather, setWeather] = useState({
    loading: true, condition: '', description: '', temperature: 0, feelsLike: 0,
    windSpeed: 0, humidity: 0, sunrise: '', sunset: '', icon: '', error: ''
  });
  const [countryInfo, setCountryInfo] = useState({ currency: '--', languages: '--', timezone: '--' });
  const [neighboringCountries, setNeighboringCountries] = useState([]);
  const [loadingNeighbors, setLoadingNeighbors] = useState(false);

  const capitalize = useCallback((s) =>
    (s || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  , []);

  // ----- geocode destination -----
  const getPlaceDetails = useCallback(async (address) => {
    if (!address.trim()) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        const p = data[0];
        setDestinationPlace(p);
        const lat = +p.lat, lon = +p.lon;
        setDestinationCoords(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        const parts = (p.display_name || '').split(',');
        setDestinationCountry(parts.pop()?.trim() || '--');
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    }
  }, []);

  useEffect(() => {
    if (destination) getPlaceDetails(destination);
  }, [destination, getPlaceDetails]);

  // ----- distance + travel times -----
  const calculateTravelTimes = useCallback((dKm) => {
    setTravelTime({
      driving: `${(dKm / 80).toFixed(1)} hours`,
      flying: `${(dKm / 800).toFixed(1)} hours`,
      walking: `${(dKm / 5).toFixed(1)} hours`,
    });
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    setIsCalculating(true);
    setTimeout(() => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2)**2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dKm = R * c;
      setDistanceInKm(dKm);
      calculateTravelTimes(dKm);
      setIsCalculating(false);
    }, 300);
  }, [calculateTravelTimes]);

  useEffect(() => {
    if (userLatitude && userLongitude && destinationPlace) {
      calculateDistance(userLatitude, userLongitude, +destinationPlace.lat, +destinationPlace.lon);
      fetchWeatherData(+destinationPlace.lat, +destinationPlace.lon);
    }
  }, [userLatitude, userLongitude, destinationPlace, calculateDistance]);

  // ----- weather -----
  const fetchWeatherData = useCallback(async (lat, lon) => {
    try {
      setWeather(prev => ({ ...prev, loading: true, error: '' }));
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=953d1012b9ab5d4722d58e46be4305f7&units=metric`
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather({
          loading: false,
          condition: data.weather[0].main.toLowerCase(),
          description: data.weather[0].description,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          windSpeed: Math.round(data.wind.speed * 3.6),
          humidity: data.main.humidity,
          sunrise: formatTime(data.sys.sunrise, data.timezone),
          sunset: formatTime(data.sys.sunset, data.timezone),
          icon: data.weather[0].icon,
          error: '',
        });
      } else throw new Error(data.message || 'Weather failed');
    } catch (e) {
      console.error('Weather error:', e);
      setWeather(prev => ({ ...prev, loading: false, error: 'Failed to load weather' }));
    }
  }, []);

  // ----- country info + neighbors -----
  const fetchNeighboringCountries = useCallback(async (codes) => {
    setLoadingNeighbors(true);
    try {
      const res = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codes.join(',')}`);
      if (!res.ok) throw new Error('Neighbors fetch failed');
      const data = await res.json();
      setNeighboringCountries(data.map(c => ({ name: c.name.common, code: c.cca2 })));
    } catch (e) {
      console.error('Neighbors error:', e);
      setNeighboringCountries([]);
    } finally {
      setLoadingNeighbors(false);
    }
  }, []);

  const fetchCountryData = useCallback(async (name) => {
    if (!name || name === '--') return;
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('Country fetch failed');
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        const c = data[0];
        setCountryInfo({
          currency: getFirstCurrency(c.currencies) || '--',
          languages: c.languages ? Object.values(c.languages).join(', ') : '--',
          timezone: c.timezones?.[0] ? formatTimezone(c.timezones[0]) : '--',
        });
        if (c.borders?.length) fetchNeighboringCountries(c.borders);
      }
    } catch (e) {
      console.error('Country info error:', e);
      setCountryInfo({ currency: '--', languages: '--', timezone: '--' });
    }
  }, [fetchNeighboringCountries]);

  useEffect(() => { fetchCountryData(destinationCountry); }, [destinationCountry, fetchCountryData]);

  // ----- geolocation -----
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.display_name) setCurrentLocationText(data.display_name);
    } catch (e) {
      console.error('Reverse geocoding error:', e);
    }
  }, []);

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setCurrentLocationText('Geolocation not supported');
      alert('Geolocation is not supported by your browser.');
      return;
    }
    try {
      try {
        const perm = await navigator.permissions?.query?.({ name: 'geolocation' });
        if (perm && perm.state === 'denied') {
          setCurrentLocationText('Location permission denied');
          alert('Please enable location permissions.');
          return;
        }
      } catch {}

      setCurrentLocationText('Detecting your location...');
      const pos = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
      });
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      setUserLatitude(lat); setUserLongitude(lng);
      setCurrentLocationText('Location detected!');
      setTimeout(() => reverseGeocode(lat, lng), 0);
    } catch {
      setCurrentLocationText('Could not detect location');
      alert('Could not detect your location. Please enter it manually.');
    }
  }, [reverseGeocode]);

  const handleManualLocation = useCallback(async (addr) => {
    if (!addr.trim()) return alert('Please enter a location');
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        const p = data[0];
        setUserLatitude(+p.lat);
        setUserLongitude(+p.lon);
        setCurrentLocationText(p.display_name);
      } else alert('Location not found. Try another address.');
    } catch (e) {
      console.error('Geocoding error:', e);
      alert('Error finding location. Please try again.');
    }
  }, []);

  // ----- memo for UI -----
  const sourceCoords = useMemo(() =>
    userLatitude && userLongitude ? { lat: +userLatitude, lng: +userLongitude } : null,
    [userLatitude, userLongitude]
  );
  const destCoords = useMemo(() =>
    destinationPlace ? { lat: +destinationPlace.lat, lng: +destinationPlace.lon } : null,
    [destinationPlace]
  );

  const weatherIcon = useMemo(() => {
    if (weather.loading) return <div className="spinner small"></div>;
    if (weather.error) return <div className="weather-error">{weather.error}</div>;
    const { icon, color } = WEATHER_ICONS[weather.condition] || WEATHER_ICONS.default;
    const Icon = icon;
    return <Icon style={{ fontSize: '3rem', marginBottom: 10, color }} />;
  }, [weather]);

  const distanceDisplay = useMemo(() => {
    if (!sourceCoords) return <div className="empty-distance"><span className="empty-value">-- {unit}</span></div>;
    if (isCalculating || distanceInKm <= 0) return <div className="spinner"></div>;
    return unit === 'km' ? `${distanceInKm.toFixed(1)} km` : `${kmToMiles(distanceInKm).toFixed(1)} mi`;
  }, [sourceCoords, isCalculating, distanceInKm, unit]);

  const neighboringCountriesList = useMemo(() => {
    if (loadingNeighbors) return <div className="spinner small"></div>;
    if (!neighboringCountries.length) return <p>No neighboring countries found or data unavailable.</p>;

    const destSlug = (destination || '').split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return (
      <ul className="routes-list">
        {neighboringCountries.map((c, i) => {
          const countrySlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return (
            <li key={i} className="route-item">
              <Link href={`/how-far-is-${countrySlug}-from-${destSlug}`} className="route-link" prefetch={false}>
                How far is {c.name} from {destination.split(',')[0]}?
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }, [loadingNeighbors, neighboringCountries, destination]);

  const popularRoutes = useMemo(() => {
    const cities = ['New York', 'London', 'Tokyo', 'Los Angeles'];
    const destSlug = (destination || '').split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return (
      <ul className="routes-list">
        {cities.map((city, i) => {
          const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return (
            <li key={i}>
              <Link href={`/how-far-is-${citySlug}-from-${destSlug}`} prefetch={false}>
                {city} to {destination.split(',')[0]}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }, [destination]);

  // ----- UI -----
  return (
    <>
      <Header />
      <Head>
        <title>How far is {capitalize(destination)} from me? | LocateMyCity</title>
        <meta name="robots" content="index, follow" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      </Head>

      <main className="distance-page">
        <div className="page-header">
          <h1>How far is {capitalize(destination)} from me?</h1>
          <p className="description">
            Find out exactly how far {capitalize(destination)} is from your current location.
            Calculate distance in miles, kilometers, or nautical miles. Includes weather and travel insights.
          </p>
        </div>

        {/* Source Location Input */}
        <div className="source-input-container">
          <div className="source-input-box">
            <input
              type="text"
              placeholder="Enter your location"
              value={currentLocationText}
              onChange={(e) => setCurrentLocationText(e.target.value)}
              className="source-input"
              aria-label="Enter your current location"
            />
            <div className="source-buttons">
              <button className="my-location-btn" onClick={getLocation} aria-label="Use my current location">
                <FaMapMarkerAlt style={{ marginRight: 8 }} /> Use My Location
              </button>
              <button className="calculate-btn" onClick={() => handleManualLocation(currentLocationText)} aria-label="Set location manually">
                Set Location
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="map-container">
          <Map sourceCoords={sourceCoords} destinationCoords={destCoords} distance={sourceCoords ? distanceInKm : null} />
          {!sourceCoords && (
            <div className="map-overlay-message">
              <FaMapMarkerAlt className="marker-icon" />
              <p> calculating...</p>
            </div>
          )}
        </div>

        {/* Distance & times */}
        <div className="cards-container">
          <div className="info-card">
            <h1>Distance to Destination</h1>
            <div className="distance-value" role="status" aria-live="polite">{distanceDisplay}</div>
            <div className="unit-toggle" role="group" aria-label="Distance unit selection">
              <button className={`unit-btn ${unit === 'km' ? 'active' : ''}`} onClick={() => setUnit('km')} aria-pressed={unit === 'km'}>Kilometers</button>
              <button className={`unit-btn ${unit === 'mi' ? 'active' : ''}`} onClick={() => setUnit('mi')} aria-pressed={unit === 'mi'}>Miles</button>
            </div>
            <div className="travel-times">
              <h4>Estimated Travel Times</h4>
              <div className="travel-method"><FaRoad className="method-icon" /><span>Driving: {sourceCoords ? (travelTime.driving || 'Calculating...') : '--'}</span></div>
              <div className="travel-method"><FaPlane className="method-icon" /><span>Flying: {sourceCoords ? (travelTime.flying || 'Calculating...') : '--'}</span></div>
              <div className="travel-method"><FaWalking className="method-icon" /><span>Walking: {sourceCoords ? (travelTime.walking || 'Calculating...') : '--'}</span></div>
            </div>
          </div>
        </div>

        {/* Destination info */}
        <div className="cards-container">
          <div className="info-card weather-card">
            <h3>Current Weather</h3>
            <div className="weather-display">
              {weatherIcon}
              {!weather.loading && !weather.error && (
                <>
                  <div className="temperature">{weather.temperature}°C</div>
                  <div className="weather-description">{weather.description}</div>
                </>
              )}
            </div>

            <div className="info-card">
              <div className="detail-item"><FaSun style={{ color: '#FFA500', fontSize: '1.5rem' }} /><div><h4>Temperature</h4><p>{weather.temperature}°C (Feels like {weather.feelsLike}°C)</p></div></div>
              <div className="detail-item"><FaWind style={{ color: '#4682B4', fontSize: '1.5rem' }} /><div><h4>Wind</h4><p>{weather.windSpeed} km/h</p></div></div>
              <div className="detail-item"><FaUmbrella style={{ color: '#4682B4', fontSize: '1.5rem' }} /><div><h4>Humidity</h4><p>{weather.humidity}%</p></div></div>
              <div className="detail-item"><FaArrowUp style={{ color: '#FFA500', fontSize: '1.5rem' }} /><div><h4>Sunrise</h4><p>{weather.sunrise}</p></div></div>
              <div className="detail-item"><FaArrowDown style={{ color: '#FF6347', fontSize: '1.5rem' }} /><div><h4>Sunset</h4><p>{weather.sunset}</p></div></div>
            </div>
          </div>

          <div className="info-card">
            <h3>General Information</h3>
            <div className="detail-item"><FaMapMarkerAlt className="detail-icon location-icon" /><div><h4>Location</h4><p>{destination}</p></div></div>
            <div className="detail-item"><FaGlobe className="detail-icon globe-icon" /><div><h4>Country/Region</h4><p>{destinationCountry}</p></div></div>
            <div className="detail-item"><FaMapMarkedAlt className="detail-icon coordinates-icon" /><div><h4>GPS Coordinates</h4><p className="coordinates">{destinationCoords}</p></div></div>
            <div className="detail-item"><FaClock className="detail-icon timezone-icon" /><div><h4>Timezone</h4><p>{countryInfo.timezone}</p></div></div>
            <div className="detail-item"><FaMoneyBillWave className="detail-icon currency-icon" /><div><h4>Currency</h4><p>{countryInfo.currency}</p></div></div>
            <div className="detail-item"><FaLanguage className="detail-icon language-icon" /><div><h4>Language</h4><p>{countryInfo.languages}</p></div></div>
          </div>
        </div>

        <footer className="page-footer">
          <div className="footer-section">
            <h4>How far is {destination} from neighboring countries?</h4>
            {neighboringCountriesList}
          </div>
          <div className="footer-section">
            <h4>Popular Routes to {destination.split(',')[0]}</h4>
            {popularRoutes}
          </div>
        </footer>
      </main>
      <Footer />
    </>
  );
}
