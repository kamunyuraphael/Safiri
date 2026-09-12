export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-28 pb-20 bg-earth-50 min-h-screen">
      <p className="text-terra-400 text-sm font-medium tracking-widest uppercase mb-3">About</p>
      <h1 className="font-display text-4xl mb-6 text-forest-800">
        Built to make Kenya easier to plan.
      </h1>
      <div className="space-y-4 text-forest-700/80 leading-relaxed">
        <p>
          Safiri exists because planning a trip inside Kenya usually means piecing
          together scattered blog posts, outdated price estimates, and guesswork about
          when to actually go. We wanted one place that's honest about real costs,
          real seasons, and what actually fits your kind of trip.
        </p>
        <p>
          Every destination here is curated with a real budget breakdown across three
          tiers, seasonal weather guidance, and traveler-type fit — whether you're
          going solo, as a couple, or with the whole family.
        </p>
        <p className="italic font-display text-terra-400">Safari nzuri — have a good journey.</p>
      </div>
    </div>
  );
}
