'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const UA = { 'User-Agent': 'howfarfromme.com (contact: siteowner@example.com)' };

const slugify = (s) =>
  s.toLowerCase().trim()
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/^-+|-+$/g, '');

const useDebounce = (value, delay = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

export default function Page({ params }) {
  const initialDest = decodeURIComponent(params.destination || '').replace(/-/g, ' ');
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [currentLocationText, setCurrentLocationText] = useState('Click to detect your location');
  const [destinationInput, setDestinationInput] = useState(initialDest);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const destinationInputRef = useRef(null);
  const router = useRouter();

  // Auto‑prompt location the first time
  useEffect(() => {
    const permission = localStorage.getItem('locationPermission');
    if (permission === 'always') {
      getLocation();
    } else if (!permission) {
      setShowLocationPopup(true);
    }
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setCurrentLocationText('Geolocation not supported. Using default.');
      setUserLatitude(40.7128);
      setUserLongitude(-74.0060);
      return;
    }

    setCurrentLocationText('Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLatitude(latitude);
        setUserLongitude(longitude);
        setCurrentLocationText('Location detected!');
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        console.error('Geolocate error:', err);
        setCurrentLocationText('Could not detect location. Using default.');
        setUserLatitude(40.7128);
        setUserLongitude(-74.0060);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: UA }
      );
      const data = await r.json();
      if (data?.display_name) setCurrentLocationText(data.display_name);
    } catch (e) {
      console.error('Reverse geocode error:', e);
    }
  };

  // --- Suggestions (debounced) ---
  const debouncedQuery = useDebounce(destinationInput, 350);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    const run = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=10&addressdetails=1`;
        const res = await fetch(url, { headers: UA });
        const data = await res.json();

        const filtered = data.map((item) => {
          let name = (item.display_name || '').split(',')[0] || '';
          if (item.address) {
            name =
              item.address.city ||
              item.address.town ||
              item.address.village ||
              item.address.county ||
              item.address.state ||
              item.address.country ||
              name;
          }
          return {
            ...item,
            short_name: name.length > 40 ? `${name.slice(0, 40)}…` : name,
          };
        });

        setSuggestions(filtered);
      } catch (e) {
        console.error('Suggestion error:', e);
        setSuggestions([]);
      }
    };

    run();
  }, [debouncedQuery]);

  const handleInputChange = (e) => {
    setDestinationInput(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (s) => {
    setDestinationInput(s.short_name);
    setShowSuggestions(false);
  };

  const handleLocationPermission = (permission) => {
    if (permission === 'always') localStorage.setItem('locationPermission', 'always');
    setShowLocationPopup(false);
    getLocation();
  };

  const handleCalculate = () => {
    if (!destinationInput.trim()) return alert('Please enter a destination first');
    if (userLatitude == null || userLongitude == null) return alert('Please allow location access first');

    // Navigate to THIS clean route with a pretty slug
    const destinationSlug = slugify(destinationInput);
    router.push(`/how-far-is-${destinationSlug}-from-me`);
  };

  return (
    <>
      <Header />

      <div className="distance-page">
        {/* Background bubbles (optional) */}
        <div className="floating-elements">
          <div className="floating-element" style={{ width: '100px', height: '100px', top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className="floating-element" style={{ width: '150px', height: '150px', top: '60%', left: '70%', animationDelay: '2s' }} />
          <div className="floating-element" style={{ width: '80px', height: '80px', top: '30%', left: '80%', animationDelay: '4s' }} />
          <div className="floating-element" style={{ width: '120px', height: '120px', top: '70%', left: '15%', animationDelay: '6s' }} />
        </div>

        {/* Location Permission Popup */}
        {showLocationPopup && (
          <div className="location-popup">
            <div className="popup-content">
              <h2>Allow Location Access</h2>
              <p>We need your location to calculate distances accurately. Your data remains private and secure.</p>
              <button className="popup-btn primary" onClick={() => handleLocationPermission('always')}>Allow Always</button>
              <button className="popup-btn secondary" onClick={() => handleLocationPermission('once')}>Allow This Time</button>
              <button className="popup-btn secondary" onClick={() => setShowLocationPopup(false)}>Deny</button>
            </div>
          </div>
        )}

        <div className="page-title">
          <h1>How far is {initialDest || 'your destination'} from me?</h1>
          <p>Calculate miles, kilometers, and nautical miles from your current location.</p>
        </div>

        <div className="distance-container">
          <div className="distance-form">
            <div className="current-location" onClick={getLocation}>
              <FaMapMarkerAlt className="info-icon" />
              <div className="info-content">
                <h4>Current Location</h4>
                <p>{currentLocationText}</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="source">Source Coordinates</label>
              <input
                type="text"
                id="source"
                className="form-control"
                placeholder="Your current location will appear here"
                readOnly
                value={
                  userLatitude != null && userLongitude != null
                    ? `${userLatitude.toFixed(6)}, ${userLongitude.toFixed(6)}`
                    : ''
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">Destination</label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={destinationInputRef}
                  type="text"
                  id="destination"
                  className="form-control"
                  placeholder="Enter address, city, or landmark"
                  value={destinationInput}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <button
                  onClick={handleCalculate}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#4682B4',
                    fontSize: '1rem',
                    padding: '5px',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                  }}
                  aria-label="Calculate"
                  title="Calculate"
                >
                  <FaArrowRight />
                </button>

                {showSuggestions && suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((s, i) => (
                      <li key={i} onMouseDown={() => handleSuggestionClick(s)} className="suggestion-item">
                        {s.short_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button className="calculate-btn" onClick={handleCalculate}>
              <span id="btnText">Calculate Distance</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

