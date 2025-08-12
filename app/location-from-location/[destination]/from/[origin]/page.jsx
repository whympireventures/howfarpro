'use client';

export default function Page({ params }) {
  const destination = decodeURIComponent(params.destination).replace(/-/g, ' ');
  const origin = decodeURIComponent(params.origin).replace(/-/g, ' ');
  return <div style={{padding:24}}>Distance from {origin} to {destination}</div>;
}
