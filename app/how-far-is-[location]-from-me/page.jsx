'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import SmartMap dynamically
const SmartMap = dynamic(() => import('@/components/SmartMap'), { ssr: false });

const UA = { 'User-Agent': 'howfarfromme.com (contact: dev@howfarfromme.com)' };
const toRad = (d) => d * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;

export default function Page({ params }) {
  const destinationName = decodeURIComponent(params.location).replace(/-/g, ' ');
  const [me, setMe] = useState(null);
  const [dest, setDest] = useState(null);
  const [km, setKm] = useState(0);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setMe({ lat: coords.latitude, lng: coords.longitude }),
      () => setMe({ lat: 40.7128, lng: -74.0060 }), // fallback to NYC
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!destinationName) return;
    (async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destinationName)}&format=json&limit=1`,
        { headers: UA }
      );
      const data = await res.json();
      const p = data?.[0];
      if (p) setDest({ lat: +p.lat, lng: +p.lon });
    })();
  }, [destinationName]);

  useEffect(() => {
    if (!me || !dest) return;
    const R = 6371;
    const dLat = toRad(dest.lat - me.lat);
    const dLon = toRad(dest.lng - me.lng);
    const a = Math.sin(dLat/2)**2 +
              Math.cos(toRad(me.lat)) * Math.cos(toRad(dest.lat)) *
              Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    setKm(R * c);
  }, [me, dest]);

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui' }}>
      <h1>How far is {destinationName} from me?</h1>
      <p><b>Distance:</b> {km ? `${km.toFixed(1)} km / ${kmToMiles(km).toFixed(1)} mi` : '--'}</p>
      <div style={{ height: 420 }}>
        {me && dest ? (
          <SmartMap sourceCoords={me} destinationCoords={dest} distance={km} />
        ) : 'Loading map...'}
      </div>
    </main>
  );
}
