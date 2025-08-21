'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

// Dynamically import Leaflet map (no SSR)
const MapWithNoSSR = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <span>Loading map…</span>
    </div>
  ),
});

// Small badge to label sections visually (JSX-safe)
function SectionLabel({ children }) {
  return (
    <span
      className="inline-block text-xs font-semibold tracking-wide uppercase bg-gray-100 text-gray-700 px-2 py-1 rounded"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default function SpringLocationsExplorer() {
  const [allSprings, setAllSprings] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Fetch data and keep an AbortController for cleanup
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadData() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const backendUrl = 'https://backend-production-cfe6.up.railway.app';
        const res = await fetch(`${backendUrl}/api/springs/flat`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (isMounted) setAllSprings(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        console.error('Error loading spring data:', err);
        if (isMounted) {
          setLoadError('Could not load springs. Showing a tiny fallback.');
          setAllSprings([
            { name: 'Blue Springs', state: 'Alabama', lat: 31.66128, lon: -85.50744, county: null },
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Normalize coordinates to {lat, lng} numbers for Leaflet
  const mapLocations = useMemo(() => {
    return allSprings
      .map((s) => {
        const lat = Number(s.lat);
        const lng =
          s.lng !== undefined && s.lng !== null
            ? Number(s.lng)
            : s.lon !== undefined && s.lon !== null
            ? Number(s.lon)
            : undefined;

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { ...s, lat, lng };
        }
        return null;
      })
      .filter(Boolean);
  }, [allSprings]);

  // Build stats + browsing structures from normalized mapLocations
  const {
    commonNamesData,
    statesMostData,
    uniqueStatesData,
    locationsByStateData,
    stateLocationsData,
  } = useMemo(() => {
    const nameCounts = {};
    const stateCounts = {};

    mapLocations.forEach((loc) => {
      if (!loc || !loc.name || !loc.state) return;
      nameCounts[loc.name] = (nameCounts[loc.name] || 0) + 1;
      stateCounts[loc.state] = (stateCounts[loc.state] || 0) + 1;
    });

    const commonNamesData = Object.entries(nameCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const statesMostData = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const uniqueStatesData = Array.from(new Set(mapLocations.map((l) => l.state))).sort();

    const locationsByStateData = mapLocations.reduce((acc, loc) => {
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    }, {});

    const stateLocationsData = selectedState ? locationsByStateData[selectedState] || [] : [];

    return { commonNamesData, statesMostData, uniqueStatesData, locationsByStateData, stateLocationsData };
  }, [mapLocations, selectedState]);

  // Open distance page in a new tab via POST (keeps your original flow)
  const focusOnLocation = useCallback((lat, lng, name) => {
    const cleanName = (name || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const cleanUrl = `/location-from-me/how-far-is-${cleanName}-from-me`;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = cleanUrl;
    form.target = '_blank';
    form.style.display = 'none';

    const addHidden = (n, v) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = n;
      input.value = String(v);
      form.appendChild(input);
    };

    addHidden('lat', lat);
    addHidden('lon', lng); // if your downstream expects "lon"
    addHidden('lng', lng); // also provide "lng" for safety

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }, []);

  // Static list
  const notableLocations = useMemo(
    () => [
      { name: 'Hot Springs, AR', description: 'Historic spa town' },
      { name: 'Sulphur Springs, TX', description: 'Famous for minerals' },
      { name: 'Palm Springs, CA', description: 'Desert resort' },
      { name: 'Coral Springs, FL', description: 'Master-planned city' },
    ],
    []
  );

  return (
    <>
      <Head>
        <title>Spring Locations Explorer | LocateMyCity</title>
        <meta
          name="description"
          content='Discover unique U.S. places with "Spring" in their name. Explore stats, browse by state, and view them on an interactive map.'
        />
        <meta name="robots" content="index, follow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      </Head>

      <Header />

      <main>
        {/* SECTION: Hero */}
        <section id="hero" className="page-hero" aria-labelledby="hero-title">
          <div className="container">
            <SectionLabel>Section: Hero</SectionLabel>
            <h1 id="hero-title" className="mt-2">Cities with “Spring” in the Name</h1>
            <p className="subtitle">Discover unique U.S. locations with “Spring” in their name</p>
            {loadError && (
              <p role="alert" className="text-sm text-red-600 mt-2">{loadError}</p>
            )}
          </div>
        </section>

        {/* SECTION: Quick Stats */}
        <section id="stats" className="stats-section" aria-labelledby="stats-title">
          <div className="container">
            <SectionLabel>Section: Quick Stats</SectionLabel>
            <h2 id="stats-title" className="section-title mt-2">Quick Stats</h2>

            <div className="stats-container">
              {/* Most Common Names */}
              <div className="stat-card" aria-labelledby="common-names-title">
                <div className="stat-card-content">
                  <h3 id="common-names-title" className="stat-card-title">Most Common Names</h3>
                  <ul className="stat-card-list">
                    {isLoading ? (
                      <div className="loading-container"><div className="spinner"></div></div>
                    ) : (
                      commonNamesData.map(([name, count]) => (
                        <li key={name} className="stat-card-item">
                          <span>{name}</span> <strong>{count} locations</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* States with Most */}
              <div className="stat-card" aria-labelledby="states-most-title">
                <div className="stat-card-content">
                  <h3 id="states-most-title" className="stat-card-title">States with Most</h3>
                  <ul className="stat-card-list">
                    {isLoading ? (
                      <div className="loading-container"><div className="spinner"></div></div>
                    ) : (
                      statesMostData.map(([state, count]) => (
                        <li key={state} className="stat-card-item">
                          <span>{state}</span> <strong>{count} cities</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* Notable Locations */}
              <div className="stat-card" aria-labelledby="notable-locs-title">
                <div className="stat-card-content">
                  <h3 id="notable-locs-title" className="stat-card-title">Notable Locations</h3>
                  <ul className="stat-card-list">
                    {isLoading ? (
                      <div className="loading-container"><div className="spinner"></div></div>
                    ) : (
                      notableLocations.map((location) => (
                        <li key={location.name} className="stat-card-item">
                          <span>{location.name}</span> <strong>{location.description}</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Map */}
        <section id="map" className="map-section" aria-labelledby="map-title">
          <div className="container">
            <SectionLabel>Section: Interactive Map</SectionLabel>
            <h2 id="map-title" className="section-title mt-2">Interactive Map</h2>

            {/* Pass normalized markers: { lat, lng } */}
            <MapWithNoSSR
              locations={mapLocations}
              markers={mapLocations}   // compatible prop alias if needed
              points={mapLocations}    // another alias just in case
            />
          </div>
        </section>

        {/* SECTION: Browse by State */}
        <section id="browse" className="states-section" aria-labelledby="browse-title">
          <div className="container">
            <SectionLabel>Section: Browse by State</SectionLabel>
            <h2 id="browse-title" className="section-title mt-2">Browse by State</h2>

            <div className="states-container" role="list">
              {isLoading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : (
                uniqueStatesData.map((state) => (
                  <button
                    key={state}
                    className={`state-btn ${selectedState === state ? 'is-active' : ''}`}
                    onClick={() => setSelectedState(state)}
                    role="listitem"
                    aria-pressed={selectedState === state}
                  >
                    <span>{state}</span>
                  </button>
                ))
              )}
            </div>

            {selectedState && (
              <div id="state-countries-container" style={{ marginTop: '2rem' }}>
                <div className="state-group" aria-labelledby="state-group-title">
                  <h3 id="state-group-title" className="state-group-title">{selectedState}</h3>
                  <div className="countries-list">
                    {stateLocationsData.map((loc) => (
                      <div
                        key={`${loc.name}-${loc.lat}-${loc.lng}`}
                        className="country-item"
                      >
                        <span className="country-name">{loc.name}</span>
                        <button
                          className="view-map-btn"
                          onClick={() => focusOnLocation(loc.lat, loc.lng, loc.name)}
                          style={{ width: '120px' }}
                        >
                          View on Map
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION: All Locations by State */}
        <section id="all-by-state" className="countries-section" aria-labelledby="all-by-state-title">
          <div className="container">
            <SectionLabel>Section: All Locations by State</SectionLabel>
            <h2 id="all-by-state-title" className="section-title mt-2">All Locations by State</h2>

            {isLoading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (
              Object.keys(locationsByStateData)
                .sort()
                .map((state) => (
                  <div key={state} className="state-group">
                    <h3 className="state-group-title">{state}</h3>
                    <div className="countries-list">
                      {locationsByStateData[state].map((loc) => (
                        <div
                          key={`${loc.name}-${loc.lat}-${loc.lng}-all`}
                          className="country-item"
                        >
                          <span className="country-name">{loc.name}</span>
                          <button
                            className="view-map-btn"
                            onClick={() => focusOnLocation(loc.lat, loc.lng, loc.name)}
                            style={{ width: '120px' }}
                          >
                            View on Map
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

