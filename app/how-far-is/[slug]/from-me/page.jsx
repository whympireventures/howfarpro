'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { usePathname, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// alias imports
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
  FaLanguage,
} from 'react-icons/fa';

// Lazy load the Map component with no SSR
const Map = dynamic(() => import('@/components/Map-comp'), {
  ssr: false,
  loading: () => <div className="map-loading">Loading map...</div>,
});

// ---------------- Helper functions ----------------
const toRad = (degrees) => (degrees * Math.PI) / 180;
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
    const offset = new Date()
      .toLocaleString('en', { timeZone: timezone, timeZoneName: 'short' })
      .split(' ')
      .pop();
    return offset;
  } catch {
    return timezone.split('/').pop() || '--';
  }
};

// Slug + distance helpers
const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Curated global hubs (add/remove freely)
const FALLBACK_PLACES = [
  { label: 'Miami, Florida', coords: { lat: 25.7617, lon: -80.1918 } },
  { label: 'Fort Lauderdale, Florida', coords: { lat: 26.1224, lon: -80.1373 } },
  { label: 'Orlando, Florida', coords: { lat: 28.5383, lon: -81.3792 } },
  { label: 'Atlanta, Georgia', coords: { lat: 33.7490, lon: -84.3880 } },
  { label: 'New York, New York', coords: { lat: 40.7128, lon: -74.0060 } },
  { label: 'Toronto, Canada', coords: { lat: 43.6532, lon: -79.3832 } },
  { label: 'Havana, Cuba', coords: { lat: 23.1136, lon: -82.3666 } },
  { label: 'Kingston, Jamaica', coords: { lat: 17.9714, lon: -76.7936 } },
  { label: 'Santo Domingo, Dominican Republic', coords: { lat: 18.4861, lon: -69.9312 } },
  { label: 'San Juan, Puerto Rico', coords: { lat: 18.4655, lon: -66.1057 } },
  { label: 'Cancún, Mexico', coords: { lat: 21.1619, lon: -86.8515 } },
  { label: 'Bogotá, Colombia', coords: { lat: 4.7110, lon: -74.0721 } },
  { label: 'London, United Kingdom', coords: { lat: 51.5074, lon: -0.1278 } },
  { label: 'Paris, France', coords: { lat: 48.8566, lon: 2.3522 } },
  { label: 'Madrid, Spain', coords: { lat: 40.4168, lon: -3.7038 } },
  { label: 'Lisbon, Portugal', coords: { lat: 38.7223, lon: -9.1393 } },
  { label: 'Dubai, UAE', coords: { lat: 25.2048, lon: 55.2708 } },
  { label: 'Singapore', coords: { lat: 1.3521, lon: 103.8198 } },
  { label: 'Bangkok, Thailand', coords: { lat: 13.7563, lon: 100.5018 } },
  { label: 'Tokyo, Japan', coords: { lat: 35.6762, lon: 139.6503 } },
  { label: 'Sydney, Australia', coords: { lat: -33.8688, lon: 151.2093 } },
];


