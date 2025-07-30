'use client';

import { FaGlobe, FaSun, FaWind, FaPlane, FaAnchor, FaClock } from 'react-icons/fa';
import { WiSunrise, WiSunset } from 'react-icons/wi';

export const MetricCard = ({ icon, title, value, unit, variant = 'blue' }) => {
  const variantClasses = {
    blue: 'distance-result__metric-card--blue',
    green: 'distance-result__metric-card--green',
    purple: 'distance-result__metric-card--purple',
    red: 'distance-result__metric-card--red'
  };

  return (
    <div className={`distance-result__metric-card ${variantClasses[variant]}`}>
      <div className="distance-result__metric-icon">
        {icon}
      </div>
      <h3 className="distance-result__metric-title">{title}</h3>
      <p className="distance-result__metric-value">{value}</p>
      <p className="distance-result__metric-unit">{unit}</p>
    </div>
  );
};

export const WeatherPanel = ({ location, weather, type }) => (
  <div className={`distance-result__weather-panel distance-result__weather-panel--${type}`}>
    <div className="distance-result__weather-header">
      <h3 className="distance-result__weather-location">{location}</h3>
    </div>
    <div className="distance-result__weather-content">
      <WeatherDetail icon={<FaSun />} label="Temperature" value={weather.temp} />
      <WeatherDetail icon={<FaWind />} label="Wind Speed" value={weather.wind} />
      <WeatherDetail icon={<WiSunrise />} label="Sunrise" value={weather.sunrise} />
      <WeatherDetail icon={<WiSunset />} label="Sunset" value={weather.sunset} />
      <WeatherDetail icon={<FaGlobe />} label="Coordinates" value={weather.coordinates} />
      <WeatherDetail icon={<span>$</span>} label="Currency" value={weather.currency} />
      <WeatherDetail icon={<span>🗣️</span>} label="Language" value={weather.language} />
      <WeatherDetail icon={<FaClock />} label="Local Time" value={weather.localtime} />
      <div className="distance-result__weather-footer">
        <p className="distance-result__weather-update">Last updated: Just now</p>
      </div>
    </div>
  </div>
);
const WeatherDetail = ({ icon, label, value }) => (
  <div className="distance-result__weather-detail">
    <div className="distance-result__weather-icon">
      {icon}
    </div>
    <div>
      <p className="distance-result__weather-label">{label}</p>
      <p className="distance-result__weather-value">{value}</p>
    </div>
  </div>
);

export const FAQItem = ({ question, answer, isOpen, toggle }) => (
  <div className="distance-result__faq-item">
    <button
      onClick={toggle}
      className={`distance-result__faq-question ${isOpen ? 'distance-result__faq-question--open' : ''}`}
    >
      <span>{question}</span>
      <span className="distance-result__faq-chevron">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </button>
    <div className={`distance-result__faq-answer ${isOpen ? 'distance-result__faq-answer--open' : ''}`}>
      <p>{answer}</p>
    </div>
  </div>
);

export const RouteCard = ({ source, destination, onClick }) => (
  <div className="distance-result__route-card" onClick={onClick}>
    <div className="distance-result__route-source">
      <div className="distance-result__route-dot distance-result__route-dot--source"></div>
      <p>{source}</p>
    </div>
    <div className="distance-result__route-destination">
      <div className="distance-result__route-dot distance-result__route-dot--destination"></div>
      <p>{destination}</p>
    </div>
    <div className="distance-result__route-footer">
      <span>Calculate distance</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </div>
  </div>
);