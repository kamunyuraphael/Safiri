import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Waves, Mountain, Landmark, Leaf, Sunrise, Sparkles } from "lucide-react";
import { DestinationCard, CATEGORY_TO_BADGE } from "@/components/destinations/DestinationCard";
import { ChatPlanner } from "@/components/common/ChatPlanner";
import { getDestinations } from "@/services/destinationService";
import type { Destination, BudgetTier } from "@/types/destination";

const EXPERIENCES = [
  { icon: PawPrint, label: "Game Drives", desc: "Dawn and dusk drives with expert local rangers across Kenya's premier reserves." },
  { icon: Waves, label: "Coastal Escapes", desc: "Sun-drenched dhow trips, snorkelling reefs, and fresh-catch seafood on the coast." },
  { icon: Mountain, label: "Highland Treks", desc: "Guided ascents of Mount Kenya, Aberdares, and highland waterfalls." },
  { icon: Landmark, label: "Cultural Immersion", desc: "Swahili old towns, village stays, and heritage architecture along the coast." },
];

const TESTIMONIALS = [
  {
    name: "Amina Wanjiru",
    location: "Nairobi",
    text: "Safiri planned my Masai Mara trip down to the last shilling. I stayed within budget and still had the most magical experience of my life.",
    avatar: "AW",
  },
  {
    name: "Brian Omondi",
    location: "Kisumu",
    text: "I never thought I could afford Lamu. Safiri showed me a realistic budget breakdown that covered everything. The old town at sunset was unreal.",
    avatar: "BO",
  },
  {
    name: "Celestine Muthoni",
    location: "Mombasa",
    text: "As someone who travels solo, Safiri's data on seasons and costs made me feel confident booking on my own. Amboseli was breathtaking.",
    avatar: "CM",
  },
];

const FILTERS = ["All", "Wildlife", "Coastal", "City", "Nature", "Cultural"];

