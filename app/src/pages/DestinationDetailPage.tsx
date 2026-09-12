import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDestinationBySlug } from "@/services/destinationService";
import type { Destination } from "@/types/destination";

export function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getDestinationBySlug(slug)
      .then(setDestination)
      .catch(() => setDestination(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="mx-auto max-w-6xl px-6 py-16 text-foreground/50">Loading…</p>;
  if (!destination)
    return <p className="mx-auto max-w-6xl px-6 py-16 text-foreground/50">Destination not found.</p>;

  const image = destination.images[0]?.url;

  return (
    <div>
      <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden">
        {image && <img src={image} alt={destination.name} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative mx-auto max-w-6xl h-full px-6 flex flex-col justify-end pb-10 text-white">
          <span className="text-sm uppercase tracking-wide text-white/70">{destination.region}, {destination.county}</span>
          <h1 className="font-display text-5xl mt-1">{destination.name}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <p className="text-foreground/80 leading-relaxed">{destination.description}</p>

          <div>
            <h2 className="font-display text-2xl mb-3">Best time to visit</h2>
            <div className="space-y-2">
              {destination.bestSeasons.map((season) => (
                <div key={season.name} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      season.isRecommended ? "bg-accent" : "bg-muted"
                    }`}
                  />
                  <div>
                    <p className="font-medium">
                      {season.name} — {season.months.join(", ")}
                    </p>
                    <p className="text-foreground/60">{season.weatherSummary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-2xl">Estimated budget</h2>
          {(["budget", "midRange", "luxury"] as const).map((tier) => {
            const costs = destination.estimatedCosts[tier];
            const total = costs.accommodation + costs.food + costs.transport + costs.activities;
            return (
              <Card key={tier}>
                <CardHeader>
                  <CardTitle className="capitalize text-base">
                    {tier === "midRange" ? "Mid-range" : tier}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-display">
                    {costs.currency} {total.toLocaleString()}
                    <span className="text-sm text-foreground/50 font-sans"> /day</span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
