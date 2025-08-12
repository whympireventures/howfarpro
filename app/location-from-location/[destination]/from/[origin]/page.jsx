// app/location-from-location/[destination]/from/[origin]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MetricCard } from '@/components/DistanceComponents';
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

async function geocode(q) {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(q)}&format=json&limit=1&email=dev@locatemycity.com`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;
  const d = data[0];
  return { lat: parseFloat(d.lat), lng: parseFloat(d.lon), name: d.display_name };
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

  // Geocode both locations, then compute distance
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!originQuery || !destinationQuery) return;
      setLoading(true);
      setErr('');

      try {
        const [gO, gD] = await Promise.all([
          geocode(originQuery),
          geocode(destinationQuery),
        ]);

        if (cancelled) return;

        if (!gO || !gD) {
          setErr(
            (!gO && !gD) ? 'Could not geocode either location.' :
            (!gO) ? `Could not geocode "${originQuery}".` :
                    `Could not geocode "${destinationQuery}".`
          );
          setOrigin(null); setDest(null); setKm(null); setLoading(false);
          return;
        }

        setOrigin(gO);
        setDest(gD);
        setKm(haversineKm(gO, gD));
        setLoading(false);
      } catch {
        if (!cancelled) {
          setErr('Geocoding failed. Please try again.');
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
              <MetricCard icon={<FaGlobe />}  title="Kilometers"     value={km.toFixed(1)}            unit="km"   variant="blue" />
              <MetricCard icon={<FaGlobe />}  title="Miles"          value={kmToMiles(km).toFixed(1)} unit="mi"   variant="green" />
              <MetricCard icon={<FaAnchor />} title="Nautical Miles" value={kmToNmi(km).toFixed(1)}   unit="nmi"  variant="purple" />
              <MetricCard icon={<FaPlane />}  title="Flight Time"    value={flightHours(km)}          unit="hours" variant="red" />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
