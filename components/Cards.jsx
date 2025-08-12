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
          <div className="floating-element" style={{ width: '40px', height: '40px', top: '10%', left: '5%', animationDelay: '0s' }} />
          <div className="floating-element" style={{ width: '60px', height: '60px', top: '70%', left: '85%', animationDelay: '2s' }} />
          <div className="floating-element" style={{ width: '30px', height: '30px', top: '30%', left: '90%', animationDelay: '4s' }} />
          <div className="floating-element" style={{ width: '50px', height: '50px', top: '80%', left: '10%', animationDelay: '6s' }} />
        </div>

        <div className="section-title">
          <h2>Explore Location Features</h2>
        </div>

        <div className="cards-container">
          {/* Popular Locations */}
          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="popular">⭐</span>
            </div>
            <h3>Popular Locations</h3>
            <p>Quick links to the places people check most often.</p>
            <ul>
              <li><Link href="/how-far-is-nassau-from-me">How far is Nassau from me?</Link></li>
              <li><Link href="/how-far-is-nassau-from-miami">How far is Nassau from Miami?</Link></li>
              <li><Link href="/how-far-is-halifax-from-boston">How far is Halifax from Boston?</Link></li>
              <li><Link href="/how-far-is-toronto-from-new-york">How far is Toronto from New York?</Link></li>
              <li><Link href="/how-far-is-prince-edward-island-from-me">How far is PEI from me?</Link></li>
            </ul>
            <Link href="/popular">
              <button className="card-btn">Browse All Popular</button>
            </Link>
          </div>

          {/* Top 5 Island Searches */}
          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="islands">🏝️</span>
            </div>
            <h3>Top 5 Island Searches</h3>
            <p>Most‑requested island distance lookups right now.</p>
            <ul>
              <li><Link href="/how-far-is-nassau-from-me">Nassau from me</Link></li>
              <li><Link href="/how-far-is-nassau-from-miami">Nassau from Miami</Link></li>
              <li><Link href="/how-far-is-grand-bahama-from-miami">Grand Bahama from Miami</Link></li>
              <li><Link href="/how-far-is-turks-and-caicos-from-miami">Turks &amp; Caicos from Miami</Link></li>
              <li><Link href="/how-far-is-jamaica-from-miami">Jamaica from Miami</Link></li>
            </ul>
            <Link href="/islands">
              <button className="card-btn">See Island Distances</button>
            </Link>
          </div>

          {/* Most Searched Routes */}
          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="routes">🗺️</span>
            </div>
            <h3>Most Searched Routes</h3>
            <p>Popular city‑to‑city distance checks for trip planning.</p>
            <ul>
              <li><Link href="/how-far-is-miami-from-nassau">Miami ⇄ Nassau</Link></li>
              <li><Link href="/how-far-is-halifax-from-boston">Halifax ⇄ Boston</Link></li>
              <li><Link href="/how-far-is-toronto-from-new-york">Toronto ⇄ New York</Link></li>
              <li><Link href="/how-far-is-london-from-new-york">New York ⇄ London</Link></li>
              <li><Link href="/how-far-is-montreal-from-toronto">Toronto ⇄ Montréal</Link></li>
            </ul>
            <Link href="/routes">
              <button className="card-btn">Explore Routes</button>
            </Link>
          </div>

          {/* Optional: Explore by Region (keeps the grid tidy) */}
          <div className="feature-card">
            <div className="card-icon">
              <span role="img" aria-label="region">🌍</span>
            </div>
            <h3>Explore by Region</h3>
            <p>Jump into curated sets of cities and islands by area.</p>
            <ul>
              <li><Link href="/region/atlantic-canada">Atlantic Canada</Link></li>
              <li><Link href="/region/caribbean">Caribbean</Link></li>
              <li><Link href="/region/usa-southeast">USA – Southeast</Link></li>
              <li><Link href="/region/europe">Europe</Link></li>
            </ul>
            <Link href="/region">
              <button className="card-btn">Browse Regions</button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
