'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// Load the SmartMap client-side
const SmartMap = dynamic(() => import('@/components/SmartMap'), { ssr: false });

const UA_HEADERS = { 'User-Agent': 'howfarfromme.com (contact: dev@howfarfromme.com)' };

const toRad = (d) => d * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;
const cap = (s) =>
  s ? s.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(' ') : s;

export default function Page({ params }) {
  // URL param: /how-far-is-<location>-from-me  -> params.location = "new-york"
  const destinationSlug = params?.location || '';
  const destinationName = useMemo(
    () => decodeURIComponent(destinationSlug).replace(/-/g, ' ').trim(),
    [destinationSlug]
  );

  const [me, setMe] = useState(null);   // { lat, lng }
  const [dest, setDest] = useState(null); // { lat, lng }
  const [distanceKm, setDistanceKm] = useState(0);
  const [unit, setUnit] = useState('km');
  const [status, setStatus] = useState('init'); // init | locating | geocoding | ready | error

  // 1) Geolocate user (with NYC fallback)
  useEffect(() => {
    setStatus('locating');
    if (!navigator?.geolocation) {
      setMe({ lat: 40.7128, lng: -74.0060 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setMe({ lat: coords.latitude, lng: coords.longitude }),
      () => setMe({ lat: 40.7128, lng: -74.0060 }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // 2) Geocode destination with Nominatim
  useEffect(() => {
    if (!destinationName) return;
    const run = async () => {
      try {
        setStatus('geocoding');
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destinationName)}&format=json&limit=1`;
        const res = await fetch(url, { headers: UA_HEADERS });
        const data = await res.json();
        const p = data?.[0];
        if (!p) throw new Error('No geocode result');
        setDest({ lat: +p.lat, lng: +p.lon });
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };
    run();
  }, [destinationName]);

  // 3) Compute distance when both coords ready
  useEffect(() => {
    if (!me || !dest) return;
    const R = 6371;
    const dLat = toRad(dest.lat - me.lat);
    const dLon = toRad(dest.lng - me.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(me.lat)) *
        Math.cos(toRad(dest.lat)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistanceKm(R * c);
    setStatus('ready');
  }, [me, dest]);

  const sourceCoords = me ? { lat: me.lat, lng: me.lng } : null;
  const destCoords = dest ? { lat: dest.lat, lng: dest.lng } : null;

  const distanceText =
    distanceKm > 0
      ? unit === 'km'
        ? `${distanceKm.toFixed(1)} km`
        : `${kmToMiles(distanceKm).toFixed(1)} mi`
      : '--';

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>How far is {cap(destinationName)} from me?</h1>

      <section style={styles.card}>
        <div style={styles.row}><strong>Status:</strong>&nbsp;<span>{status}</span></div>
        <div style={styles.row}><strong>Your coords:</strong>&nbsp;<span>{me ? `${me.lat.toFixed(5)}, ${me.lng.toFixed(5)}` : 'locating...'}</span></div>
        <div style={styles.row}><strong>Destination:</strong>&nbsp;<span>{dest ? `${dest.lat.toFixed(5)}, ${dest.lng.toFixed(5)}` : 'geocoding...'}</span></div>
        <div style={{ ...styles.row, fontSize: 22, marginTop: 8 }}>
          <strong>Distance:</strong>&nbsp;<span>{distanceText}</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <button
            style={{ ...styles.btn, ...(unit === 'km' ? styles.btnActive : {}) }}
            onClick={() => setUnit('km')}
          >
            Kilometers
          </button>
          <button
            style={{ ...styles.btn, ...(unit === 'mi' ? styles.btnActive : {}) }}
            onClick={() => setUnit('mi')}
          >
            Miles
          </button>
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.h3}>Map</h3>
        {sourceCoords && destCoords ? (
          <div style={{ height: 420 }}>
            <SmartMap
              sourceCoords={sourceCoords}
              destinationCoords={destCoords}
              distance={distanceKm}
            />
          </div>
        ) : (
          <div>Waiting for coordinates…</div>
        )}
      </section>
    </main>
  );
}

const styles = {
  main: { maxWidth: 900, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' },
  h1: { fontSize: 28, marginBottom: 16 },
  h3: { marginTop: 0 },
  card: { background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.04)' },
  row: { display: 'flex', alignItems: 'center', margin: '4px 0' },
  btn: { padding: '6px 10px', marginRight: 8, borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', background: '#f7f7f7' },
  btnActive: { borderColor: '#111', background: '#e9e9e9' }
};
