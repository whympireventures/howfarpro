export default function Head({ params, searchParams }) {
  const miles = Number(params?.miles) || 0;
  const origin = decodeURIComponent(params?.slug || '').replace(/-/g, ' ').trim();
  const tol = Number(searchParams?.tolerance || 5);
  const title = `Places exactly ${miles} miles from ${origin} (±${tol}) | LocateMyCity`;
  const desc = `See cities around ${origin} that are approximately ${miles} miles away (±${tol}), using the GeoNames cities15000 dataset.`;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What does “exactly X miles” mean?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `We use a small tolerance (±${tol} miles by default) to account for rounding and geodesic distance on a sphere.`,
        },
      },
      {
        '@type': 'Question',
        'name': 'Where does the city data come from?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'From the GeoNames cities15000 dataset (population >= 15,000). Coordinates are WGS-84.',
        },
      },
      {
        '@type': 'Question',
        'name': 'How is distance calculated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We use the Haversine formula to calculate great-circle distances, then convert kilometers to miles.',
        },
      },
      {
        '@type': 'Question',
        'name': 'Can I change the origin or distance?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes—modify the URL (e.g., /places-exactly-50-miles-from-anaheim-ca/) and add ?tolerance= to widen the band.',
        },
      },
    ],
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content="index, follow" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </>
  );
}
