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

      {/* Hero / Section shell */}
      <section className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
        {/* floating accents */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[5%] top-[10%] h-10 w-10 rounded-full bg-indigo-200/50 blur-2xl animate-pulse" />
          <div className="absolute left-[85%] top-[70%] h-16 w-16 rounded-full bg-teal-200/50 blur-2xl animate-pulse [animation-delay:2000ms]" />
          <div className="absolute left-[90%] top-[30%] h-8 w-8 rounded-full bg-amber-200/50 blur-2xl animate-pulse [animation-delay:4000ms]" />
          <div className="absolute left-[10%] top-[80%] h-12 w-12 rounded-full bg-pink-200/50 blur-2xl animate-pulse [animation-delay:6000ms]" />
        </div>

        <header className="mb-8 text-center sm:mb-12">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Explore Location Features</h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            Quick shortcuts to our most‑used distance lookups and regions.
          </p>
        </header>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {/* Popular Locations */}
          <FeatureCard
            emoji="⭐"
            label="popular"
            title="Popular Locations"
            blurb="Fast links to the most‑checked places."
            links=[
              { href: "/how-far-is-nassau-from-me", text: "How far is Nassau from me?" },
              { href: "/how-far-is-nassau-from-miami", text: "How far is Nassau from Miami?" },
              { href: "/how-far-is-halifax-from-boston", text: "How far is Halifax from Boston?" },
              { href: "/how-far-is-toronto-from-new-york", text: "How far is Toronto from New York?" },
              { href: "/how-far-is-prince-edward-island-from-me", text: "How far is PEI from me?" },
            ]
            cta={{ href: "/popular", text: "Browse all popular" }}
          />

          {/* Top 5 Island Searches */}
          <FeatureCard
            emoji="🏝️"
            label="islands"
            title="Top Island Searches"
            blurb="Most‑requested island lookups right now."
            links=[
              { href: "/how-far-is-nassau-from-me", text: "Nassau from me" },
              { href: "/how-far-is-nassau-from-miami", text: "Nassau from Miami" },
              { href: "/how-far-is-grand-bahama-from-miami", text: "Grand Bahama from Miami" },
              { href: "/how-far-is-turks-and-caicos-from-miami", text: "Turks & Caicos from Miami" },
              { href: "/how-far-is-jamaica-from-miami", text: "Jamaica from Miami" },
            ]
            cta={{ href: "/islands", text: "See island distances" }}
          />

          {/* Most Searched Routes */}
          <FeatureCard
            emoji="🗺️"
            label="routes"
            title="Most Searched Routes"
            blurb="Popular city‑to‑city checks for planning."
            links=[
              { href: "/how-far-is-miami-from-nassau", text: "Miami ⇄ Nassau" },
              { href: "/how-far-is-halifax-from-boston", text: "Halifax ⇄ Boston" },
              { href: "/how-far-is-toronto-from-new-york", text: "Toronto ⇄ New York" },
              { href: "/how-far-is-london-from-new-york", text: "New York ⇄ London" },
              { href: "/how-far-is-montreal-from-toronto", text: "Toronto ⇄ Montréal" },
            ]
            cta={{ href: "/routes", text: "Explore routes" }}
          />
        </div>
      </section>
    </>
  );
}

function FeatureCard({ emoji, label, title, blurb, links, cta }: {
  emoji: string;
  label: string;
  title: string;
  blurb: string;
  links: { href: string; text: string }[];
  cta: { href: string; text: string };
}) {
  return (
    <div className="group flex flex-col rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="mb-3 flex items-center gap-2 text-xl">
        <span role="img" aria-label={label} className="select-none">
          {emoji}
        </span>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>

      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">{blurb}</p>

      <ul className="mb-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex items-center underline-offset-4 hover:underline"
            >
              {l.text}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2">
        <Link
          href={cta.href}
          className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow dark:border-neutral-700"
          aria-label={cta.text}
        >
          {cta.text}
        </Link>
      </div>
    </div>
  );
}

}
