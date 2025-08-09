export default function Page({ params }) {
  return (
    <div style={{ padding: 40 }}>
      <h1>Test route works</h1>
      <p>Destination: {params.destination}</p>
    </div>
  );
}
