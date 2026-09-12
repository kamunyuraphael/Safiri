import { Link } from "react-router-dom";
import type { Destination, DestinationCategory } from "@/types/destination";

// Maps our real category taxonomy onto the design's 5-badge system.
export const CATEGORY_TO_BADGE: Record<DestinationCategory, string> = {
  "national-park": "Wildlife",
  conservancy: "Wildlife",
  beach: "Coastal",
  town: "City",
  urban: "City",
  lake: "Nature",
  mountain: "Nature",
  waterfall: "Nature",
  "cultural-site": "Cultural",
};

const BADGE_COLORS: Record<string, string> = {
  Wildlife: "bg-forest-700/90 text-savanna-400",
  Coastal: "bg-[#1a3a4a]/90 text-[#7eccd4]",
  City: "bg-[#3a2a1a]/90 text-earth-200",
  Nature: "bg-forest-700/90 text-[#a8d98a]",
  Cultural: "bg-[#4a2a1a]/90 text-[#e8c28a]",
};

export function DestinationCard({ destination }: { destination: Destination }) {
  const image = destination.images[0]?.url;
  const badge = CATEGORY_TO_BADGE[destination.category] ?? "Nature";
  const mid = destination.estimatedCosts.midRange;
  const dailyTotal = mid.accommodation + mid.food + mid.transport + mid.activities;
  const bestSeason = destination.bestSeasons.find((s) => s.isRecommended) ?? destination.bestSeasons[0];

  return (
    <Link
      to={`/destinations/${destination.slug}`}
      className="group rounded-2xl overflow-hidden bg-white border border-earth-200/60 hover:border-terra-400/30 hover:shadow-xl hover:shadow-terra-400/10 transition-all duration-300 block"
    >
      <div className="relative h-52 bg-earth-200 overflow-hidden">
        {image && (
          <img
            src={image}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <span className={`absolute top-3 left-3 text-xs font-medium px-3 py-1 rounded-full ${BADGE_COLORS[badge]}`}>
          {badge}
        </span>
      </div>

      <div className="p-6">
        <p className="text-xs text-earth-500 font-medium tracking-wider uppercase mb-1">
          {destination.region}
        </p>
        <h3 className="font-display text-2xl text-forest-800 mb-1">{destination.name}</h3>
        <p className="text-sm text-forest-700/70 mb-4 leading-relaxed line-clamp-2">
          {destination.shortDescription}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-earth-200">
          <div>
            <p className="text-xs text-earth-400 uppercase tracking-wide">from</p>
            <p className="font-semibold text-forest-800">
              {mid.currency} {dailyTotal.toLocaleString()}/day
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-earth-400 uppercase tracking-wide">best time</p>
            <p className="text-sm font-medium text-forest-700">
              {bestSeason ? bestSeason.months[0] : "Year-round"}
            </p>
          </div>
          <span className="px-4 py-2 bg-muted text-terra-400 text-sm font-medium rounded-full group-hover:bg-terra-400 group-hover:text-white transition-all duration-200">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
