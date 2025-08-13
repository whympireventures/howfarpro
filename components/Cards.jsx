"use client";

import Head from "next/head";
import Link from "next/link";

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
          <div
            className="floating-element"
            style={{ width: "40px", height: "40px", top: "10%", left: "5%", animationDelay: "0s" }}
          />
          <div
            className="floating-element"
            style={{ width: "60px", height: "60px", top: "70%", left: "85%", animationDelay: "2s" }}
          />
          <div
            className="floating-element"
            style={{ width: "30px", height: "30px", top: "30%", left: "90%", animationDelay: "4s" }}
          />
          <div
            className="floating-element"
            style={{ width: "50px", height: "50px", top: "80%", left: "10%", animationDelay: "6s" }}
          />
        </div>

        <div className="section-title">
          <h2>Explore Location Features</h2>
        </div>

        <div className="cards-container">
          {/* Popular Locations */}
          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="location">📍</span>
            </div>
            <h3>Popular Locations</h3>
            <h3>
               Check out top search locations 
            </h3>
            <p className="mt-2 leading-relaxed [text-wrap:pretty]">
   <Link href="/how-far-is-nassau-bahamas-from-me" className="hover:underline">
    <span className="whitespace-nowrap">Nassau, Bahamas</span>
  </Link>,{" "}
  <Link href="/how-far-is-paris-france-from-me" className="hover:underline">
    <span className="whitespace-nowrap">Paris, France</span>
  </Link>,{" "}
  <Link href="/how-far-is-london-england-from-me" className="hover:underline">
    <span className="whitespace-nowrap">London, England</span>
  </Link>,{" "}
  <Link href="/how-far-is-tokyo-japan-from-me" className="hover:underline">
    <span className="whitespace-nowrap">Tokyo, Japan</span>
  </Link>,{" "}
  <Link href="/how-far-is-sydney-australia-from-me" className="hover:underline">
    <span className="whitespace-nowrap">Sydney, Australia</span>
  </Link>,{" "}
  <Link href="/how-far-is-dubai-uae-from-me" className="hover:underline">
    <span className="whitespace-nowrap">Dubai, UAE</span>
  </Link>.
</p>
          </div>

          {/* Location to Location */}
          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="route">🗺️</span>
            </div>
            <h3>Location to Location</h3>
            <p>
              Compare distances between any two points of interest. Perfect for planning trips or finding
              the most convenient routes between locations.
            </p>
            <Link href="/location-from-location/locationtolocation">
              <button className="card-btn">Compare Locations</button>
            </Link>
          </div>

          {/* Rock Cities */}
          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="rock">🪨</span>
            </div>
            <h3>Rock Cities</h3>
            <p>
              Explore cities and towns with “rock” in their name—unique places tied together by one powerful word.
            </p>
            <Link href="/rock">
              <button className="card-btn">Explore Rocks</button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

