export default function Page({ params }) {
  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Dynamic Route Test ✅</h1>
      <p>
        Destination parameter: <strong>{params.destination}</strong>
      </p>
      <p>
        If you can see this page, your `/how-far-is-[destination]-from-me` route is working on Vercel.
      </p>
    </main>
  );
}
