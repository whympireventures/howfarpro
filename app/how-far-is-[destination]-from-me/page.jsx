'use client';

import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

// ---------- helpers
const toRad = (d) => d * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;
const formatTime = (unix, tzOffset) =>
  new Date((unix + tzOffset) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const cap = (s) => s ? s.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(' ') : s;

const UA_HEADERS = { 'User-Agent': 'howfarfromme.com (contact: dev@howfarfromme.com)' };

// ---------- page
export default function Page({ params }) {
  // /how-far-is-<location>-from-me  => params.location e.g. "new-york"
  const destinationSlug = params?.location || '';
  const destinationName = useMemo(
    () => decodeURIComponent(destinationSlug).replace(/-/g, ' ').trim(),
    [destinationSlug]
  );

  // state
  const [me, setMe] = useState(null);                    // { lat, lon }
  const [dest, setDest] = useState(null);                // { lat, lon, country, display }
  const [status, setStatus] = useState('init');          // init | locating | geocoding | ready | error
  const [distanceKm, setDistanceKm] = useState(0);
  const [unit, setUnit] = useState('km');                // 'km' | 'mi'
  const [weather, setWeather] = useState({ loading: true });

  // 1) geolocate user
  useEffect(() => {
    setStatus('locating');
    if (!navigator?.geolocation) {
      setMe({ lat: 40.7128, lon: -74.0060 }); // NYC fallback
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setMe({ lat: 40.7128, lon: -74.0060 }), // fallback
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // 2) geocode destination
  useEffect(() => {
    if (!destinationName) return;
    const run = async () => {
      try {
        setStatus('geocoding');
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destinationName)}&format=json&limit=1&addressdetails=1`;
        const res = await fetch(url, { headers: UA_HEADERS });
        const data = await res.json();
        const p = data?.[0];
        if (!p) throw new Error('No match from Nominatim');
        setDest({
          lat: +p.lat,
          lon: +p.lon,
          country: p.address?.country || '--',
          display: p.display_name || destinationName
        });
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };
    run();
  }, [destinationName]);

  // 3) compute distance + fetch weather
  useEffect(() => {
    if (!me || !dest) return;
    // distance
    const R = 6371;
    const dLat = toRad(dest.lat - me.lat);
    const dLon = toRad(dest.lon - me.lon);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(me.lat)) * Math.cos(toRad(dest.lat)) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    setDistanceKm(R * c);
    setStatus('ready');

    // weather (optional)
    const key = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
    if (!key) {
      setWeather({ loading: false, error: 'No OpenWeather key set' });
      return;
    }
    (async () => {
      try {
        setWeather((w) => ({ ...w, loading: true }));
        const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${dest.lat}&lon=${dest.lon}&appid=${key}&units=metric`);
        const d = await r.json();
        if (d.cod !== 200) throw new Error(d.message || 'weather fail');
        setWeather({
          loading: false,
          temp: Math.round(d.main.temp),
          feels: Math.round(d.main.feels_like),
          cond: d.weather?.[0]?.main?.toLowerCase() || '',
          desc: d.weather?.[0]?.description || '',
          windKmh: Math.round((d.wind?.speed || 0) * 3.6),
          humidity: d.main?.humidity ?? 0,
          sunrise: formatTime(d.sys.sunrise, d.timezone),
          sunset: formatTime(d.sys.sunset, d.timezone),
        });
      } catch (e) {
        setWeather({ loading: false, error: 'Failed to load weather' });
      }
    })();
  }, [me, dest]);

  const distanceText = useMemo(() => {
    if (!distanceKm) return '--';
    return unit === 'km' ? `${distanceKm.toFixed(1)} km` : `${kmToMiles(distanceKm).toFixed(1)} mi`;
  }, [distanceKm, unit]);

  return (
    <>
      <Head>
        <title>How far is {cap(destinationName)} from me? | Test Page</title>
        <meta name="robots" content="noindex,follow" />
      </Head>

      <main style={styles.main}>
        <h1 style={styles.h1}>How far is {cap(destinationName)} from me?</h1>

        <section style={styles.card}>
          <div style={styles.row}>
            <strong>Status:</strong>&nbsp;
            <span>{status}</span>
          </div>
          <div style={styles.row}>
            <strong>Your location:</strong>&nbsp;
            <span>{me ? `${me.lat.toFixed(5)}, ${me.lon.toFixed(5)}` : 'locating...'}</span>
          </div>
          <div style={styles.row}>
            <strong>Destination:</strong>&nbsp;
            <span>{dest ? `${cap(destinationName)} (${dest.country})` : 'geocoding...'}</span>
          </div>
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
          <h3 style={styles.h3}>Simple Travel Time Estimates</h3>
          <ul style={styles.list}>
            <li>Driving ~ {(distanceKm / 80).toFixed(1)} hours</li>
            <li>Flying ~ {(distanceKm / 800).toFixed(1)} hours</li>
            <li>Walking ~ {(distanceKm / 5).toFixed(1)} hours</li>
          </ul>
        </section>

        <section style={styles.card}>
          <h3 style={styles.h3}>Weather at destination</h3>
          {weather.loading ? <div>Loading...</div> :
            weather.error ? <div style={{ color: 'crimson' }}>{weather.error}</div> :
              <div>
                <div style={styles.row}><strong>{weather.desc}</strong></div>
                <div style={styles.row}>Temperature: {weather.temp}°C (feels {weather.feels}°C)</div>
                <div style={styles.row}>Wind: {weather.windKmh} km/h</div>
                <div style={styles.row}>Humidity: {weather.humidity}%</div>
                <div style={styles.row}>Sunrise: {weather.sunrise} | Sunset: {weather.sunset}</div>
              </div>}
          {!process.env.NEXT_PUBLIC_OPENWEATHER_KEY && (
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              Tip: set <code>NEXT_PUBLIC_OPENWEATHER_KEY</code> in <code>.env.local</code> to enable real weather.
            </div>
          )}
        </section>

        <section style={{ ...styles.card, fontSize: 12, opacity: 0.8 }}>
          <div>Debug</div>
          <pre style={styles.pre}>{JSON.stringify({ me, dest, distanceKm }, null, 2)}</pre>
        </section>
      </main>
    </>
  );
}

// ---------- inline styles for quick testing
const styles = {
  main: { maxWidth: 820, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' },
  h1: { fontSize: 28, marginBottom: 16 },
  h3: { marginTop: 0 },
  card: { background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.04)' },
  row: { display: 'flex', alignItems: 'center', margin: '4px 0' },
  btn: { padding: '6px 10px', marginRight: 8, borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', background: '#f7f7f7' },
  btnActive: { borderColor: '#111', background: '#e9e9e9' },
  list: { margin: 0, paddingLeft: 18 },
  pre: { overflow: 'auto', background: '#f5f5f5', padding: 10, borderRadius: 8 }
};
