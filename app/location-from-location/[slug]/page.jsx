'use client';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { FaGlobe, FaSun, FaWind, FaPlane, FaAnchor, FaClock } from 'react-icons/fa';
import { WiSunrise, WiSunset } from 'react-icons/wi';

import { 
  MetricCard, 
  WeatherPanel, 
  FAQItem, 
  RouteCard 
} from '../../../components/DistanceComponents';

// Import Leaflet components dynamically to avoid SSR issues
const LeafletMap = dynamic(
  () => import('../../../components/LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="distance-result__map-loading">
        <div className="distance-result__map-loader">
          <div className="distance-result__map-loader-icon"></div>
          <p className="distance-result__map-loader-text">Loading map...</p>
        </div>
      </div>
    )
  }
);

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export default function DistanceResult() {
  const [sourcePlace, setSourcePlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const router = useRouter();
  const params = useParams();
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const WEATHER_API_KEY = '953d1012b9ab5d4722d58e46be4305f7';
  const POPULAR_ROUTES_API_URL = '/api/popular-routes';
  
  // Extract location names from URL
  const slug = params.slug;
  const [sourceName, destinationName] = slug 
    ? slug.replace('how-far-is-', '').split('-from-')
    : [null, null];

  useEffect(() => {
    if (!sourceName || !destinationName) {
      router.push('/locationtolocation');
      return;
    }

    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        // Fetch source location details
        const sourceResponse = await fetch(
          `${NOMINATIM_URL}?q=${encodeURIComponent(sourceName.replace(/-/g, ' '))}&format=json&limit=1`
        );
        const sourceData = await sourceResponse.json();
        
        // Fetch destination location details
        const destResponse = await fetch(
          `${NOMINATIM_URL}?q=${encodeURIComponent(destinationName.replace(/-/g, ' '))}&format=json&limit=1`
        );
        const destData = await destResponse.json();

        if (sourceData.length > 0 && destData.length > 0) {
          const src = sourceData[0];
          const dest = destData[0];
          
          setSourcePlace({
            lat: src.lat,
            lon: src.lon,
            display_name: src.display_name
          });
          
          setDestinationPlace({
            lat: dest.lat,
            lon: dest.lon,
            display_name: dest.display_name
          });

          calculateDistance(src, dest);
          fetchWeatherData(src, dest);
          fetchPopularRoutes(src, dest);
        } else {
          router.push('/locationtolocation');
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
        router.push('/locationtolocation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [sourceName, destinationName, router]);
  
  const [sourceWeather, setSourceWeather] = useState({
  temp: "Loading...",
  wind: "Loading...",
  sunrise: "Loading...",
  sunset: "Loading...",
  localtime: "Loading...",
  coordinates: "Loading...",
  currency: "Loading...",
  language: "Loading..."
});

const [destinationWeather, setDestinationWeather] = useState({
  temp: "Loading...",
  wind: "Loading...",
  sunrise: "Loading...",
  sunset: "Loading...",
  localtime: "Loading...",
  coordinates: "Loading...",
  currency: "Loading...",
  language: "Loading..."
});
  const calculateDistance = (src, dest) => {
    setIsLoading(true);
    const lat1 = parseFloat(src.lat);
    const lon1 = parseFloat(src.lon);
    const lat2 = parseFloat(dest.lat);
    const lon2 = parseFloat(dest.lon);
    
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
    setIsLoading(false);
  };
  const fetchCountryData = async (lat, lon) => {
    try {
      // First get country code using reverse geocoding
      const reverseGeocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LocateMyCity/1.0' // Required by Nominatim
          }
        }
      );
      
      const geoData = await reverseGeocodeRes.json();
      const countryCode = geoData.address?.country_code?.toUpperCase();
      
      if (!countryCode) {
        return { currency: "N/A", language: "N/A" };
      }
      
      // Get currency and language from free APIs
      const [currency, language] = await Promise.all([
        fetchCurrency(countryCode),
        fetchLanguage(countryCode)
      ]);
      
      return { currency, language };
    } catch (error) {
      console.error("Error fetching country data:", error);
      return { currency: "N/A", language: "N/A" };
    }
  };

  const fetchCurrency = async (countryCode) => {
    try {
      // Using a free currency API
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      const data = await response.json();
      
      if (data && data[0]?.currencies) {
        const currencyCode = Object.keys(data[0].currencies)[0];
        return `${currencyCode} (${data[0].currencies[currencyCode].name})`;
      }
      return "N/A";
    } catch (error) {
      console.error("Error fetching currency:", error);
      return "N/A";
    }
  };

  const fetchLanguage = async (countryCode) => {
    try {
      // Using the same countries API for language
      const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      const data = await response.json();
      
      if (data && data[0]?.languages) {
        return Object.values(data[0].languages)[0];
      }
      return "N/A";
    } catch (error) {
      console.error("Error fetching language:", error);
      return "N/A";
    }
  };

// Simple fallback data for common countries
const getCurrencyByCode = (code) => {
  const currencies = {
    US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', 
    IT: 'EUR', ES: 'EUR', JP: 'JPY', IN: 'INR',
    BR: 'BRL', CA: 'CAD', AU: 'AUD', CN: 'CNY'
  };
  return currencies[code] || "N/A";
};

const getLanguageByCode = (code) => {
  const languages = {
    US: 'English', GB: 'English', DE: 'German', 
    FR: 'French', IT: 'Italian', ES: 'Spanish',
    JP: 'Japanese', IN: 'Hindi', BR: 'Portuguese',
    CA: 'English', AU: 'English', CN: 'Chinese'
  };
  return languages[code] || "N/A";
};

  const fetchWeatherData = async (src, dest) => {
  try {
    // Reset all weather data to loading state
    setSourceWeather({
      temp: "Loading...",
      wind: "Loading...",
      sunrise: "Loading...",
      sunset: "Loading...",
      localtime: "Loading...",
      coordinates: "Loading...",
      currency: "Loading...",
      language: "Loading..."
    });
    
    setDestinationWeather({
      temp: "Loading...",
      wind: "Loading...",
      sunrise: "Loading...",
      sunset: "Loading...",
      localtime: "Loading...",
      coordinates: "Loading...",
      currency: "Loading...",
      language: "Loading..."
    });

    // Fetch weather data in parallel with country data
    const [sourceWeatherRes, destWeatherRes, sourceCountryData, destCountryData] = await Promise.all([
      fetch(`${WEATHER_API_URL}?lat=${src.lat}&lon=${src.lon}&appid=${WEATHER_API_KEY}&units=metric`),
      fetch(`${WEATHER_API_URL}?lat=${dest.lat}&lon=${dest.lon}&appid=${WEATHER_API_KEY}&units=metric`),
      fetchCountryData(src.lat, src.lon),
      fetchCountryData(dest.lat, dest.lon)
    ]);

    if (!sourceWeatherRes.ok || !destWeatherRes.ok) throw new Error('Weather API failed');
    
    const sourceData = await sourceWeatherRes.json();
    const destData = await destWeatherRes.json();

    setSourceWeather({
      temp: sourceData.main ? `${Math.round(sourceData.main.temp)}°C` : "N/A",
      wind: sourceData.wind ? `${Math.round(sourceData.wind.speed * 3.6)} km/h` : "N/A",
      sunrise: sourceData.sys ? new Date(sourceData.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A",
      sunset: sourceData.sys ? new Date(sourceData.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A",
      localtime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      coordinates: `${parseFloat(src.lat).toFixed(4)}, ${parseFloat(src.lon).toFixed(4)}`,
      currency: sourceCountryData.currency,
      language: sourceCountryData.language
    });
    
    setDestinationWeather({
      temp: destData.main ? `${Math.round(destData.main.temp)}°C` : "N/A",
      wind: destData.wind ? `${Math.round(destData.wind.speed * 3.6)} km/h` : "N/A",
      sunrise: destData.sys ? new Date(destData.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A",
      sunset: destData.sys ? new Date(destData.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A",
      localtime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      coordinates: `${parseFloat(dest.lat).toFixed(4)}, ${parseFloat(dest.lon).toFixed(4)}`,
      currency: destCountryData.currency,
      language: destCountryData.language
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    setSourceWeather(prev => ({
      ...prev,
      temp: "Error",
      wind: "Error",
      sunrise: "Error",
      sunset: "Error",
      coordinates: "Error",
      currency: "Error",
      language: "Error"
    }));
    setDestinationWeather(prev => ({
      ...prev,
      temp: "Error",
      wind: "Error",
      sunrise: "Error",
      sunset: "Error",
      coordinates: "Error",
      currency: "Error",
      language: "Error"
    }));
  }
};

  const fetchPopularRoutes = async (src, dest) => {
    try {
      setPopularRoutes([
        { source: src.display_name?.split(',')[0] || "Source", destination: dest.display_name?.split(',')[0] || "Destination" },
        { source: "New York", destination: "London" },
        { source: "Tokyo", destination: "Sydney" },
        { source: "Paris", destination: "Rome" }
      ]);
    } catch (error) {
      console.error("Error fetching popular routes:", error);
    }
  };

  const toRad = (degrees) => degrees * Math.PI / 180;
  const kmToMiles = (km) => km * 0.621371;
  const kmToNauticalMiles = (km) => km * 0.539957;
  const calculateFlightTime = (km) => (km / 800).toFixed(1);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const navigateToRoute = (source, destination) => {
    // Format the locations for URL
    const formatForUrl = (str) => str.toLowerCase().replace(/\s+/g, '-');
    const sourceFormatted = formatForUrl(source);
    const destFormatted = formatForUrl(destination);
    
    // Navigate to the new route
    router.push(`/location-from-location/how-far-is-${destFormatted}-from-${sourceFormatted}`);
  };

  if (!sourcePlace || !destinationPlace) {
    return (
      <div className="distance-calc-loading-screen min-h-screen flex items-center justify-center">
        <div className="distance-calc-loading-content text-center">
          <div className="distance-calc-spinner spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto"></div>
          <p className="distance-calc-loading-text mt-4 text-lg">Loading location data...</p>
        </div>
      </div>
    );
  }

 
const faqs = [
  {
    question: 'What information can I find on LocateMyCity?',
    answer:
      'LocateMyCity provides detailed insights about locations, including city/town status, distance measurements, and unique geographical traits.',
  },
  {
    question: 'How do I use the distance calculator?',
    answer:
      'Either allow location access or manually enter locations to calculate real-time distances in miles or kilometers.',
  },
  {
    question: 'Can I compare multiple locations?',
    answer:
      'Yes, our Location to Location tool lets you compare multiple destinations for effective trip planning.',
  },
  {
    question: 'How current is the location data?',
    answer:
      'We update weekly using verified sources including satellite imagery and government data.',
  },
  {
    question: 'What makes LocateMyCity different?',
    answer:
      'We highlight unique natural features and cover both abandoned and active locations with faster search and data accuracy than traditional tools.',
  },
];

  return (
    <>
      <Header />
      <Head>
        <title>{`How far is ${sourcePlace?.display_name?.split(',')[0]} from ${destinationPlace?.display_name?.split(',')[0]}?`}</title>
        <meta name="description" content={`Distance between ${sourcePlace?.display_name} and ${destinationPlace?.display_name}`} />
      </Head>

      <div className="distance-result__header">
        <div className="distance-result__header-content">
          <h1 className="distance-result__title">
            How far is <span className="distance-result__highlight">{sourcePlace?.display_name?.split(',')[0]}</span> from <span className="distance-result__highlight">{destinationPlace?.display_name?.split(',')[0]}</span>?
          </h1>
          {!isLoading && (
            <p className="distance-result__description">
              {sourcePlace?.display_name?.split(',')[0]} is approximately <strong>{kmToMiles(distanceInKm).toFixed(1)} miles</strong> ({distanceInKm.toFixed(1)} km) from {destinationPlace?.display_name?.split(',')[0]}, with a flight time of around <strong>{calculateFlightTime(distanceInKm)} hours</strong>.
            </p>
          )}
        </div>
      </div>

      <main className="distance-result__container">
        <section className="distance-result__map-section">
          <div className="distance-result__map-wrapper">
            <LeafletMap 
              source={{
                lat: parseFloat(sourcePlace?.lat),
                lng: parseFloat(sourcePlace?.lon),
                name: sourcePlace?.display_name
              }}
              destination={{
                lat: parseFloat(destinationPlace?.lat),
                lng: parseFloat(destinationPlace?.lon),
                name: destinationPlace?.display_name
              }}
              distance={distanceInKm}
            />
          </div>
        </section>

        {!isLoading && (
          <section className="distance-result__metrics">
            <h2 className="distance-result__section-title">Distance Information</h2>
            <div className="distance-result__metrics-grid">
              <MetricCard 
                icon={<FaGlobe />}
                title="Kilometers"
                value={distanceInKm.toFixed(1)}
                unit="km"
                variant="blue"
              />
              <MetricCard 
                icon={<FaGlobe />}
                title="Miles"
                value={kmToMiles(distanceInKm).toFixed(1)}
                unit="mi"
                variant="green"
              />
              <MetricCard 
                icon={<FaAnchor />}
                title="Nautical Miles"
                value={kmToNauticalMiles(distanceInKm).toFixed(1)}
                unit="nmi"
                variant="purple"
              />
              <MetricCard 
                icon={<FaPlane />}
                title="Flight Time"
                value={calculateFlightTime(distanceInKm)}
                unit="hours"
                variant="red"
              />
            </div>
          </section>
        )}

        {!isLoading && (
          <section className="distance-result__weather">
            <h2 className="distance-result__section-title">Side-by-Side Weather </h2>
            <div className="distance-result__weather-grid">
              <WeatherPanel 
                location={sourcePlace?.display_name?.split(',')[0]}
                weather={sourceWeather}
                type="source"
              />
              <WeatherPanel 
                location={destinationPlace?.display_name?.split(',')[0]}
                weather={destinationWeather}
                type="destination"
              />
            </div>
          </section>
        )}

       <div className="faq-page">
  <h1 className="faq-title">Frequently Asked Questions</h1>
  <div className="faq-list">
    {faqs.map((faq, index) => (
      <div
        key={index}
        className={`faq-card ${activeFAQ === index ? 'open' : ''}`}
        onClick={() => toggleFAQ(index)}
      >
        <div className="faq-question">
          <span>{faq.question}</span>
          {activeFAQ === index ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div className="faq-answer">{activeFAQ === index && <p>{faq.answer}</p>}</div>
      </div>
    ))}
  </div>
</div>

        {!isLoading && (
          <section className="distance-result__routes">
            <h2 className="distance-result__section-title">Most Popular Routes</h2>
            <div className="distance-result__routes-grid">
              {popularRoutes.map((route, index) => (
                <RouteCard 
                  key={index}
                  source={route.source}
                  destination={route.destination}
                  onClick={() => navigateToRoute(route.source, route.destination)}
                />
              ))}
            </div> 
          </section>
          
        )}
      </main>
     <Footer />
    </>
  );
}