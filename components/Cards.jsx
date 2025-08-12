"use client";

import Head from "next/head";
import Link from "next/link";

export default function Features() {
  return (
    <>
      <Head>
        <title>How Far From Me – Features</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Shell */}
      <section className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Title */}
        <header className="mb-8 text-center sm:mb-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Explore Location Features</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Clean shortcuts to our most‑used distance lookups. No clutter, just go.
          </p>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            emoji="⭐"
            label="popular"
            title="Popular Locations"
            blurb="Fast links people use daily."
            links={[
              { href: "/how-far-is-nassau-from-me", text: "How far is Nassau from me?" },
              { href: "/how-far-is-nassau-from-miami", text: "How far is Nassau from Miami?" },
              { href: "/how-far-is-halifax-from-boston", text: "How far is Halifax from Boston?" },
              { href: "/how-far-is-toronto-from-new-york", text: "How far is Toronto from New York?" },
              { href: "/how-far-is-prince-edward-island-from-me", text: "How far is PEI from me?" },
            ]}
            cta={{ href: "/popular", text: "Browse all popular" }}
          />

          <FeatureCard
            emoji="🏝️"
            label="islands"
            title="Top Island Searches"
            blurb="Hot island lookups right now."
            links={[
              { href: "/how-far-is-nassau-from-me", text: "Nassau from me" },
              { href: "/how-far-is-nassau-from-miami", text: "Nassau from Miami" },
              { href: "/how-far-is-grand-bahama-from-miami", text: "Grand Bahama from Miami" },
              { href: "/how-far-is-turks-and-caicos-from-miami", text: "Turks & Caicos from Miami" },
              { href: "/how-far-is-jamaica-from-miami", text: "Jamaica from Miami" },
            ]}
            cta={{ href: "/islands", text: "See island distances" }}
          />

          <FeatureCard
            emoji="🗺️"
            label="routes"
            title="Most Searched Routes"
            blurb="Popular city‑to‑city checks."
            links={[
              { href: "/how-far-is-miami-from-nassau", text: "Miami ⇄ Nassau" },
              { href: "/how-far-is-halifax-from-boston", text: "Halifax ⇄ Boston" },
              { href: "/how-far-is-toronto-from-new-york", text: "Toronto ⇄ New York" },
              { href: "/how-far-is-london-from-new-york", text: "New York ⇄ London" },
              { href: "/how-far-is-montreal-from-toronto", text: "Toronto ⇄ Montréal" },
            ]}
            cta={{ href: "/routes", text: "Explore routes" }}
          />
        </div>
      </section>
    </>
  );
}

function FeatureCard({ emoji, label, title, blurb, links, cta }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 p-6 shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:shadow-lg dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
      {/* Icon badge */}
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-xl dark:bg-neutral-800">
        <span role="img" aria-label={label} className="select-none">
          {emoji}
        </span>
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{blurb}</p>

      {/* Links */}
      <ul className="mt-4 divide-y divide-neutral-200/70 rounded-xl border border-neutral-200/70 bg-white/60 text-sm backdrop-blur dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/50">
        {links.map((l) => (
          <li key={l.href} className="flex items-center justify-between p-3">
            <Link
              href={l.href}
              className="inline-flex max-w-[85%] items-center underline-offset-4 hover:underline"
            >
              {l.text}
            </Link>
            <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-5">
        <Link
          href={cta.href}
          className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow dark:border-neutral-700"
          aria-label={cta.text}
        >
          {cta.text}
        </Link>
      </div>

      {/* Focus ring for keyboard users */}
      <span className="pointer-events-none absolute inset-0 rounded-3xl ring-0 ring-indigo-400/40 focus-within:ring-4" />
    </div>
  );
}
