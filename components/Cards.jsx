"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * card.jsx
 * A composable, mobile‑first features deck with:
 * - Feature cards grid
 * - Popular Searches (includes target URLs)
 * - Explore by Region tiles
 * - Optional FAQ accordion (SEO copy can live here; schema belongs in the page)
 *
 * Drop into any page: <FeaturesDeck />
 * If you already have a page wrapper, you can render just <FeatureCards />.
 */

// ---- Data (edit/extend safely) -------------------------------------------
const FEATURE_CARDS = [
  {
    icon: "📍",
    title: "Distance From Me",
    text:
      "Get exact straight‑line distances from your current location in miles, kilometers, and nautical miles.",
    href: "/location-from-me/locationfromme",
    cta: "Calculate Distance",
  },
  {
    icon: "🗺️",
    title: "Location to Location",
    text:
      "Compare the distance between any two places worldwide—perfect for trip planning and quick what‑ifs.",
    href: "/location-from-location/locationtolocation",
    cta: "Compare Locations",
  },
  {
    icon: "🪨",
    title: "Rock Cities",
    text:
      "Find places with ‘Rock’ in the name and explore notable geological spots.",
    href: "/rock",
    cta: "Explore Rocks",
  },
  {
    icon: "💧",
    title: "Spring Cities",
    text:
      "Browse destinations known for springs and water features for refreshing getaways.",
    href: "/spring",
    cta: "Discover Springs",
  },
];

const POPULAR_SEARCHES = [
  { href: "/how-far-is-nassau-from-me", label: "How far is Nassau from me?" },
  { href: "/how-far-is-nassau-from-miami", label: "How far is Nassau from Miami?" },
  { href: "/how-far-is-prince-edward-island-from-me", label: "How far is PEI from me?" },
  { href: "/how-far-is-halifax-from-boston", label: "How far is Halifax from Boston?" },
  { href: "/how-far-is-toronto-from-new-york", label: "How far is Toronto from New York?" },
  { href: "/how-far-is-nassau-from-toronto", label: "How far is Nassau from Toronto?" },
];

const REGIONS = [
  {
    name: "Atlantic Canada",
    href: "/region/atlantic-canada",
    blurb: "PEI, Nova Scotia, New Brunswick, Newfoundland & Labrador",
  },
  { name: "Caribbean", href: "/region/caribbean", blurb: "Bahamas, Jamaica, TCI, Barbados" },
  { name: "USA – Southeast", href: "/region/usa-southeast", blurb: "Miami, Orlando, Atlanta" },
  { name: "Europe", href: "/region/europe", blurb: "London, Paris, Lisbon, Madrid" },
];

const FAQS = [
  {
    q: "How does the calculator work?",
    a: "We use great‑circle (Haversine) math on coordinates for precise point‑to‑point distance. Driving or transit times may vary with live conditions.",
  },
  {
    q: "Can I type my location instead of using GPS?",
    a: "Yes. In ‘Distance From Me’, switch to manual entry to type a city, state/province, or country.",
  },
  {
    q: "Do you support location‑to‑location?",
    a: "Absolutely—compare any two places globally with the ‘Location to Location’ tool.",
  },
  {
    q: "Is it free?",
    a: "Yes, core tools are free. We may add optional pro features later.",
  },
];

// ---- Building blocks ------------------------------------------------------
export function FeatureCard({ icon, title, text, href, cta }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="text-2xl" aria-hidden>{icon}</div>
      <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      >
        {cta}
      </Link>
    </div>
  );
}

export function FeatureCards({ items = FEATURE_CARDS, title = "Features" }) {
  return (
    <section aria-labelledby="features-title" className="mx-auto max-w-6xl px-4 py-10">
      <h2 id="features-title" className="sr-only">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}

export function PopularSearches({ items = POPULAR_SEARCHES }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-semibold">Popular searches</h2>
        <p className="mt-1 text-sm text-slate-600">Quick links to common from‑me and between‑city queries.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group block rounded-xl border border-slate-200 p-4 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <span className="text-sm font-medium group-hover:underline">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        {/* Explicit chips for target URLs */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/how-far-is-nassau-from-me"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Nassau from me
          </Link>
          <Link
            href="/how-far-is-nassau-from-miami"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Nassau from Miami
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ExploreByRegion({ items = REGIONS }) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-semibold">Explore by region</h2>
        <p className="mt-1 text-sm text-slate-600">Jump into curated sets of cities and islands.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <div className="text-base font-semibold text-slate-900 group-hover:underline">{r.name}</div>
              <div className="mt-1 text-xs text-slate-600">{r.blurb}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQAccordion({ items = FAQS, title = "FAQ: Distance, Accuracy, and Usage" }) {
  const [open, setOpen] = useState(null);
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
          {items.map((f, i) => (
            <div key={i}>
              <button
                className="flex w-full items-center justify-between px-4 py-4 text-left focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-medium">{f.q}</span>
                <span className="ml-4 text-slate-500">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="px-4 pb-4 text-sm text-slate-700">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Turn‑key deck for your page -----------------------------------------
export default function FeaturesDeck() {
  return (
    <div className="w-full">
      <FeatureCards />
      <PopularSearches />
      <ExploreByRegion />
      <FAQAccordion />
    </div>
  );
}
