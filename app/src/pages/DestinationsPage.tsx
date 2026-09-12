import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { getDestinations } from "@/services/destinationService";
import type { Destination } from "@/types/destination";

export function DestinationsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDestinations(category ? { category: category as Destination["category"] } : undefined)
      .then(setDestinations)
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
      <h1 className="font-display text-4xl mb-2">Discover destinations</h1>
      <p className="text-foreground/60 mb-10">
        {category ? `Showing: ${category.replace("-", " ")}` : "All destinations across Kenya"}
      </p>

      {loading ? (
        <p className="text-foreground/50">Loading…</p>
      ) : destinations.length === 0 ? (
        <p className="text-foreground/50">No destinations found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((destination) => (
            <DestinationCard key={destination._id} destination={destination} />
          ))}
        </div>
      )}
    </div>
  );
}
