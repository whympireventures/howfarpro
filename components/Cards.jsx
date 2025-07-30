"use client";

import Head from 'next/head';
import Link from 'next/link';

export default function Features() {
  return (
    <>
      <Head>
        <title>LocateMyCity - Features</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <section className="features-section">
        <div className="floating-elements">
          <div className="floating-element" style={{ width: '40px', height: '40px', top: '10%', left: '5%', animationDelay: '0s' }}></div>
          <div className="floating-element" style={{ width: '60px', height: '60px', top: '70%', left: '85%', animationDelay: '2s' }}></div>
          <div className="floating-element" style={{ width: '30px', height: '30px', top: '30%', left: '90%', animationDelay: '4s' }}></div>
          <div className="floating-element" style={{ width: '50px', height: '50px', top: '80%', left: '10%', animationDelay: '6s' }}></div>
        </div>

        <div className="section-title">
          <h2>Explore Location Features</h2>
        </div>

        <div className="cards-container">
          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="location">📍</span>
            </div>
            <h3>Distance From Me</h3>
            <p>Calculate precise distances from your current location to any destination. Get accurate measurements in miles or kilometers with real-time updates.</p>
            <Link href="/location-from-me/locationfromme"><button className="card-btn">Calculate Distance</button></Link>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="route">🗺️</span>
            </div>
            <h3>Location to Location</h3>
            <p>Compare distances between any two points of interest. Perfect for planning trips or finding the most convenient routes between locations.</p>
            <Link href="/location-from-location/locationtolocation"><button className="card-btn">Compare Locations</button></Link>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="rock">🪨</span>
            </div>
            <h3>Rock Cities</h3>
            <p>Discover amazing rock formations and geological wonders in cities worldwide. Explore nature's most impressive stone architectures.</p>
            <Link href="/rock"><button className="card-btn">Explore Rocks</button></Link>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="spring">💧</span>
            </div>
            <h3>Spring Cities</h3>
            <p>Find cities known for their beautiful springs and water features. Perfect for planning refreshing getaways to water-rich destinations.</p>
            <Link href="/spring"><button className="card-btn">Discover Springs</button></Link>
          </div>
        </div>

        
      </section>

  
    </>
  );
}
