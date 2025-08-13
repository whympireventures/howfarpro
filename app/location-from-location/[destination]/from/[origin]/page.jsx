'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MetricCard, WeatherPanel } from '@/components/DistanceComponents';
import { FaGlobe, FaAnchor, FaPlane } from 'react-icons/fa';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false });

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_HEADERS = {
  'User-Agent': 'LocateMyCity/1.0 (contact: dev@locatemycity.com)',
  'Accept-Language': 'en',
};

// helpers
const toRad = (d) => d * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;
const kmToNmi   = (km) => km * 0.539957;
const flightHours = (km) => (km / 800).toFixed(1); // avg jet ~800 km/h
const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const x = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
};

// Very small country → currency/language map (extend as needed)
const COUNTRY_META = {
  bs: { currency: 'BSD', language: 'English' },
  us: { currency: 'USD', language: 'English' },
  ca: { currency: 'CAD', language: 'English/French' },
  gb: { currency: 'GBP', language: 'English' },
  fr: { currency: 'EUR', language: 'French' },
  jp: { currency: 'JPY', language: 'Japanese' },
  au: { currency: 'AUD', language: 'English' },
  ae: { currency: 'AED', language: 'Arabic' },
  de: { currency: 'EUR', language: 'German' },
  es: { currency: 'EUR', language: 'Spanish' },
  it: { currency: 'EUR', language: 'Italian' },
};

function getCountryMeta(code) {
  if (!code) return { currency: '—', language: '—' };
  const meta = COUNTRY_META[code.toLowerCase()];
  return meta ?? { currency: '—', language: '—' };
}