export function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const [budgetAdults, setBudgetAdults] = useState(2);
  const [budgetDays, setBudgetDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("midRange");

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeFilter === "All"
      ? destinations
      : destinations.filter((d) => CATEGORY_TO_BADGE[d.category] === activeFilter);

  // Real per-tier daily average, computed from the actual seeded dataset
  // rather than a hardcoded number — grounds the estimator in real data.
  const avgDailyCostByTier = useMemo(() => {
    const tiers: BudgetTier[] = ["budget", "midRange", "luxury"];
    const result: Record<BudgetTier, number> = { budget: 0, midRange: 0, luxury: 0 };
    if (destinations.length === 0) return result;

    for (const tier of tiers) {
      const total = destinations.reduce((sum, d) => {
        const c = d.estimatedCosts[tier];
        return sum + c.accommodation + c.food + c.transport + c.activities;
      }, 0);
      result[tier] = Math.round(total / destinations.length);
    }
    return result;
  }, [destinations]);

  const estimatedTotal = avgDailyCostByTier[budgetTier] * budgetAdults * budgetDays;

  const tierCards: { tier: BudgetTier; label: string; icon: typeof Leaf; perks: string[]; color: string; btnColor: string; featured?: boolean }[] = [
    {
      tier: "budget",
      label: "Budget",
      icon: Leaf,
      perks: ["Public transport", "Guesthouses & bandas", "Self-catered meals", "Community-led tours"],
      color: "bg-forest-700 text-earth-100",
      btnColor: "bg-savanna-400 text-forest-800 hover:bg-savanna-500 hover:text-white",
    },
    {
      tier: "midRange",
      label: "Mid-Range",
      icon: Sunrise,
      featured: true,
      perks: ["Shared safari vehicle", "3-star lodges & tented camps", "Half-board meals", "Park fees included"],
      color: "bg-terra-400 text-earth-50",
      btnColor: "bg-earth-50 text-terra-400 hover:bg-earth-100",
    },
    {
      tier: "luxury",
      label: "Luxury",
      icon: Sparkles,
      perks: ["Private vehicle & guide", "Luxury lodges & conservancies", "Full-board + drinks", "Bush dinners & balloon rides"],
      color: "bg-forest-800 text-earth-200",
      btnColor: "bg-terra-400 text-white hover:bg-terra-600",
    },
  ];

  return (
    <div className="bg-earth-50 text-forest-800">
      {/* HERO */}
      <section className="relative min-h-screen flex items-end pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1728042107033-76b13feac547?w=1600&h=1200&fit=crop&auto=format"
            alt="Giraffes silhouetted against a Kenyan sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/40 to-transparent" />
        </div>
        <div className="relative z-10 px-6 md:px-16 lg:px-24 w-full max-w-6xl">
          <p className="text-savanna-400 text-sm font-medium tracking-widest uppercase mb-4">
            Your local Kenyan travel guide
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-earth-50 leading-[0.95] mb-6 max-w-3xl">
            Kenya is <em className="text-savanna-400 not-italic">calling.</em>
            <br />
            Answer it.
          </h1>
          <p className="text-earth-300 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
            Safiri finds the perfect Kenyan destination for your budget — from the
            savanna grasslands of Masai Mara to the coral-fringed shores of Diani.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/destinations"
              className="px-8 py-4 bg-terra-400 text-white font-medium text-base rounded-full hover:bg-terra-600 transition-all duration-200 hover:scale-[1.02] text-center"
            >
              Discover destinations
            </Link>
            <a
              href="#budget-planner"
              className="px-8 py-4 border border-earth-300/60 text-earth-200 font-medium text-base rounded-full hover:border-savanna-400 hover:text-savanna-400 transition-all duration-200 text-center"
            >
              Plan my budget
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 md:right-16 text-earth-300/60 text-xs font-medium tracking-widest uppercase rotate-90 origin-right hidden sm:block">
          Scroll to explore
        </div>
      </section>

      {/* EXPERIENCES */}
      <section id="experiences" className="py-24 px-6 md:px-16 lg:px-24 bg-forest-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-16 items-end">
            <div>
              <p className="text-savanna-400 text-sm font-medium tracking-widest uppercase mb-3">What we do</p>
              <h2 className="font-display text-4xl md:text-5xl text-earth-100 leading-tight">
                Every kind of<br />
                <em className="text-terra-400 not-italic">Kenyan adventure</em>
              </h2>
            </div>
            <p className="text-earth-300/80 text-lg leading-relaxed">
              Whether you crave the raw silence of a game drive at dawn or the salt
              wind of the Indian Ocean, Safiri connects you to the experience — and
              tells you exactly what it costs.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXPERIENCES.map((exp) => (
              <div
                key={exp.label}
                className="p-7 bg-forest-700/50 border border-forest-700 rounded-2xl hover:bg-forest-700 hover:border-savanna-400/40 transition-all duration-300 group"
              >
                <exp.icon className="h-8 w-8 text-savanna-400 mb-5" strokeWidth={1.75} />
                <h3 className="font-display text-xl text-earth-100 mb-2 group-hover:text-savanna-400 transition-colors">
                  {exp.label}
                </h3>
                <p className="text-sm text-earth-300/70 leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="py-24 px-6 md:px-16 lg:px-24 bg-earth-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-terra-400 text-sm font-medium tracking-widest uppercase mb-3">Explore Kenya</p>
              <h2 className="font-display text-4xl md:text-5xl text-forest-800 leading-tight">
                Where will<br />you go?
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === f
                      ? "bg-terra-400 text-white"
                      : "bg-earth-200/60 text-forest-700 hover:bg-earth-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-forest-700/50">Loading destinations…</p>
          ) : filtered.length === 0 ? (
            <p className="text-forest-700/50">
              No destinations found — run the seed script on the server to populate this.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, 6).map((destination) => (
                <DestinationCard key={destination._id} destination={destination} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/destinations" className="text-sm font-medium text-terra-400 hover:underline">
              View all destinations →
            </Link>
          </div>
        </div>
      </section>

      {/* BUDGET PLANNER */}
      <section id="budget-planner" className="py-24 px-6 md:px-16 lg:px-24 bg-earth-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-terra-400 text-sm font-medium tracking-widest uppercase mb-3">Plan smarter</p>
            <h2 className="font-display text-4xl md:text-5xl text-forest-800 leading-tight mb-4">
              Budget your perfect trip
            </h2>
            <p className="text-forest-700/70 text-lg max-w-xl mx-auto">
              No surprises. Estimates below are averaged from real seeded destination
              data — not guesses.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 border border-earth-200 mb-12 shadow-sm">
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              <div>
                <label className="block text-xs font-medium text-earth-500 uppercase tracking-wider mb-3">
                  Number of adults
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setBudgetAdults(Math.max(1, budgetAdults - 1))}
                    className="w-10 h-10 rounded-full border border-earth-200 text-forest-700 font-medium hover:border-terra-400 hover:text-terra-400 transition-colors flex items-center justify-center text-lg"
                  >
                    −
                  </button>
                  <span className="font-display text-3xl text-forest-800 w-8 text-center">{budgetAdults}</span>
                  <button
                    onClick={() => setBudgetAdults(Math.min(10, budgetAdults + 1))}
                    className="w-10 h-10 rounded-full border border-earth-200 text-forest-700 font-medium hover:border-terra-400 hover:text-terra-400 transition-colors flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-earth-500 uppercase tracking-wider mb-3">
                  Number of days
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setBudgetDays(Math.max(1, budgetDays - 1))}
                    className="w-10 h-10 rounded-full border border-earth-200 text-forest-700 font-medium hover:border-terra-400 hover:text-terra-400 transition-colors flex items-center justify-center text-lg"
                  >
                    −
                  </button>
                  <span className="font-display text-3xl text-forest-800 w-8 text-center">{budgetDays}</span>
                  <button
                    onClick={() => setBudgetDays(Math.min(14, budgetDays + 1))}
                    className="w-10 h-10 rounded-full border border-earth-200 text-forest-700 font-medium hover:border-terra-400 hover:text-terra-400 transition-colors flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-earth-500 uppercase tracking-wider mb-3">
                  Travel style
                </label>
                <div className="flex flex-col gap-2">
                  {(["budget", "midRange", "luxury"] as BudgetTier[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setBudgetTier(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-all duration-200 ${
                        budgetTier === t ? "bg-terra-400 text-white" : "bg-earth-100 text-forest-700 hover:bg-earth-200"
                      }`}
                    >
                      {t === "midRange" ? "Mid-Range" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-8 border-t border-earth-200 gap-4">
              <div>
                <p className="text-sm text-forest-700/60 mb-1">
                  Estimated total for {budgetAdults} {budgetAdults === 1 ? "person" : "people"}, {budgetDays}{" "}
                  {budgetDays === 1 ? "day" : "days"} — {budgetTier === "midRange" ? "Mid-Range" : budgetTier}
                </p>
                <p className="font-display text-5xl text-forest-800">
                  {destinations.length > 0 ? `KES ${estimatedTotal.toLocaleString()}` : "—"}
                </p>
                <p className="text-xs text-earth-400 mt-1">
                  Averaged across {destinations.length} seeded destinations. Excludes flights.
                </p>
              </div>
              <Link
                to="/#plan"
                className="px-8 py-4 bg-terra-400 text-white font-medium rounded-full hover:bg-terra-600 transition-colors whitespace-nowrap"
              >
                Ask Safiri to plan it →
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tierCards.map((tc) => (
              <div
                key={tc.tier}
                className={`rounded-2xl p-8 ${tc.color} ${tc.featured ? "ring-2 ring-savanna-400 scale-[1.02]" : ""} transition-transform`}
              >
                <tc.icon className="h-8 w-8 mb-4" strokeWidth={1.75} />
                <h3 className="font-display text-2xl mb-1">{tc.label}</h3>
                <p className="text-lg font-semibold opacity-80 mb-6">
                  {destinations.length > 0 ? `~KES ${avgDailyCostByTier[tc.tier].toLocaleString()}/day` : "—"}
                </p>
                <ul className="space-y-2 mb-8">
                  {tc.perks.map((p) => (
                    <li key={p} className="text-sm flex items-start gap-2 opacity-90">
                      <span className="mt-0.5 shrink-0">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setBudgetTier(tc.tier)}
                  className={`w-full py-3 rounded-full text-sm font-medium transition-all duration-200 ${tc.btnColor}`}
                >
                  Explore {tc.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN WITH SAFIRI — chatbot, added alongside the static planner above */}
      <section id="plan" className="bg-forest-800">
        <div className="mx-auto max-w-6xl px-6 md:px-16 lg:px-24 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-savanna-400 text-sm font-medium tracking-widest uppercase mb-3">
              Or just ask
            </p>
            <h2 className="font-display text-4xl leading-tight mb-5 text-earth-100">
              Talk it through with Safiri.
            </h2>
            <p className="text-earth-300/80 max-w-md leading-relaxed">
              Prefer to just describe your trip? Tell Safiri where in Kenya you're
              thinking, your budget, or who's coming along, and it'll suggest real
              seeded destinations that fit.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-earth-300/70">
              <li>— "A quiet beach for a honeymoon, mid-range budget"</li>
              <li>— "Family safari under 15,000 KES a day"</li>
              <li>— "Best lake to visit in July"</li>
            </ul>
          </div>

          <div className="bg-earth-50 text-forest-800 rounded-2xl shadow-2xl overflow-hidden h-[560px]">
            <ChatPlanner />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-forest-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-savanna-400 text-sm font-medium tracking-widest uppercase mb-3">
              Traveller stories
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-earth-100 leading-tight">
              Watu wetu wa safari
            </h2>
            <p className="text-earth-300/60 text-sm mt-2 italic">Our travelling people</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-8 bg-forest-700/50 border border-forest-700 rounded-2xl hover:border-savanna-400/40 transition-colors"
              >
                <p className="text-savanna-400 text-3xl font-display italic mb-4">"</p>
                <p className="text-earth-200 leading-relaxed mb-6 text-sm">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-terra-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-earth-100 font-medium text-sm">{t.name}</p>
                    <p className="text-earth-300/60 text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6 md:px-16 lg:px-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/iprdnhzp/image/upload/v1789214488/safiri/destinations/mskk0ptg84zoinocgloj.jpg"
            alt="Lions in the savanna at golden hour"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forest-900/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-savanna-400 text-sm font-medium tracking-widest uppercase mb-4">Ready to go?</p>
          <h2 className="font-display text-5xl md:text-6xl text-earth-50 leading-tight mb-6">
            Your next chapter<br />
            <em className="text-terra-400 not-italic">starts in Kenya.</em>
          </h2>
          <p className="text-earth-300 text-lg mb-10">
            Tell Safiri your budget and interests. It'll help you build a complete
            itinerary from real, curated destination data.
          </p>
          <a
            href="#plan"
            className="inline-block px-10 py-5 bg-terra-400 text-white font-medium text-lg rounded-full hover:bg-terra-600 hover:scale-[1.02] transition-all duration-200 shadow-xl shadow-terra-400/30"
          >
            Start planning for free
          </a>
        </div>
      </section>
    </div>
  );
}