// Weather icon mapping
const WEATHER_ICONS = {
  clear: { icon: FaSun, color: '#FFD700' },
  clouds: { icon: FaCloud, color: '#A9A9A9' },
  rain: { icon: FaCloudRain, color: '#4682B4' },
  drizzle: { icon: FaUmbrella, color: '#4682B4' },
  thunderstorm: { icon: FaBolt, color: '#9400D3' },
  snow: { icon: FaSnowflake, color: '#E0FFFF' },
  default: { icon: FaCloudSun, color: '#A9A9A9' },
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
    walking: null,
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
    icon: '',
  });
  const [countryInfo, setCountryInfo] = useState({
    currency: '--',
    languages: '--',
    timezone: '--',
  });
  const [neighboringCountries, setNeighboringCountries] = useState([]);
  const [loadingNeighbors, setLoadingNeighbors] = useState(false);

  const params = useParams();
  const pathname = usePathname();

  // ---------------- Destination from path ----------------
  const destination = useMemo(() => {
    // Prefer dynamic param when using internal route: /how-far-is/:slug/from-me
    const s =
      typeof params?.slug === 'string'
        ? params.slug
        : Array.isArray(params?.slug)
        ? params.slug[0]
        : null;

    if (s) return decodeURIComponent(s).replace(/-/g, ' ').trim();

    // Fallback: parse pretty single-segment URL directly e.g. /how-far-is-miami-florida-from-me
    if (pathname) {
      const p = pathname.replace(/^\/+|\/+$/g, '');
      const m = p.match(/^how-far-is-(.+)-from-me$/);
      if (m) return decodeURIComponent(m[1]).replace(/-/g, ' ').trim();
    }
    return null;
  }, [params, pathname]);

  useEffect(() => {
    if (destination) setDestinationName(destination);
  }, [destination]);

  // ---------------- Geocoding ----------------
  const getPlaceDetails = useCallback(async (address) => {
    if (!address.trim()) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json&limit=1`;
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
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      setDistanceInKm(distance);
      setTravelTime({
        driving: `${(distance / 80).toFixed(1)} hours`,
        flying: `${(distance / 800).toFixed(1)} hours`,
        walking: `${(distance / 5).toFixed(1)} hours`,
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
      setWeather((prev) => ({ ...prev, loading: true }));
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
        });
      } else throw new Error(data.message);
    } catch (err) {
      console.error('Weather API error:', err);
      setWeather((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load weather data',
      }));
    }
  }, []);

  // ---------------- Country Info ----------------
  const fetchCountryData = useCallback(async (countryName) => {
    if (!countryName || countryName === '--') return;
    try {
      const res = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
      );
      if (!res.ok) throw new Error('Failed to fetch country data');
      const data = await res.json();
      if (data?.length > 0) {
        const country = data[0];
        setCountryInfo({
          currency: getFirstCurrency(country.currencies) || '--',
          languages: country.languages
            ? Object.values(country.languages).join(', ')
            : '--',
          timezone: country.timezones?.[0]
            ? formatTimezone(country.timezones[0])
            : '--',
        });
        if (country.borders?.length > 0)
          fetchNeighboringCountries(country.borders);
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
      const res = await fetch(
        `https://restcountries.com/v3.1/alpha?codes=${codes.join(',')}`
      );
      const data = await res.json();
      setNeighboringCountries(
        data.map((c) => ({ name: c.name.common, code: c.cca2 }))
      );
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
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
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
  const capitalizeWords = useCallback(
    (str) =>
      str
        ? str
            .split(' ')
            .map(
              (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
            )
            .join(' ')
        : '',
    []
  );

 // Neighboring countries list → dynamic fallback with distances and pretty URLs
const neighboringCountriesList = useMemo(() => {
  // Still loading?
  if (loadingNeighbors) return <div className="spinner small"></div>;

  const originName = (destinationName || '').split(',')[0].trim();
  const originSlug = slugify(originName);

  // If we have actual neighbors from REST Countries, show those links
  if (neighboringCountries.length > 0) {
    return (
      <>
    
        <ul className="routes-list">
          {neighboringCountries.map((country, i) => {
            const countrySlug = slugify(country.name);
            return (
              <li key={i} className="route-item">
                <Link
                  href={`/how-far-is-${originSlug}-from-${countrySlug}`}
                  className="route-link"
                  prefetch={false}
                >
                  {originName} from {country.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  // Fallback: compute distances from the current destination to curated hubs
  if (!destinationPlace) {
    return (
      <>
        <h4>Popular from {originName}</h4>
        <p>Calculating suggestions…</p>
      </>
    );
  }

  const oLat = +destinationPlace.lat;
  const oLon = +destinationPlace.lon;

  const items = FALLBACK_PLACES
    // don't link to itself if the hub name equals origin
    .filter((p) => slugify(p.label) !== originSlug)
    .map((p) => {
      const km = haversineKm(oLat, oLon, p.coords.lat, p.coords.lon);
      const miles = Math.round(kmToMiles(km));
      return {
        label: p.label,
        slug: slugify(p.label),
        miles,
        href: `/how-far-is-${originSlug}-from-${slugify(p.label)}`,
      };
    })
    .sort((a, b) => a.miles - b.miles)
    .slice(0, 6); // show the 6 closest

  return (
    <>
      <h4>Popular from {originName}</h4>
      <ul className="routes-list">
        {items.map((it, i) => (
          <li key={i} className="route-item">
            <Link href={it.href} className="route-link" prefetch={false}>
              {originName} from {it.label} — {it.miles} miles
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}, [
  loadingNeighbors,
  neighboringCountries,
  destinationName,
  destinationPlace,
]);


// Popular routes → pretty URLs
const popularRoutes = useMemo(() => {
  const cities = ['New York', 'London', 'Tokyo', 'Los Angeles'];
  const destSlug = (destinationName || '')
    .split(',')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return (
    <ul className="routes-list">
      {cities.map((city, i) => {
        const citySlug = city
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        return (
          <li key={i}>
            <Link
              href={`/how-far-is-${citySlug}-from-${destSlug}`}
              prefetch={false}
            >
              {city} to {destinationName.split(',')[0]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}, [destinationName]);


  // ---------------- Memoized UI bits ----------------
  const weatherIcon = useMemo(() => {
    if (weather.loading) return <div className="spinner small"></div>;
    if (weather.error) return <div className="weather-error">{weather.error}</div>;
    const { icon, color } =
      WEATHER_ICONS[weather.condition] || WEATHER_ICONS.default;
    const IconComp = icon;
    return (
      <IconComp style={{ fontSize: '3rem', marginBottom: '10px', color }} />
    );
  }, [weather]);

  const sourceCoords = useMemo(
    () =>
      userLatitude && userLongitude
        ? { lat: +userLatitude, lng: +userLongitude }
        : null,
    [userLatitude, userLongitude]
  );
  const destCoords = useMemo(
    () =>
      destinationPlace
        ? { lat: +destinationPlace.lat, lng: +destinationPlace.lon }
        : null,
    [destinationPlace]
  );

  const distanceDisplay = useMemo(() => {
    if (!sourceCoords) {
      return (
        <div className="empty-distance">
          <span className="empty-value">
            -- {unit === 'km' ? 'km' : 'mi'}
          </span>
          <span className="unit-hint"> </span>
        </div>
      );
    }
    if (isCalculating || distanceInKm <= 0) return <div className="spinner"></div>;
    return unit === 'km'
      ? `${distanceInKm.toFixed(1)} km`
      : `${kmToMiles(distanceInKm).toFixed(1)} mi`;
  }, [sourceCoords, isCalculating, distanceInKm, unit]);

  // ---------------- UI ----------------
  return (
    <>
      <Header />
      <Head>
        <title>
          How far is {capitalizeWords(destinationName)} from me? | LocateMyCity
        </title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="distance-page">
        <div className="page-header">
          <h1>How far is {capitalizeWords(destinationName)} from me?</h1>
          <p className="description">
            Find out exactly how far {capitalizeWords(destinationName)} is from your current location.
            Use our interactive tool to calculate the distance in miles, kilometers,
            or nautical miles. Includes weather, nearby places, and travel insights.
          </p>
        </div>

        {/* Source Location Input Box */}
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
              <button
                className="my-location-btn"
                onClick={getLocation}
                aria-label="Use my current location"
              >
                <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                Use My Location
              </button>
              <button
                className="calculate-btn"
                onClick={() => getPlaceDetails(currentLocationText)}
                aria-label="Set location manually"
              >
                Set Location
              </button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="map-container">
          <Map
            sourceCoords={sourceCoords}
            destinationCoords={destCoords}
            distance={sourceCoords ? distanceInKm : null}
          />
          {!sourceCoords && (
            <div className="map-overlay-message">
              <FaMapMarkerAlt className="marker-icon" />
              <p> calculating...</p>
            </div>
          )}
        </div>

        {/* Distance + travel times */}
        <div className="cards-container">
          <div className="info-card">
            <h1>Distance to Destination</h1>

            <div className="distance-value" role="status" aria-live="polite">
              {distanceDisplay}
            </div>

            <div className="unit-toggle" role="group" aria-label="Distance unit selection">
              <button
                className={`unit-btn ${unit === 'km' ? 'active' : ''}`}
                onClick={() => handleUnitChange('km')}
                aria-pressed={unit === 'km'}
              >
                Kilometers
              </button>
              <button
                className={`unit-btn ${unit === 'mi' ? 'active' : ''}`}
                onClick={() => handleUnitChange('mi')}
                aria-pressed={unit === 'mi'}
              >
                Miles
              </button>
            </div>

            <div className="travel-times">
              <h4>Estimated Travel Times</h4>
              <div className="travel-method">
                <FaRoad className="method-icon" />
                <span>Driving: {sourceCoords ? (travelTime.driving || 'Calculating...') : '--'}</span>
              </div>
              <div className="travel-method">
                <FaPlane className="method-icon" />
                <span>Flying: {sourceCoords ? (travelTime.flying || 'Calculating...') : '--'}</span>
              </div>
              <div className="travel-method">
                <FaWalking className="method-icon" />
                <span>Walking: {sourceCoords ? (travelTime.walking || 'Calculating...') : '--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Destination info cards */}
        <div className="cards-container">
          {/* Weather Card */}
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
              <div className="detail-item">
                <FaSun style={{ color: '#FFA500', fontSize: '1.5rem' }} />
                <div>
                  <h4>Temperature</h4>
                  <p>{weather.temperature}°C (Feels like {weather.feelsLike}°C)</p>
                </div>
              </div>

              <div className="detail-item">
                <FaWind style={{ color: '#4682B4', fontSize: '1.5rem' }} />
                <div>
                  <h4>Wind</h4>
                  <p>{weather.windSpeed} km/h</p>
                </div>
              </div>

              <div className="detail-item">
                <FaUmbrella style={{ color: '#4682B4', fontSize: '1.5rem' }} />
                <div>
                  <h4>Humidity</h4>
                  <p>{weather.humidity}%</p>
                </div>
              </div>

              <div className="detail-item">
                <FaArrowUp style={{ color: '#FFA500', fontSize: '1.5rem' }} />
                <div>
                  <h4>Sunrise</h4>
                  <p>{weather.sunrise}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaArrowDown style={{ color: '#FF6347', fontSize: '1.5rem' }} />
                <div>
                  <h4>Sunset</h4>
                  <p>{weather.sunset}</p>
                </div>
              </div>
            </div>
          </div>

          {/* General Info Card */}
          <div className="info-card">
            <h3>General Information</h3>
            <div className="detail-item">
              <FaMapMarkerAlt className="detail-icon location-icon" />
              <div>
                <h4>Location</h4>
                <p>{destinationName}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaGlobe className="detail-icon globe-icon" />
              <div>
                <h4>Country/Region</h4>
                <p>{destinationCountry}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaMapMarkedAlt className="detail-icon coordinates-icon" />
              <div>
                <h4>GPS Coordinates</h4>
                <p className="coordinates">{destinationCoords}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaClock className="detail-icon timezone-icon" />
              <div>
                <h4>Timezone</h4>
                <p>{countryInfo.timezone}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaMoneyBillWave className="detail-icon currency-icon" />
              <div>
                <h4>Currency</h4>
                <p>{countryInfo.currency}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaLanguage className="detail-icon language-icon" />
              <div>
                <h4>Language</h4>
                <p>{countryInfo.languages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer sections */}
        <footer className="page-footer">
          <div className="footer-section">
            {neighboringCountriesList}
          </div>
          <div className="footer-section">
            <h4>Popular Search Routes to {destinationName.split(',')[0]}</h4>
            {popularRoutes}
          </div>
        </footer>
      </main>

      <Footer />
    </>
  );
}
