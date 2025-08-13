"use client";

import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";

// Framer Motion variants (module scope so FeatureCard can use them)
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 md:px-6">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 opacity-50 blur-3xl dark:from-blue-900/30 dark:to-purple-900/30" />
        </div>

        {/* Title */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            Explore our tools
          </span>
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-purple-400 sm:text-5xl">
            Distance Calculation Features
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
            Quick access to our most-used distance lookups. Clean, fast, and accurate.
          </p>
        </motion.header>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
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
            color="blue"
          />

          <FeatureCard
            emoji="🏝️"
            label="islands"
            title="Island Destinations"
            blurb="Hot island lookups right now."
            links={[
              { href: "/how-far-is-nassau-from-me", text: "Nassau from me" },
              { href: "/how-far-is-nassau-from-miami", text: "Nassau from Miami" },
              { href: "/how-far-is-grand-bahama-from-miami", text: "Grand Bahama from Miami" },
              { href: "/how-far-is-turks-and-caicos-from-miami", text: "Turks & Caicos from Miami" },
              { href: "/how-far-is-jamaica-from-miami", text: "Jamaica from Miami" },
            ]}
            cta={{ href: "/islands", text: "See island distances" }}
            color="purple"
          />

          <FeatureCard
            emoji="🗺️"
            label="routes"
            title="Travel Routes"
            blurb="Popular city-to-city checks."
            links={[
              { href: "/how-far-is-miami-from-nassau", text: "Miami ⇄ Nassau" },
              { href: "/how-far-is-halifax-from-boston", text: "Halifax ⇄ Boston" },
              { href: "/how-far-is-toronto-from-new-york", text: "Toronto ⇄ New York" },
              { href: "/how-far-is-london-from-new-york", text: "New York ⇄ London" },
              { href: "/how-far-is-montreal-from-toronto", text: "Toronto ⇄ Montréal" },
            ]}
            cta={{ href: "/routes", text: "Explore routes" }}
            color="teal"
          />
        </motion.div>
      </section>
    </>
  );
}

function FeatureCard({ emoji, label, title, blurb, links, cta, color = "blue" }) {
  const colorClasses = {
    blue: {
      bg: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20",
      border: "border-blue-200 dark:border-blue-800/50",
      text: "text-blue-600 dark:text-blue-400",
      cta: "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600",
      icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    },
    purple: {
      bg: "from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20",
      border: "border-purple-200 dark:border-purple-800/50",
      text: "text-purple-600 dark:text-purple-400",
      cta: "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-600",
      icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    },
    teal: {
      bg: "from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20",
      border: "border-teal-200 dark:border-teal-800/50",
      text: "text-teal-600 dark:text-teal-400",
      cta: "bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-600",
      icon: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
    },
  } as const;

  return (
    <motion.div
      variants={item}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border ${colorClasses[color].border} bg-gradient-to-br ${colorClasses[color].bg} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:shadow-none`}
    >
      {/* Icon badge */}
      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color].icon} text-2xl shadow-inner`}>
        <span role="img" aria-label={label} className="select-none">
          {emoji}
        </span>
      </div>

      {/* Heading */}
      <h3 className={`text-xl font-bold tracking-tight ${colorClasses[color].text}`}>{title}</h3>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">{blurb}</p>

      {/* Links */}
      <ul className="mt-6 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-center justify-between rounded-lg p-3 transition hover:bg-white/50 hover:shadow dark:hover:bg-neutral-800/50"
            >
              <span className="text-neutral-700 dark:text-neutral-200">{l.text}</span>
              <span className="text-neutral-400 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-6 border-t border-neutral-200/50 pt-4 dark:border-neutral-800/50">
        <Link
          href={cta.href}
          className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition hover:shadow-md ${colorClasses[color].cta}`}
          aria-label={cta.text}
        >
          {cta.text}
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}
