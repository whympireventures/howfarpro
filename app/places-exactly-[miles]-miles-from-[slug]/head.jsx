// app/places-exactly-[miles]-miles-from-[slug]/head.jsx
export default function Head({ params = {}, searchParams = {} }) {
  // ---------- helpers ----------
  const titleCase = (s = '') =>
    s
      .trim()
      .split(/\s+/)
      .map(w => (/^[A-Z]{2,}$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
      .join(' ');

  const safeNumber = (v, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  // ---------- inputs ----------
  const milesRaw = safeNumber(params?.miles, 0);
  const miles = Math.max(0, Math.round(milesRaw)); // keep it clean for titles
  const originRaw = decodeURIComponent(params?.slug || '').replace(/-/g, ' ').trim();
  const origin = titleCase(originRaw || 'Your Location');

  // tolerance: default 5, clamp [0, 50] to avoid weird values
  const tol = Math.min(50, Math.max(0, safeNumber(searchParams?.tolerance, 5)));

  // ---------- URLs ----------
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://locatemycity.com';
  const prettySlug = (originRaw || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pathname = `/places-exactly-${miles}-miles-from-${prettySlug}/`;
  const canonical = `${site}${pathname}${tol !== 5 ? `?tolerance=${tol}` : ''}`;

  // ---------- SEO text ----------
  const title = `Places exactly ${miles} miles from ${origin} (±${tol}) | LocateMyCity`;
  const desc = `Explore cities around ${origin} that are approximately ${miles} miles away (±${tol}), computed with the Haversine formula using the GeoNames cities15000 dataset.`;

  // ---------- Schema.org ----------
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What does “exactly X miles” mean?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `We use a narrow band ±${tol} miles around ${miles} to account for rounding and geodesic distance on a sphere.`,
        },
      },
      {
        '@type': 'Question',
        'name': 'Where does the city data come from?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'From the GeoNames cities15000 dataset (population ≥ 15,000, WGS-84 coordinates).',
        },
      },
      {
        '@type': 'Question',
        'name': 'How is distance calculated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Using the Haversine formula (great-circle distance), then converting kilometers to miles.',
        },
      },
      {
        '@type': 'Question',
        'name': 'Can I change the origin or distance?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes—edit the URL (e.g., /places-exactly-50-miles-from-anaheim-ca/) and optionally add ?tolerance= to widen the band.',
        },
      },
    ],
  };

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': title,
    'url': canonical,
    'description': desc,
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'LocateMyCity',
      'url': site,
    },
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content="index, follow, max-image-preview:large" />

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="LocateMyCity" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
