'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../../components/Footer'

// Dynamically import Leaflet
const MapWithNoSSR = dynamic(() => import('../../components/MapComponent'), { ssr: false });

export default function SpringLocationsExplorer() {
  const [allSprings, setAllSprings] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const backendUrl = 'https://locate-my-city-backend-production-e8a2.up.railway.app';
        console.log("Fetching from:", backendUrl);

        const response = await fetch(`${backendUrl}/api/springs/flat`);
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);
        setAllSprings(data);
      } catch (error) {
        console.error('Error loading spring data:', error);
        // Fallback data if API fails
        setAllSprings([
          {
            name: "Blue Springs",
            state: "Alabama",
            lat: 31.66128,
            lon: -85.50744,
            county: null
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const commonNames = () => {
    const nameCounts = {};
    allSprings.forEach(loc => {
      nameCounts[loc.name] = (nameCounts[loc.name] || 0) + 1;
    });
    return Object.entries(nameCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  };

  const statesMost = () => {
    const stateCounts = {};
    allSprings.forEach(loc => {
      stateCounts[loc.state] = (stateCounts[loc.state] || 0) + 1;
    });
    return Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  };

  const uniqueStates = [...new Set(allSprings.map(l => l.state))].sort();
  const stateLocations = selectedState ? allSprings.filter(l => l.state === selectedState) : [];

  const locationsByState = allSprings.reduce((acc, loc) => {
    if (!acc[loc.state]) acc[loc.state] = [];
    acc[loc.state].push(loc);
    return acc;
  }, {});

  const focusOnLocation = (lat, lon, name) => {
  // Create a clean URL path
  const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const cleanUrl = `/location-from-me/how-far-is-${cleanName}-from-me`;
  
  // Create a hidden form to submit the data
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = cleanUrl;
  form.target = '_blank';
  form.style.display = 'none';

  // Add latitude and longitude as hidden inputs
  const addHiddenField = (name, value) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addHiddenField('lat', lat);
  addHiddenField('lon', lon);

  // Add form to DOM and submit
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

  return (
    <>
      <Head>
        <title>LocateMyCity</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <header className="main-header">
        <div className="header-container">
          {/* Floating circles */}
          <div className="floating-circle" style={{ width: '80px', height: '80px', top: '20%', left: '10%' }}></div>
          <div className="floating-circle" style={{ width: '120px', height: '120px', bottom: '-30%', right: '15%' }}></div>
          <div className="floating-circle" style={{ width: '60px', height: '60px', top: '50%', left: '80%' }}></div>
          
          <div className="header-content">
            <div className="logo">
              <Image 
                src="/Images/cityfav.png" 
                alt="Logo" 
                width={50} 
                height={50} 
                className="logo-image"
                priority
              />
              LocateMyCity
            </div>
            <nav>
              <a href="\" title="Home">HOME</a>
              <Link href="/about">ABOUT US</Link>
              <Link href="/contact">CONTACT US</Link>
            </nav>
          </div>
        </div>
      </header>
      <Head>
        <title>Spring Locations Explorer</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <section className="page-hero">
        <div className="container">
          <h1>Cities with "Spring" in the Name</h1>
          <p className="subtitle">Discover unique U.S. cities named after natural spring</p>
        </div>
      </section>


      <section className="stats-section">
        <div className="container">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-card-content">
                <h3 className="stat-card-title">Most Common Names</h3>
                <ul className="stat-card-list">
                  {isLoading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                  ) : (
                    commonNames().map(([name, count]) => (
                      <li key={name} className="stat-card-item">
                        <span>{name}</span> <strong>{count} locations</strong>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-content">
                <h3 className="stat-card-title">States with Most</h3>
                <ul className="stat-card-list">
                  {isLoading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                  ) : (
                    statesMost().map(([state, count]) => (
                      <li key={state} className="stat-card-item">
                        <span>{state}</span> <strong>{count} cities</strong>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-content">
                <h3 className="stat-card-title">Notable Locations</h3>
                <ul className="stat-card-list">
                  {isLoading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                  ) : (
                    [
                      { name: "Hot Springs, AR", description: "Historic Spa Town" },
                      { name: "Sulphur Springs, TX", description: "Famous for minerals" },
                      { name: "Palm Springs, CA", description: "Desert resort" },
                      { name: "Coral Springs, FL", description: "Master-planned city" }
                    ].map(location => (
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

      <section className="map-section">
        <div className="container">
          <h2 className="section-title">Interactive Map</h2>
          {isLoading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <MapWithNoSSR locations={allSprings} />
          )}
        </div>
      </section>

      <section className="states-section">
        <div className="container">
          <h2 className="section-title">Browse by State</h2>
          <div className="states-container">
            {isLoading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (
              uniqueStates.map(state => (
                <button key={state} className="state-btn" onClick={() => setSelectedState(state)}>
                  <span>{state}</span>
                </button>
              ))
            )}
          </div>
          {selectedState && (
            <div id="state-countries-container" style={{ marginTop: '2rem' }}>
              <div className="state-group">
                <h3 className="state-group-title">{selectedState}</h3>
                <div className="countries-list">
                  {stateLocations.map(loc => (
                    <div key={`${loc.name}-${loc.lat}-${loc.lon}`} className="country-item">
                      <span className="country-name">{loc.name}</span>
                       <button 
  className="view-map-btn" 
  onClick={() => focusOnLocation(loc.lat, loc.lon, loc.name)}
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

      <section className="countries-section">
        <div className="container">
          <h2 className="section-title">All Locations by State</h2>
          {isLoading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            Object.keys(locationsByState).sort().map(state => (
              <div key={state} className="state-group">
                <h3 className="state-group-title">{state}</h3>
                <div className="countries-list">
                  {locationsByState[state].map(loc => (
                    <div key={`${loc.name}-${loc.lat}-${loc.lon}-all`} className="country-item">
                      <span className="country-name">{loc.name}</span>
                      <button 
  className="view-map-btn" 
  onClick={() => focusOnLocation(loc.lat, loc.lon, loc.name)}
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
        <Footer />
      </section>
    


      <style jsx global>{`
        :root {
          --primary-color: #4682B4; /* Steel Blue */
          --secondary-color: #87CEEB; /* Sky Blue */
          --accent-color: #B0E0E6; /* Powder Blue */
          --light-color: #F0F8FF; /* Alice Blue */
          --dark-color: #1E4B6B; /* Darker Blue */
          --text-color: #4a4a4a;
        }
        
        body {
         
          font-family: 'Poppins', sans-serif;
          margin: 0;
          padding: 0;
          color: var(--text-color);
          background-color: var(--secondary-color);
          line-height: 1.6;
        }
          .main-header {
          width: 100%;
          background: linear-gradient(135deg, #6bb9f0 0%, #3498db);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
        }
        
        /* Rest of your header styles remain the same */
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(90deg, #ffffff, #e0e0e0);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
          .logo-image {
          border-radius: 50%;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        /* Navigation styles */
        nav {
          display: flex;
          gap: 20px;
        }

        nav a {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: white;
          text-decoration: none;
          font-weight: 600;
          padding: 12px 25px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 150px;
          height: 50px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.2);
          position: relative;
          overflow: hidden;
        }

        nav a::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: 0.5s;
        }

        nav a:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          background: rgba(255,255,255,0.25);
        }

        nav a:hover::before {
          left: 100%;
        }

        @media (min-width: 1440px) {
  .container {
    max-width: 1400px;
    padding: 2rem 3rem;
  }

  .logo {
    font-size: 2.2rem;
    gap: 20px;
  }

  .logo-image {
    width: 60px !important;
    height: 60px !important;
  }

  nav a {
    font-size: 1.05rem;
    padding: 14px 30px;
    min-width: 180px;
    height: 55px;
  }
}

@media (min-width: 1920px) {
  .container {
    max-width: 1600px;
    padding: 2.5rem 4rem;
  }

  .logo {
    font-size: 2.5rem;
    gap: 25px;
  }

  .logo-image {
    width: 70px !important;
    height: 70px !important;
  }

  nav a {
    font-size: 1.15rem;
    padding: 16px 35px;
    min-width: 200px;
    height: 60px;
  }
}

        /* Floating circles */
        header::before {
          content: "";
          position: absolute;
          top: -50px;
          left: -50px;
          width: 150px;
          height: 150px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          z-index: -1;
        }

        header::after {
          content: "";
          position: absolute;
          bottom: -80px;
          right: -60px;
          width: 200px;
          height: 200px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
          z-index: -1;
        }

        .floating-circle {
          position: absolute;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
          z-index: -1;
          animation: float 15s infinite linear;
        }

        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1.5rem;
          }

          nav {
            width: 100%;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1.5rem;
          }

          nav a {
            width: 100%;
            min-width: auto;
          }

          .logo {
            font-size: 1.5rem;
          }
      }
          .page-hero {
          color: white;
          padding: 3rem 0;
          text-align: center;
          box-shadow: 0 4px 20px rgba(70, 130, 180, 0.2);
          position: relative;
          overflow: hidden;
          margin-top: 80px;
          background: linear-gradient(135deg, #6bb9f0 0%, #3498db);

        }

        .page-hero::before {
          content: '';
          position: absolute;
          top: -50px;
          left: -50px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .page-hero::after {
          content: '';
          position: absolute;
          bottom: -80px;
          right: -80px;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        h1 {
          margin: 0;
          font-size: 2.8rem;
          font-weight: 700;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .subtitle {
          font-size: 1.3rem;
          opacity: 0.9;
          margin-top: 0.5rem;
          font-weight: 300;
          position: relative;
          z-index: 1;
      }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        h1 {
          margin: 0;
          font-size: 2.8rem;
          font-weight: 700;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .subtitle {
          font-size: 1.3rem;
          opacity: 0.9;
          margin-top: 0.5rem;
          font-weight: 300;
          position: relative;
          z-index: 1;
        }
        
        /* Stats Cards Section */
        .stats-section {
          padding: 3rem 0;
          background-color: var(--light-color);
          position: relative;
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 1.5rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(70, 130, 180, 0.1);
          padding: 2rem;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
          border-top: 4px solid var(--accent-color);
          position: relative;
          overflow: hidden;
        }
        
        .stat-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(70, 130, 180, 0.15);
        }
        
        .stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(70, 130, 180, 0.03), rgba(135, 206, 235, 0.03));
          z-index: 0;
        }
        
        .stat-card-content {
          position: relative;
          z-index: 1;
        }
        
        .stat-card-title {
          font-size: 1.1rem;
          color: var(--primary-color);
          margin: 0 0 1rem 0;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .stat-card-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .stat-card-item {
          padding: 0.5rem 0;
          border-bottom: 1px dashed #eee;
          display: flex;
          justify-content: space-between;
        }
        
        .stat-card-item:last-child {
          border-bottom: none;
        }
        
        .stat-card-item strong {
          color: var(--dark-color);
          font-weight: 500;
        }
        
        /* Map Section */
        .map-section {
          padding: 3rem 0;
          background-color: white;
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--dark-color);
          position: relative;
          font-size: 2rem;
          font-weight: 600;
        }
        
        .section-title::after {
          content: '';
          display: block;
          width: 80px;
          height: 4px;
          background: var(--accent-color);
          margin: 0.8rem auto 0;
          border-radius: 2px;
        }
        
        /* States Section */
        .states-section {
          padding: 3rem 0;
          background-color: var(--light-color);
        }
        
        .states-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .state-btn {
          padding: 0.8rem 1.8rem;
          background-color: white;
          border: none;
          border-radius: 50px;
          color: var(--primary-color);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
          box-shadow: 0 4px 10px rgba(70, 130, 180, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .state-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }
        
        .state-btn:hover {
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(70, 130, 180, 0.2);
        }
        
        .state-btn:hover::before {
          opacity: 1;
        }
        
        .state-btn span {
          position: relative;
          z-index: 1;
        }
        
        /* Countries Section */
        .countries-section {
          padding: 3rem 0;
          background-color: white;
        }
        
        .state-group {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 5px 15px rgba(70, 130, 180, 0.05);
          border-left: 4px solid var(--accent-color);
          transition: all 0.3s ease;
        }
        
        .state-group:hover {
          box-shadow: 0 8px 25px rgba(70, 130, 180, 0.1);
        }
        
        .state-group-title {
          color: var(--dark-color);
          margin-top: 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--accent-color);
          font-size: 1.4rem;
          font-weight: 600;
        }
        
        .countries-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .country-item {
         background: var(--light-color);
  padding: 1rem 1.2rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;  /* Center align items horizontally */
  transition: all 0.3s ease;
  text-align: center;   /* Center the text */
        }
        
        .country-item:hover {
          transform: translateX(5px);
          background: white;
          box-shadow: 0 4px 10px rgba(70, 130, 180, 0.1);
        }
        
        .country-name {
          font-weight: 500;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  white-space: normal;
  word-break: break-word;
        }
        
        .view-map-btn {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(70, 130, 180, 0.2);
  margin-top: 0.5rem;
        }
        
        .view-map-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 10px rgba(70, 130, 180, 0.3);
        }
        
        /* Loading Spinner */
        .spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(70, 130, 180, 0.2);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }
        
        /* Pulse Animation */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .stats-container {
            grid-template-columns: 1fr;
          }
          
          #map {
            height: 350px;
          }
          
          h1 {
            font-size: 2.2rem;
          }
          
          .section-title {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </>
  );
}