async function geocode(q) {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1&email=dev@locatemycity.com`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;
  const d = data[0];
  const label =
    d.display_name?.split(',').slice(0, 2).join(', ').trim() ||
    d.display_name ||
    q;
  return {
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
    name: label,
    countryCode: d.address?.country_code ?? null,
  };
}

// weather fetcher (Open-Meteo, no key)
async function fetchWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m&daily=sunrise,sunset&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather failed');
  const json = await res.json();

  const temp = json?.current?.temperature_2m;
  const wind = json?.current?.wind_speed_10m;
  const tz = json?.timezone ?? 'UTC';
  const sunrise = json?.daily?.sunrise?.[0] ?? '';
  const sunset  = json?.daily?.sunset?.[0] ?? '';

  const fmtTime = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: tz });
    } catch {
      return iso;
    }
  };

  const localtime = new Date().toLocaleString([], { timeZone: tz });

  return {
    temp: (temp != null ? `${temp}°C` : '—'),
    wind: (wind != null ? `${wind} km/h` : '—'),
    sunrise: fmtTime(sunrise),
    sunset: fmtTime(sunset),
    timezone: tz,
    localtime,
  };
}

export default function Page({ params }) {
  const rawDest = decodeURIComponent(params.destination || '');
  const rawOrig = decodeURIComponent(params.origin || '');

  const destinationQuery = rawDest.replace(/-/g, ' ').trim();
  const originQuery      = rawOrig.replace(/-/g, ' ').trim();

  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [km, setKm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // weather/general info
  const [originWX, setOriginWX] = useState(null);
  const [destWX, setDestWX] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!originQuery || !destinationQuery) return;
      setLoading(true);
      setErr('');

      try {
        const [gO, gD] = await Promise.all([geocode(originQuery), geocode(destinationQuery)]);
        if (cancelled) return;

        if (!gO || !gD) {
          setErr((!gO && !gD)
            ? 'Could not geocode either location.'
            : (!gO)
              ? `Could not geocode "${originQuery}".`
              : `Could not geocode "${destinationQuery}".`);
          setOrigin(null); setDest(null); setKm(null); setLoading(false);
          return;
        }

        setOrigin(gO);
        setDest(gD);
        const kmVal = haversineKm(gO, gD);
        setKm(kmVal);

        // Load weather in parallel
        const [wxO, wxD] = await Promise.all([fetchWeather(gO.lat, gO.lng), fetchWeather(gD.lat, gD.lng)]);
        if (!cancelled) {
          setOriginWX(wxO);
          setDestWX(wxD);
        }

        setLoading(false);
      } catch {
        if (!cancelled) {
          setErr('Geocoding or weather failed. Please try again.');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [originQuery, destinationQuery]);

  const prettyDest = rawDest.replace(/-/g, ' ');
  const prettyOrig = rawOrig.replace(/-/g, ' ');
  const title = (!loading && km != null)
    ? `How far is ${prettyDest} from ${prettyOrig}?`
    : `How far is ${prettyDest} from ${prettyOrig} | Calculating...`;

  if (!originQuery || !destinationQuery) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center p-8">
          <p>Missing origin or destination in URL.</p>
        </main>
        <Footer />
      </>
    );
  }

  // Build WeatherPanel props once origin/dest + weather are ready
  const originGeneral = origin && originWX ? {
    location: origin.name,
    weather: {
      temp: originWX.temp,
      wind: originWX.wind,
      sunrise: originWX.sunrise,
      sunset: originWX.sunset,
      coordinates: `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}`,
      currency: getCountryMeta(origin.countryCode).currency,
      language: getCountryMeta(origin.countryCode).language,
      localtime: originWX.localtime,
    },
  } : null;

  const destGeneral = dest && destWX ? {
    location: dest.name,
    weather: {
      temp: destWX.temp,
      wind: destWX.wind,
      sunrise: destWX.sunrise,
      sunset: destWX.sunset,
      coordinates: `${dest.lat.toFixed(4)}, ${dest.lng.toFixed(4)}`,
      currency: getCountryMeta(dest.countryCode).currency,
      language: getCountryMeta(dest.countryCode).language,
      localtime: destWX.localtime,
    },
  } : null;

  return (
    <>
      <Header />
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={`Calculate the distance from ${prettyOrig} to ${prettyDest} in miles, kilometers, and nautical miles, with an estimated flight time.`}
        />
      </Head>

      <div className="distance-result__header">
        <div className="distance-result__header-content">
          <h1 className="distance-result__title">
            How far is <span className="distance-result__highlight">{prettyDest}</span> from{' '}
            <span className="distance-result__highlight">{prettyOrig}</span>?
          </h1>

          {err && <p className="text-sm opacity-70">{err}</p>}

          {!loading && km != null && origin && dest && (
            <p className="distance-result__description">
              It’s about <strong>{kmToMiles(km).toFixed(1)} miles</strong> ({km.toFixed(1)} km).
              Estimated flight time ~ <strong>{flightHours(km)} hours</strong>.
            </p>
          )}
        </div>
      </div>

      <main className="distance-result__container">
        <section className="distance-result__map-section">
          <div className="distance-result__map-wrapper">
            {origin && dest ? (
              <LeafletMap
                source={{ lat: origin.lat, lng: origin.lng, name: origin.name }}
                destination={{ lat: dest.lat, lng: dest.lng, name: dest.name }}
                distance={km || 0}
              />
            ) : (
              <div className="p-8 text-center">{loading ? 'Loading map…' : 'No map to show.'}</div>
            )}
          </div>
        </section>

        {!loading && km != null && (
          <section className="distance-result__metrics">
            <h2 className="distance-result__section-title">Distance Information</h2>
            <div className="distance-result__metrics-grid">
              <MetricCard icon={<FaGlobe />}  title="Kilometers"     value={km.toFixed(1)}            unit="km"    variant="blue" />
              <MetricCard icon={<FaGlobe />}  title="Miles"          value={kmToMiles(km).toFixed(1)} unit="mi"    variant="green" />
              <MetricCard icon={<FaAnchor />} title="Nautical Miles" value={kmToNmi(km).toFixed(1)}   unit="nmi"   variant="purple" />
              <MetricCard icon={<FaPlane />}  title="Flight Time"    value={flightHours(km)}          unit="hours" variant="red" />
            </div>
          </section>
        )}

        {/* NEW: Weather & General Info for both locations */}
        {(originGeneral || destGeneral) && (
          <section className="distance-result__weather-section">
            <h2 className="distance-result__section-title">Weather & General Info</h2>
            <div className="distance-result__weather-grid">
              {originGeneral ? (
                <WeatherPanel type="origin" location={originGeneral.location} weather={originGeneral.weather} />
              ) : (
                <div className="distance-result__weather-panel">Loading origin info…</div>
              )}

              {destGeneral ? (
                <WeatherPanel type="destination" location={destGeneral.location} weather={destGeneral.weather} />
              ) : (
                <div className="distance-result__weather-panel">Loading destination info…</div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
