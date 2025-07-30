'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Footer from '../../../components/Footer';
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
import { useRouter, usePathname } from 'next/navigation';
import Header from '../../../components/Header';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map-comp'), { ssr: false });

// Helper functions
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

export default function DistanceResult() {
  // State declarations
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(0);
  const [unit, setUnit] = useState('km');
  const [currentLocationText, setCurrentLocationText] = useState('Click to detect your location');
  const [destinationCoords, setDestinationCoords] = useState('--');
  const [destinationCountry, setDestinationCountry] = useState('--');
  const [destinationName, setDestinationName] = useState('--');
  const [isCalculating, setIsCalculating] = useState(true);
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

  const router = useRouter();
  const pathname = usePathname();


const getDestinationFromPath = (pathname) => {
  // First try to get from pathname parameter
  if (pathname) {
    const pathMatch = pathname.match(/how-far-is-(.+?)(-from-me)?$/);
    if (pathMatch) {
      const rawName = pathMatch[1];
      return decodeURIComponent(rawName).replace(/-/g, ' ').trim();
    }
  }
  
  // Fallback to checking window.location only on client side
  if (typeof window !== 'undefined') {
    const urlMatch = window.location.pathname.match(/how-far-is-(.+?)(-from-me)?$/);
    return urlMatch ? decodeURIComponent(urlMatch[1]).replace(/-/g, ' ').trim() : null;
  }
  
  return null;
};

 const [destination, setDestination] = useState(null);


  // Add this useEffect hook near the top of your component
 useEffect(() => {
  // Client-side only check
  if (typeof window !== 'undefined') {
    // Check if the URL has the parameterized format
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments.length > 3 && pathSegments[1] === 'how-far-is-:destination-from-me') {
      const cleanPath = `/${pathSegments[1]}/${pathSegments[2]}`;
      window.history.replaceState(null, '', cleanPath);
    }
  }
}, []);
useEffect(() => {
  const dest = getDestinationFromPath(pathname);
  if (dest) {
    setDestination(dest);
    setDestinationName(dest); // optional, so heading updates immediately
  }
}, [pathname]);


  // Clean up URL if needed
  useEffect(() => {
    if (pathname?.includes('/how-far-is-') && pathname.split('/').length > 3) {
      const cleanPath = pathname.split('/').slice(0, 3).join('/');
      window.history.replaceState(null, '', cleanPath);
    }
  }, [pathname]);

  // Get user location on mount
  useEffect(() => {
    const permission = localStorage.getItem('locationPermission');
    getLocation();
  }, []);

  // Fetch place details when destination changes
  useEffect(() => {
    if (destination) {
      getPlaceDetails(destination);
    }
  }, [destination]);

  // Recalculate when both locations are available
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
  }, [userLatitude, userLongitude, destinationPlace]);

  // Fetch country info when destination country changes
  useEffect(() => {
    const fetchCountryData = async () => {
      if (!destinationCountry || destinationCountry === '--') return;
      
      try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(destinationCountry)}`);
        if (!response.ok) throw new Error('Failed to fetch country data');
        
        const data = await response.json();
        if (data && data.length > 0) {
          const country = data[0];
          setCountryInfo({
            currency: getFirstCurrency(country.currencies) || '--',
            languages: country.languages ? Object.values(country.languages).join(', ') : '--',
            timezone: country.timezones?.[0] ? formatTimezone(country.timezones[0]) : '--'
          });

          // Fetch neighboring countries if borders exist
          if (country.borders && country.borders.length > 0) {
            fetchNeighboringCountries(country.borders);
          }
        }
      } catch (error) {
        console.error('Error fetching country info:', error);
        setCountryInfo({
          currency: '--',
          languages: '--',
          timezone: '--'
        });
      }
    };

    fetchCountryData();
  }, [destinationCountry]);

  // Function to fetch neighboring countries
  const fetchNeighboringCountries = async (borderCodes) => {
    setLoadingNeighbors(true);
    try {
      const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${borderCodes.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch neighboring countries');
      
      const data = await response.json();
      setNeighboringCountries(data.map(country => ({
        name: country.name.common,
        code: country.cca2
      })));
    } catch (error) {
      console.error('Error fetching neighboring countries:', error);
      setNeighboringCountries([]);
    } finally {
      setLoadingNeighbors(false);
    }
  };

  // API call functions
  const fetchWeatherData = async (lat, lon) => {
    try {
      setWeather(prev => ({ ...prev, loading: true }));
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=953d1012b9ab5d4722d58e46be4305f7&units=metric`
      );
      const data = await response.json();
      
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
      } else {
        throw new Error(data.message || 'Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Weather API error:', error);
      setWeather(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load weather data'
      }));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setCurrentLocationText('Detecting your location...');
      
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLatitude(lat);
          setUserLongitude(lng);
          setCurrentLocationText('Location detected!');
          reverseGeocode(lat, lng);
        },
        error => {
          setCurrentLocationText('Could not detect location. Using default.');
          setUserLatitude(40.7128);
          setUserLongitude(-74.0060);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setCurrentLocationText('Geolocation not supported. Using default.');
      setUserLatitude(40.7128);
      setUserLongitude(-74.0060);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.display_name) {
        setCurrentLocationText(data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

const getPlaceDetails = async (address) => {
  if (!address.trim()) return;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const place = data[0];
      setDestinationPlace(place);
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      
      setDestinationCoords(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
      setDestinationCountry(place.display_name.split(',').pop().trim() || '--');
      
      // Keep the short name from the URL, not the full display name
      setDestinationName(address);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
};

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const R = 6371; // Earth radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      setDistanceInKm(distance);
      calculateTravelTimes(distance);
      setIsCalculating(false);
    }, 500);
  };

  const calculateTravelTimes = (distance) => {
    setTravelTime({
      driving: `${(distance / 80).toFixed(1)} hours`,
      flying: `${(distance / 800).toFixed(1)} hours`,
      walking: `${(distance / 5).toFixed(1)} hours`
    });
  };

  const handleUnitChange = (newUnit) => setUnit(newUnit);
  
  const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

  // Weather icon component
  const getWeatherIcon = () => {
    if (weather.loading) return <div className="spinner small"></div>;
    if (weather.error) return <div className="weather-error">{weather.error}</div>;

    const iconStyle = { 
      fontSize: '3rem',
      marginBottom: '10px'
    };

    switch(weather.condition) {
      case 'clear': return <FaSun style={{...iconStyle, color: '#FFD700'}} />;
      case 'clouds': return <FaCloud style={{...iconStyle, color: '#A9A9A9'}} />;
      case 'rain': return <FaCloudRain style={{...iconStyle, color: '#4682B4'}} />;
      case 'drizzle': return <FaUmbrella style={{...iconStyle, color: '#4682B4'}} />;
      case 'thunderstorm': return <FaBolt style={{...iconStyle, color: '#9400D3'}} />;
      case 'snow': return <FaSnowflake style={{...iconStyle, color: '#E0FFFF'}} />;
      default: return <FaCloudSun style={{...iconStyle, color: '#A9A9A9'}} />;
    }
  };

  // Prepare coordinates for the map
  const sourceCoords = userLatitude && userLongitude ? { 
    lat: parseFloat(userLatitude), 
    lng: parseFloat(userLongitude) 
  } : null;

  const destCoords = destinationPlace ? { 
    lat: parseFloat(destinationPlace.lat), 
    lng: parseFloat(destinationPlace.lon) 
  } : null;

  return (
    <>
      <Header />
      <Head>
        <title>How far is {capitalizeWords(destinationName)} from me? | LocateMyCity</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      </Head>

      <div className="distance-page">
     <div className="page-header">
  <h1>How far is {capitalizeWords(destinationName)} from me?</h1>
  <p className="description">
    Find out exactly how far {capitalizeWords(destinationName)} is from your current location. 
    Use our interactive tool to calculate the distance in miles, kilometers, 
    or nautical miles. Includes weather, nearby places, and travel insights.
  </p>
</div>
        <div className="map-container">
          {sourceCoords && destCoords && (
            <Map 
              sourceCoords={sourceCoords}
              destinationCoords={destCoords}
              distance={distanceInKm}
            />
          )}
        </div>

        <div className="cards-container">
          {/* Distance Card */}
          <div className="info-card">
            <h3>Distance to Destination</h3>
            <div className="distance-value">
              {!isCalculating && distanceInKm > 0 ? (
                unit === 'km' ? `${distanceInKm.toFixed(1)} km` : `${kmToMiles(distanceInKm).toFixed(1)} mi`
              ) : (
                <div className="spinner"></div>
              )}
            </div>
            <div className="unit-toggle">
              <button 
                className={`unit-btn ${unit === 'km' ? 'active' : ''}`}
                onClick={() => handleUnitChange('km')}
              >
                Kilometers
              </button>
              <button 
                className={`unit-btn ${unit === 'mi' ? 'active' : ''}`}
                onClick={() => handleUnitChange('mi')}
              >
                Miles
              </button>
            </div>
            <div className="travel-times">
              <h4>Estimated Travel Times</h4>
              <div className="travel-method">
                <FaRoad className="method-icon" />
                <span>Driving: {travelTime.driving || '--'}</span>
              </div>
              <div className="travel-method">
                <FaPlane className="method-icon" />
                <span>Flying: {travelTime.flying || '--'}</span>
              </div>
              <div className="travel-method">
                <FaWalking className="method-icon" />
                <span>Walking: {travelTime.walking || '--'}</span>
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div className="info-card weather-card">
            <h3>Current Weather</h3>
            <div className="weather-display">
              {getWeatherIcon()}
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

        <footer className="page-footer">
  <div className="footer-section">
    <h4>How far is {destinationName} from neighboring countries?</h4>
    {loadingNeighbors ? (
      <div className="spinner small"></div>
    ) : neighboringCountries.length > 0 ? (
     <ul className="routes-list"> {/* Changed from neighbors-list to routes-list */}
  {neighboringCountries.map((country, index) => {
    // Create URL-friendly slugs
    const destSlug = destinationName
      .split(',')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
      
    const countrySlug = country.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return (
      <li key={index} className="route-item"> {/* Added route-item class */}
        <Link 
          href={`/location-from-location/how-far-is-${countrySlug}-from-${destSlug}`}
          className="route-link" /* Added route-link class */
        >
          How far is {country.name} from {destinationName.split(',')[0]}?
        </Link>
      </li>
    );
  })}
</ul>
    ) : (
      <p>No neighboring countries found or data unavailable.</p>
    )}
  </div>
  <div className="footer-section">
    <h4>Popular Routes to {destinationName.split(',')[0]}</h4>
    <ul className="routes-list">
      {[
        'New York',
        'London',
        'Tokyo',
        'Los Angeles'
      ].map((city, index) => {
        const destSlug = destinationName
          .split(',')[0]
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
          
        const citySlug = city
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        return (
          <li key={index}>
            <Link href={`/location-from-location/how-far-is-${citySlug}-from-${destSlug}`}>
              {city} to {destinationName.split(',')[0]}
            </Link>
          </li>
        );
      })}
    </ul>
  </div>
</footer>

      </div><Footer />
    </>
  );
}