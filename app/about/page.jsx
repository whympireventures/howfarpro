'use client';
import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const AboutPage = () => {
  const features = [
    { icon: '📍', title: 'Distance Calculators', description: 'Measure in miles, kilometers, or nautical miles—perfect for travelers and planners.' },
    { icon: '🏙️', title: 'City/Town Classifier', description: 'Instantly check if a location is officially a city, town, or something else.' },
    { icon: '👻', title: 'Ghost Town Verifier', description: 'Discover abandoned settlements and verify their status with ease.' },
    { icon: '🔍', title: 'Search by Keyword', description: 'Find places by name or keywords like "rock", "spring", or "island".' },
  ];

  const promises = [
    { emoji: '⚡', text: 'Fast-loading pages – No waiting, just answers.' },
    { emoji: '🌎', text: 'Global coverage – From cities to ghost towns.' },
    { emoji: '🎯', text: 'Precise results – Reliable data anytime.' },
    { emoji: '✨', text: 'Simple design – Easy to use for everyone.' },
    { emoji: '📡', text: 'Open data – Transparent and trustworthy.' },
    { emoji: '⏳', text: 'Ready when you are – Explore on your time.' },
  ];

  return (
    <div className="about-page">
      <Header />

      <main className="about-main">
        {/* Hero */}
        <section className="about-hero">
          <h1>About <span>LocateMyCity</span></h1>
          <p>Discover the world — one location at a time. Whether you're exploring ghost towns, 
          checking distance to a tropical island, or verifying a city's status — our tools make it simple.</p>
        </section>

        {/* What We Do */}
        <section className="about-what-we-do">
          <h2>What We Do</h2>
          <div className="about-features">
            {features.map((card, index) => (
              <div key={index} className="about-feature-card">
                <div className="icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why We Built This */}
        <section className="about-why">
          <h2>Why We Built This</h2>
          <p>
            We believe location data should be fast, accurate, and accessible — no clutter, no confusion.
            Whether you're a traveler, researcher, or simply curious, LocateMyCity gives you tools to explore smarter.
          </p>
        </section>

        {/* Our Promise */}
        <section className="about-promise">
          <h2>Our Promise</h2>
          <div className="about-promises">
            {promises.map((item, index) => (
              <div key={index} className="about-promise-card">
                <span className="emoji">{item.emoji}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <h3>Start Exploring Today</h3>
          <p>Dive into the world with LocateMyCity — where every location tells a story.</p>
          <button>Try Our Tools Now</button>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .about-page {
          background: linear-gradient(to bottom right, #f0f4ff, #e0e7ff);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: Arial, sans-serif;
        }
        .about-main {
          flex-grow: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px;
        }
        section {
          margin-bottom: 80px;
        }
        .about-hero {
          text-align: center;
        }
        .about-hero h1 {
          font-size: 3rem;
          color: #1e3a8a;
          margin-bottom: 20px;
        }
        .about-hero h1 span {
          color: #2563eb;
        }
        .about-hero p {
          max-width: 700px;
          margin: 0 auto;
          color: #4b5563;
          font-size: 1.2rem;
          line-height: 1.6;
        }
        .about-what-we-do h2,
        .about-why h2,
        .about-promise h2 {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 40px;
          color: #4338ca;
        }
        .about-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }
        .about-feature-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .about-feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        .about-feature-card .icon {
          font-size: 2rem;
          margin-bottom: 15px;
        }
        .about-feature-card h3 {
          font-size: 1.3rem;
          color: #1e3a8a;
          margin-bottom: 10px;
        }
        .about-feature-card p {
          color: #4b5563;
          font-size: 0.95rem;
        }
        .about-why {
          background: white;
          padding: 40px;
          border-left: 6px solid #2563eb;
          border-radius: 20px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        .about-why p {
          color: #374151;
          line-height: 1.6;
        }
        .about-promises {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .about-promise-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.2s ease;
        }
        .about-promise-card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }
        .about-promise-card .emoji {
          font-size: 1.8rem;
        }
        .about-promise-card p {
          color: #4b5563;
          font-size: 0.95rem;
        }
        .about-cta {
          text-align: center;
        }
        .about-cta h3 {
          font-size: 2rem;
          color: #1e3a8a;
          margin-bottom: 15px;
        }
        .about-cta p {
          color: #4b5563;
          margin-bottom: 20px;
        }
        .about-cta button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s ease, transform 0.2s ease;
        }
        .about-cta button:hover {
          background: #1d4ed8;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
