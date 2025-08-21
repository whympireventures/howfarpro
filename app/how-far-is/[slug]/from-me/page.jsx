'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { usePathname, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// ✅ use alias imports
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { 
  FaMapMarkerAlt, 
  FaRoad, 
  FaPlane, 
  FaWalking,
  FaGlobeAmericas as FaGlobe,
  FaMapMarkedAlt,
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaWind,
  FaArrowUp,
  FaArrowDown,
  FaUmbrella,
  FaCloudSun,
  FaBolt,
  FaClock,
  FaMoneyBillWave,
  FaLanguage
} from 'react-icons/fa';

// Lazy load the Map component with no SSR
const Map = dynamic(() => import('@/components/Map-comp'), { 
  ssr: false,
  loading: () => <div className="map-loading">Loading map...</div>
});

// ---------------- Helper functions ----------------
const toRad = (degrees) => degrees * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;
const formatTime = (timestamp, timezone) => {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const getFirstCurrency = (currencies) => {
  if (!currencies) return null;
  const currencyCode = Object.keys(currencies)[0];
  const currency = currencies[currencyCode];
  return `${currencyCode} (${currency.symbol || ''})`;
};
const formatTimezone = (timezone) => {
  if (!timezone) return '--';
  try {
    const offset = new Date().toLocaleString('en', { timeZone: timezone, timeZoneName: 'short' }).split(' ').pop();
    return offset;
  } catch {
    return timezone.split('/').pop() || '--';
  }
};

// Weather icon mapping
const WEATHER_ICONS = {
  clear: { icon: FaSun, color: '#FFD700' },
  clouds: { icon: FaCloud, color: '#A9A9A9' },
  rain: { icon: FaCloudRain, color: '#4682B4' },
  drizzle: { icon: FaUmbrella, color: '#4682B4' },
  thunderstorm: { icon: FaBolt, color: '#9400D3' },
  snow: { icon: FaSnowflake, color: '#E0FFFF' },
  default: { icon: FaCloudSun, color: '#A9A9A9' }
};

// ==================================================
export default function DistanceResult() {
  // ---------------- State ----------------
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(0);
  const [unit, setUnit] = useState('km');
  const [currentLocationText, setCurrentLocationText] = useState('');
  const [destinationCoords, setDestinationCoords] = useState('--');
  const [destinationCountry, setDestinationCountry] = useState('--');
  const [destinationName, setDestinationName] = useState('--');
  const [isCalculating, setIsCalculating] = useState(false);
  const [travelTime, setTravelTime] = useState({
    driving: null,
    flying: null,
    walking: null
  });
  const [weather, setWeather] = useState({
    loading: true,
    condition: '',
    description: '',
    temperature: 0,
    feelsLike: 0,
    windSpeed: 0,
    humidity: 0,
    sunrise: '',
    sunset: '',
    icon: ''
  });
  const [countryInfo, setCountryInfo] = useState({
    currency: '--',
    languages: '--',
    timezone: '--'
  });
  const [neighboringCountries, setNeighboringCountries] = useState([]);
  const [loadingNeighbors, setLoadingNeighbors] = useState(false);

  const pathname = usePathname();

  // ---------------- Destination from path ----------------
  
const params = useParams();

const destination = useMemo(() => {
  // Prefer the dynamic param when using internal route: /how-far-is/:slug/from-me
  const s =
    typeof params?.slug === 'string'
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : null;

  if (s) {
    return decodeURIComponent(s).replace(/-/g, ' ').trim();
  }

  // Fallback: parse the pretty single-segment URL directly
  // e.g. /how-far-is-miami-florida-from-me
  if (pathname) {
    const p = pathname.replace(/^\/+|\/+$/g, '');
    const m = p.match(/^how-far-is-(.+)-from-me$/);
    if (m) {
      return decodeURIComponent(m[1]).replace(/-/g, ' ').trim();
    }
  }

  return null;
}, [params, pathname]);


  // ---------------- Geocoding ----------------
  const getPlaceDetails = useCallback(async (address) => {
    if (!address.trim()) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.length > 0) {
        const place = data[0];
        setDestinationPlace(place);
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        setDestinationCoords(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        setDestinationCountry(place.display_name.split(',').pop().trim() || '--');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  }, []);
  useEffect(() => {
    if (!destination) return;
    const timer = setTimeout(() => getPlaceDetails(destination), 300);
    return () => clearTimeout(timer);
  }, [destination, getPlaceDetails]);

  // ---------------- Distance calc ----------------
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    setIsCalculating(true);
    setTimeout(() => {
      const R = 6371; // Earth radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2)**2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      setDistanceInKm(distance);
      setTravelTime({
        driving: `${(distance / 80).toFixed(1)} hours`,
        flying: `${(distance / 800).toFixed(1)} hours`,
        walking: `${(distance / 5).toFixed(1)} hours`
      });
      setIsCalculating(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (userLatitude && userLongitude && destinationPlace) {
      calculateDistance(
        userLatitude,
        userLongitude,
        parseFloat(destinationPlace.lat),
        parseFloat(destinationPlace.lon)
      );
      fetchWeatherData(
        parseFloat(destinationPlace.lat),
        parseFloat(destinationPlace.lon)
      );
    }
  }, [userLatitude, userLongitude, destinationPlace, calculateDistance]);

  // ---------------- Weather ----------------
  const fetchWeatherData = useCallback(async (lat, lon) => {
    try {
      setWeather(prev => ({ ...prev, loading: true }));
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
          icon: data.weather[0].icon
        });
      } else throw new Error(data.message);
    } catch (err) {
      console.error('Weather API error:', err);
      setWeather(prev => ({ ...prev, loading: false, error: 'Failed to load weather data' }));
    }
  }, []);

  // ---------------- Country Info ----------------
  const fetchCountryData = useCallback(async (countryName) => {
    if (!countryName || countryName === '--') return;
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
      if (!res.ok) throw new Error('Failed to fetch country data');
      const data = await res.json();
      if (data?.length > 0) {
        const country = data[0];
        setCountryInfo({
          currency: getFirstCurrency(country.currencies) || '--',
          languages: country.languages ? Object.values(country.languages).join(', ') : '--',
          timezone: country.timezones?.[0] ? formatTimezone(country.timezones[0]) : '--'
        });
        if (country.borders?.length > 0) fetchNeighboringCountries(country.borders);
      }
    } catch (err) {
      console.error('Country info error:', err);
    }
  }, []);
  useEffect(() => {
    fetchCountryData(destinationCountry);
  }, [destinationCountry, fetchCountryData]);

  const fetchNeighboringCountries = useCallback(async (codes) => {
    setLoadingNeighbors(true);
    try {
      const res = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codes.join(',')}`);
      const data = await res.json();
      setNeighboringCountries(data.map(c => ({ name: c.name.common, code: c.cca2 })));
    } catch (err) {
      console.error('Neighbors error:', err);
      setNeighboringCountries([]);
    } finally {
      setLoadingNeighbors(false);
    }
  }, []);

  // ---------------- Geolocation ----------------
  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setCurrentLocationText('Geolocation not supported');
      return;
    }
    setCurrentLocationText('Detecting your location...');
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      setUserLatitude(latitude);
      setUserLongitude(longitude);
      setCurrentLocationText('Location detected!');
    } catch {
      setCurrentLocationText('Could not detect location');
    }
  }, []);

  // ---------------- Helpers ----------------
  const handleUnitChange = useCallback((newUnit) => setUnit(newUnit), []);
  const capitalizeWords = useCallback((str) => str
    ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : '', []);

  // ---------------- Memoized ----------------
  const weatherIcon = useMemo(() => {
    if (weather.loading) return <div className="spinner small"></div>;
    if (weather.error) return <div className="weather-error">{weather.error}</div>;
    const { icon, color } = WEATHER_ICONS[weather.condition] || WEATHER_ICONS.default;
    const IconComp = icon;
    return <IconComp style={{ fontSize: '3rem', marginBottom: '10px', color }} />;
  }, [weather]);

  const sourceCoords = useMemo(() => userLatitude && userLongitude ? { lat: +userLatitude, lng: +userLongitude } : null, [userLatitude, userLongitude]);
  const destCoords = useMemo(() => destinationPlace ? { lat: +destinationPlace.lat, lng: +destinationPlace.lon } : null, [destinationPlace]);

  const distanceDisplay = useMemo(() => {
    if (!sourceCoords) return <div className="empty-distance">-- {unit}</div>;
    if (isCalculating || distanceInKm <= 0) return <div className="spinner"></div>;
    return unit === 'km' ? `${distanceInKm.toFixed(1)} km` : `${kmToMiles(distanceInKm).toFixed(1)} mi`;
  }, [sourceCoords, isCalculating, distanceInKm, unit]);

  // ---------------- UI ----------------
  return (
    <>
      <Header />
      <Head>
        <title>How far is {capitalizeWords(destinationName)} from me? | LocateMyCity</title>
      </Head>

      <main className="distance-page">
        <h1>How far is {capitalizeWords(destinationName)} from me?</h1>

        {/* Source input */}
        <input
          type="text"
          placeholder="Enter your location"
          value={currentLocationText}
          onChange={(e) => setCurrentLocationText(e.target.value)}
        />
        <button onClick={getLocation}><FaMapMarkerAlt /> Use My Location</button>

        {/* Map */}
        <Map sourceCoords={sourceCoords} destinationCoords={destCoords} distance={distanceInKm} />

        {/* Distance */}
        <div>{distanceDisplay}</div>

        {/* Weather */}
        <div>{weatherIcon}</div>
      </main>

      <Footer />
    </>
  );
}
