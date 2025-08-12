'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MetricCard } from '@/components/DistanceComponents';
import { FaGlobe, FaAnchor, FaPlane } from 'react-icons/fa';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false });


const LeafletMap = dynamic(() => import('../../components/LeafletMap'), { ssr: false });

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_HEADERS = {
  'User-Agent': 'LocateMyCity/1.0 (contact: dev@locatemycity.com)',
  'Accept-Language': 'en'
};

// helpers
const toRad = d => d * Math.PI / 180;
const kmToMiles = km => km * 0.621371;
const kmToNmi = km => km * 0.539957;
const flightHours = km => (km / 800).toFixed(1); // avg jet ~800 km/h
const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const x = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
};

export default function Page({ params }) {
  const raw = decodeURIComponent(params.location || '');
  const destinationQuery = raw.replace(/-/g, ' ').trim();

  const [me, setMe] = useState(null);
  const [dest, setDest] = useState(null);
  const [km, setKm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState('');

  // 1) Get "me" via browser geolocation (fallback: NYC)
  useEffect(() => {
    let resolved = false;
    const fallback = () => {
      if (!resolved) {
        resolved = true;
        setMe({ lat: 40.7128, lng: -74.0060, name: 'Your Location (fallback NYC)' });
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          resolved = true;
          setMe({ lat: coords.latitude, lng: coords.longitude, name: 'Your Location' });
        },
        (err) => {
          setGeoError(err?.message || 'Geolocation denied');
          fallback();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
      // hard timeout fallback
      setTimeout(fallback, 12000);
    } else {
      setGeoError('Geolocation not supported');
      fallback();
    }
  }, []);

  // 2) Geocode destination from slug
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(
          `${NOMINATIM_URL}?q=${encodeURIComponent(destinationQuery)}&format=json&limit=1&email=dev@locatemycity.com`,
          { headers: NOMINATIM_HEADERS }
        );
        const data = await res.json();
        if (!data?.length) {
          setDest(null);
          return;
        }
        const d = data[0];
        setDest({ lat: parseFloat(d.lat), lng: parseFloat(d.lon), name: d.display_name });
      } catch (e) {
        setDest(null);
      }
    };
    if (destinationQuery) run();
  }, [destinationQuery]);

  // 3) Compute distance
  useEffect(() => {
    if (!me || !dest) return;
    setLoading(true);
    const distance = haversineKm(me, dest);
    setKm(distance);
    setLoading(false);
  }, [me, dest]);

  if (!destinationQuery) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center p-8">
          <p>Missing destination in URL.</p>
        </main>
        <Footer />
      </>
    );
  }

  const title = dest
    ? `How far is ${raw.replace(/-/g,' ')} from me?`
    : `How far is ${raw.replace(/-/g,' ')} from me | Calculating...`;

  return (
    <>
      <Header />
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={`Calculate the distance from your current location to ${raw.replace(/-/g,' ')} in miles, kilometers, and nautical miles. Estimated flight time included.`}
        />
      </Head>

      <div className="distance-result__header">
        <div className="distance-result__header-content">
          <h1 className="distance-result__title">
            How far is <span className="distance-result__highlight">{raw.replace(/-/g,' ')}</span> from <span className="distance-result__highlight">me</span>?
          </h1>
          {geoError && <p className="text-sm opacity-70">Note: {geoError}. Using fallback location.</p>}
          {!loading && km != null && dest && me && (
            <p className="distance-result__description">
              It’s about <strong>{kmToMiles(km).toFixed(1)} miles</strong> ({km.toFixed(1)} km). Estimated flight time ~ <strong>{flightHours(km)} hours</strong>.
            </p>
          )}
        </div>
      </div>

      <main className="distance-result__container">
        <section className="distance-result__map-section">
          <div className="distance-result__map-wrapper">
            {me && dest ? (
              <LeafletMap
                source={{ lat: me.lat, lng: me.lng, name: me.name }}
                destination={{ lat: dest.lat, lng: dest.lng, name: dest.name }}
                distance={km || 0}
              />
            ) : (
              <div className="p-8 text-center">Loading map…</div>
            )}
          </div>
        </section>

        {!loading && km != null && (
          <section className="distance-result__metrics">
            <h2 className="distance-result__section-title">Distance Information</h2>
            <div className="distance-result__metrics-grid">
              <MetricCard icon={<FaGlobe />} title="Kilometers" value={km.toFixed(1)} unit="km" variant="blue" />
              <MetricCard icon={<FaGlobe />} title="Miles" value={kmToMiles(km).toFixed(1)} unit="mi" variant="green" />
              <MetricCard icon={<FaAnchor />} title="Nautical Miles" value={kmToNmi(km).toFixed(1)} unit="nmi" variant="purple" />
              <MetricCard icon={<FaPlane />} title="Flight Time" value={flightHours(km)} unit="hours" variant="red" />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
