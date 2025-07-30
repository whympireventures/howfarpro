'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Dynamically import Leaflet to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('../../components/MapComponent'), { ssr: false });

export default function RockyLocationsExplorer() {
  const [allRockyLocations, setAllRockyLocations] = useState([]);
  const [selectedUSState, setSelectedUSState] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load data from rock
useEffect(() => {
  const loadLocationData = async () => {
    try {
      setIsDataLoading(true);
      const backendUrl = 'https://locate-my-city-backend-production-e8a2.up.railway.app';
      console.log("Fetching from:", backendUrl);

      const response = await fetch(`${backendUrl}/api/locations`);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const locationData = await response.json();
      console.log("Fetched data:", locationData);
      setAllRockyLocations(locationData);
    } catch (error) {
      console.error('Error loading location data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  loadLocationData();
}, []);

  // Calculate most common names
  const getCommonLocationNames = () => {
    const nameFrequency = {};
    allRockyLocations.forEach(location => {
      nameFrequency[location.name] = (nameFrequency[location.name] || 0) + 1;
    });
    return Object.entries(nameFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  };

  // Calculate states with most locations
  const getStatesWithMostLocations = () => {
    const stateFrequency = {};
    allRockyLocations.forEach(location => {
      stateFrequency[location.state] = (stateFrequency[location.state] || 0) + 1;
    });
    return Object.entries(stateFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  };

  // Get unique states
  const uniqueUSStates = [...new Set(allRockyLocations.map(l => l.state))].sort();

  // Get locations for selected state
  const locationsForSelectedState = selectedUSState 
    ? allRockyLocations.filter(l => l.state === selectedUSState)
    : [];

  // Group locations by state for all countries section
  const locationsGroupedByState = allRockyLocations.reduce((acc, location) => {
    if (!acc[location.state]) {
      acc[location.state] = [];
    }
    acc[location.state].push(location);
    return acc;
  }, {});

// Focus on a specific location
const focusOnMapLocation = (lat, lon, name) => {
  // Extract just the main name (before any comma)
  const mainName = name.split(',')[0].trim();
  
  // Clean the name to be URL-friendly:
  // 1. Replace spaces with hyphens
  // 2. Remove special characters
  // 3. Convert to lowercase
  const cleanName = mainName
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '') // Remove special chars
    .toLowerCase(); // Convert to lowercase
  
  // Open the how-far-is page with just the clean name
  window.open(`/location-from-me/how-far-is-${cleanName}-from-me`, '_blank');
};


  return (
    <>
    <Head>
        <title>LocateMyCity</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <header className="site-header">
        <div className="header-wrapper">
          {/* Floating circles */}
          <div className="decorative-circle" style={{ width: '80px', height: '80px', top: '20%', left: '10%' }}></div>
          <div className="decorative-circle" style={{ width: '120px', height: '120px', bottom: '-30%', right: '15%' }}></div>
          <div className="decorative-circle" style={{ width: '60px', height: '60px', top: '50%', left: '80%' }}></div>
          
          <div className="header-content-wrapper">
            <div className="site-logo">
              <Image 
                src="/Images/cityfav.png" 
                alt="LocateMyCity Logo" 
                width={50} 
                height={50} 
                className="logo-img"
                priority
              />
              LocateMyCity
            </div>
            <nav className="main-navigation">
              <a href="/" title="Home">HOME</a>
              <Link href="/about">ABOUT US</Link>
              <Link href="/contact">CONTACT US</Link>
            </nav>
          </div>
        </div>
      </header>
      <Head>
        <title>Rocky Locations Explorer</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <section className="hero-banner">
        <div className="content-container">
          <h1 className="main-heading">Cities with "Rock" in the Name</h1>
          <p className="hero-subtitle">Discover unique U.S. cities celebrating America's geological heritage</p>
        </div>
      </section>

      <main className="main-content">
        <section className="location-statistics">
          <div className="content-container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <h3 className="stat-title">Most Common Names</h3>
                  <ul className="stat-list">
                    {isDataLoading ? (
                      <div className="loading-indicator"><div className="loading-spinner"></div></div>
                    ) : (
                      getCommonLocationNames().map(([name, count]) => (
                        <li key={name} className="stat-item">
                          <span>{name}</span> <strong>{count} locations</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-content">
                  <h3 className="stat-title">States with Most</h3>
                  <ul className="stat-list">
                    {isDataLoading ? (
                      <div className="loading-indicator"><div className="loading-spinner"></div></div>
                    ) : (
                      getStatesWithMostLocations().map(([state, count]) => (
                        <li key={state} className="stat-item">
                          <span>{state}</span> <strong>{count} cities</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-content">
                  <h3 className="stat-title">Notable Locations</h3>
                  <ul className="stat-list">
                    {isDataLoading ? (
                      <div className="loading-indicator"><div className="loading-spinner"></div></div>
                    ) : (
                      [
                        { name: "Little Rock, AR", description: "State Capital" },
                        { name: "Rockville, MD", description: "DC Suburb" },
                        { name: "Rock Springs, WY", description: "Historic" },
                        { name: "Rock Hill, SC", description: "Major City" }
                      ].map(location => (
                        <li key={location.name} className="stat-item">
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
        
        <section className="interactive-map-section">
          <div className="content-container">
            <h2 className="section-heading">Interactive Map</h2>
            {isDataLoading ? (
              <div className="loading-indicator"><div className="loading-spinner"></div></div>
            ) : (
              <MapWithNoSSR locations={allRockyLocations} />
            )}
          </div>
        </section>
        
        <section className="state-browser-section">
          <div className="content-container">
            <h2 className="section-heading">Browse by State</h2>
            <div className="state-buttons-container">
              {isDataLoading ? (
                <div className="loading-indicator"><div className="loading-spinner"></div></div>
              ) : (
                uniqueUSStates.map(state => (
                  <button 
                    key={state} 
                    className="state-button" 
                    onClick={() => setSelectedUSState(state)}
                  >
                    <span>{state}</span>
                  </button>
                ))
              )}
            </div>
            {selectedUSState && (
              <div className="state-locations-container" style={{ marginTop: '2rem' }}>
                <div className="state-location-group">
                  <h3 className="state-group-heading">{selectedUSState}</h3>
                  <div className="location-list">
                    {locationsForSelectedState.map(location => (
        <div key={`${location.name}-${location.county}-${location.lat}-${location.lon}`} className="location-item">
          <span className="location-name">{location.name}</span>
          <button 
            className="map-view-button" 
            onClick={() => focusOnMapLocation(location.lat, location.lon, location.name)}
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
        
        <section className="all-locations-section">
          <div className="content-container">
            <h2 className="section-heading">All Locations by State</h2>
            {isDataLoading ? (
              <div className="loading-indicator"><div className="loading-spinner"></div></div>
            ) : (
              Object.keys(locationsGroupedByState).sort().map(state => (
                <div key={state} className="state-location-group">
                  <h3 className="state-group-heading">{state}</h3>
                  <div className="location-list">
                    {locationsGroupedByState[state].map(location => (
                      <div key={`${location.name}-${location.county}-${location.lat}-${location.lon}`} className="location-item">
                        <span className="location-name">{location.name}</span>
                        <button 
                          className="map-view-button" 
                          onClick={() => focusOnMapLocation(location.lat, location.lon, location.name)}
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
        </section><Footer />
      
      </main>
      

     
    </>
  );
}