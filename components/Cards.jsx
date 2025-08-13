"use client";

import Head from 'next/head';
import Link from 'next/link';

export default function Features() {
  return (
    <>
      <Head>
        <title>How Far From Me - Features</title>
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
    <h3>Popular Locations</h3>
    <p>Calculate precise distances from your current location to any destination. Get accurate measurements in miles or kilometers with real-time updates.</p>

    <p>
      Check out top search locations like{" "}
      <a href="/how-far-is-nassau-bahamas-from-me">Nassau, Bahamas</a>,{" "}
      <a href="/how-far-is-paris-france-from-me">Paris, France</a>,{" "}
      <a href="/how-far-is-london-england-from-me">London, England</a>,{" "}
      <a href="/how-far-is-tokyo-japan-from-me">Tokyo, Japan</a>,{" "}
      <a href="/how-far-is-sydney-australia-from-me">Sydney, Australia</a>,{" "}
      <a href="/how-far-is-dubai-uae-from-me">Dubai, UAE</a>.
    </p>
  </div>
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
            <p>Explore cities and towns with “rock” in their name—unique places tied together by one powerful word.</p>
            <Link href="/rock"><button className="card-btn">Explore Rocks</button></Link>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="spring">💧</span>
            </div>
            <h3>Spring Cities</h3>
            <p>Explore cities with “Spring” in their name—perfect for discovering places that sound refreshing, whether or not water is involved.</p>
            <Link href="/spring"><button className="card-btn">Discover Springs</button></Link>
          </div>
        </div>

        
      </section>

  
  );
}

