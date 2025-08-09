'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const SmartMap = dynamic(() => import('@/components/SmartMap'), { ssr: false });

const NOMINATIM_HEADERS = { 'User-Agent': 'howfarfromme.com (contact: dev@howfarfromme.com)' };
const toRad = (d) => d * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;

export default function Page({ params }) {
  // /how-far-is-miami-from-me  -> params.location = "miami"
  const destinationName = useMemo(
    () => decodeURIComponent(params.location || '').replace(/-/g, ' ').trim(),
    [params.location]
  );

  const [me, setMe] = useState(null);         // { lat, lng }
  const [dest, setDest] = useState(null);     // { lat, lng }
  const [km, setKm] = useState(0);
  const [unit, setUnit] = useState('km');     // 'km' | 'mi'
  const [status, setStatus] = useState('init'); // init|locating|geocoding|ready|error
  const [error, setError] = useState('');

  // ---- 1) Geolocate user with graceful fallbacks
  useEffect(() => {
    setStatus('locating');
    setError('');

    // Geolocation requires HTTPS (Vercel ok). If not secure, fallback.
    const isSecure = typeof window !== 'undefined' && (location.protocol === 'https:' || location.hostname === 'localhost');
    if (!isSecure || !navigator?.geolocation) {
      setMe({ lat: 40.7128, lng: -74.0060 }); // NYC fallback
      return;
    }

    const watch = navigator.geolocation.getCurrentPosition(
      ({ coords }) => setMe({ lat: coords.latitude, lng: coords.longitude }),
      (e) => {
        setError(e.message || 'Location permission denied. Using default.');
        setMe({ lat: 40.7128, lng: -74.0060 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      // nothing to cleanup for getCurrentPosition, but keep effect symmetric
    };
  }, []);

  // ---- 2) Geocode destination (debounced + abortable)
  const geocodeTimer = useRef(null);
  useEffect(() => {
    if (!destinationName) return;
    setStatus('geocoding');
    setError('');

    const ctrl = new AbortController();
    clearTimeout(geocodeTimer.current);

    geocodeTimer.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destinationName)}&format=json&limit=1`;
        const res = await fetch(url, { headers: NOMINATIM_HEADERS, signal: ctrl.signal });
        if (!res.ok) throw new Error(`Geocode failed (${res.status})`);
        const data = await res.json();
        const p = data?.[0];
        if (!p) throw new Error('No results for destination.');
        setDest({ lat: +p.lat, lng: +p.lon });
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setError(e.message || 'Failed to geocode destination.');
        setDest(null);
        setStatus('error');
      }
    }, 250);

    return () => {
      clearTimeout(geocodeTimer.current);
      ctrl.abort();
    };
  }, [destinationName]);

  // ---- 3) Compute distance when both points are ready
  useEffect(() => {
    if (!me || !dest) return;
    const R = 6371;
    const dLat = toRad(dest.lat - me.lat);
    const dLon = toRad(dest.lng - me.lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(me.lat)) * Math.cos(toRad(dest.lat)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setKm(R * c);
    setStatus('ready');
  }, [me, dest]);

  const distanceText = km
    ? unit === 'km'
      ? `${km.toFixed(1)} km`
      : `${kmToMiles(km).toFixed(1)} mi`
    : '--';

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>How far is {titleCase(destinationName)} from me?</h1>

      <section style={styles.card}>
        <div style={styles.row}><strong>Status:</strong>&nbsp;<span>{status}</span></div>
        {error ? <div style={{ ...styles.row, color: 'crimson' }}>{error}</div> : null}
        <div style={styles.row}>
          <strong>Your coords:</strong>&nbsp;
          <span>{me ? `${me.lat.toFixed(5)}, ${me.lng.toFixed(5)}` : 'locating…'}</span>
        </div>
        <div style={styles.row}>
          <strong>Destination:</strong>&nbsp;
          <span>{dest ? `${dest.lat.toFixed(5)}, ${dest.lng.toFixed(5)}` : 'geocoding…'}</span>
        </div>
        <div style={{ ...styles.row, fontSize: 22, marginTop: 8 }}>
          <strong>Distance:</strong>&nbsp;<span>{distanceText}</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setUnit('km')}
            style={{ ...styles.btn, ...(unit === 'km' ? styles.btnActive : {}) }}
          >Kilometers</button>
          <button
            onClick={() => setUnit('mi')}
            style={{ ...styles.btn, ...(unit === 'mi' ? styles.btnActive : {}) }}
          >Miles</button>
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.h3}>Map</h3>
        <div style={{ height: 420 }}>
          {me && dest ? (
            <SmartMap sourceCoords={me} destinationCoords={dest} distance={km} />
          ) : (
            <div>Loading map…</div>
          )}
        </div>
      </section>
    </main>
  );
}

function titleCase(s) {
  if (!s) return '';
  return s.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
}

const styles = {
  main: { maxWidth: 900, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' },
  h1: { fontSize: 28, marginBottom: 16 },
  h3: { marginTop: 0 },
  card: { background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.04)' },
  row: { display: 'flex', alignItems: 'center', margin: '4px 0' },
  btn: { padding: '6px 10px', marginRight: 8, borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', background: '#f7f7f7' },
  btnActive: { borderColor: '#111', background: '#e9e9e9' },
};
