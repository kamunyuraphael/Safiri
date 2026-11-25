import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteItinerary, getMyItineraries } from "@/services/itineraryService";
import { formatMoney, TIER_LABELS } from "@/lib/budget";
import { getErrorMessage } from "@/lib/errors";
import type { Itinerary } from "@/types/itinerary";

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function destinationNames(trip: Itinerary): string[] {
  const ordered = [...trip.stops].sort((a, b) => a.day - b.day || a.order - b.order);
  const names: string[] = [];
  for (const stop of ordered) {
    if (typeof stop.destination === "object" && stop.destination && !names.includes(stop.destination.name)) {
      names.push(stop.destination.name);
    }
  }
  return names;
}

export function ItinerariesPage() {
  const [trips, setTrips] = useState<Itinerary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setTrips(null);
    getMyItineraries()
      .then(setTrips)
      .catch((err) => setError(getErrorMessage(err, "We couldn't load your trips.")));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(trip: Itinerary) {
    if (!window.confirm(`Delete "${trip.title}"? This can't be undone.`)) return;
    setActionError(null);
    setDeletingId(trip._id);
    try {
      await deleteItinerary(trip._id);
      setTrips((current) => current?.filter((t) => t._id !== trip._id) ?? null);
    } catch (err) {
      setActionError(getErrorMessage(err, "We couldn't delete that trip."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl mb-2">Your trips</h1>
          <p className="text-foreground/60">Build a day-by-day plan and see what it will cost.</p>
        </div>
        <Button asChild>
          <Link to="/itineraries/new">
            <Plus className="h-4 w-4 mr-1.5" /> New trip
          </Link>
        </Button>
      </div>

      {actionError && (
        <p className="mb-4 rounded-lg bg-terra-400/10 text-terra-600 text-sm px-4 py-3">{actionError}</p>
      )}

      {error && (
        <div className="rounded-2xl border border-earth-200 bg-white p-8 text-center">
          <p className="text-foreground/70 mb-4">{error}</p>
          <Button variant="outline" onClick={load}>
            Try again
          </Button>
        </div>
      )}

      {!error && trips === null && (
        <div className="grid md:grid-cols-2 gap-5" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {trips && trips.length === 0 && (
        <div className="rounded-2xl border border-dashed border-earth-300 bg-white p-12 text-center">
          <h2 className="font-display text-2xl mb-2">No trips yet</h2>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">
            Pick destinations, arrange them by day, and get a budget estimate before you book anything.
          </p>
          <Button asChild>
            <Link to="/itineraries/new">Plan your first trip</Link>
          </Button>
        </div>
      )}

      {trips && trips.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          {trips.map((trip) => {
            const names = destinationNames(trip);
            const start = formatDate(trip.startDate);
            const end = formatDate(trip.endDate);
            const summary = trip.budgetSummary;

            return (
              <article key={trip._id} className="rounded-2xl border border-earth-200 bg-white p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-2xl leading-tight">{trip.title}</h2>
                  <span className="shrink-0 text-xs rounded-full bg-muted text-earth-500 px-3 py-1">
                    {TIER_LABELS[trip.budgetTier]}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-foreground/60">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {trip.numTravelers} {trip.numTravelers === 1 ? "traveler" : "travelers"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {names.length} {names.length === 1 ? "destination" : "destinations"}
                  </span>
                  {start && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {start}
                      {end && end !== start ? ` to ${end}` : ""}
                    </span>
                  )}
                </div>

                {names.length > 0 && (
                  <p className="mt-3 text-sm text-foreground/80">
                    {names.slice(0, 4).join(", ")}
                    {names.length > 4 ? ` and ${names.length - 4} more` : ""}
                  </p>
                )}

                <div className="mt-auto pt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-earth-500">Estimated total</p>
                    <p className="font-display text-2xl">
                      {summary && summary.grandTotal > 0 ? formatMoney(summary.currency, summary.grandTotal) : "Add stops"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(trip)}
                      disabled={deletingId === trip._id}
                      aria-label={`Delete ${trip.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-terra-500" />
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/itineraries/${trip._id}`}>Open</Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
