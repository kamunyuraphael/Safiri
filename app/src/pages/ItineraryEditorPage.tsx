import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDestinations } from "@/services/destinationService";
import { createItinerary, getItinerary, updateItinerary } from "@/services/itineraryService";
import { calculateBudget, formatMoney, TIER_LABELS } from "@/lib/budget";
import { getErrorMessage } from "@/lib/errors";
import type { BudgetTier, Destination, TravelerType } from "@/types/destination";
import type { Itinerary } from "@/types/itinerary";

interface DraftStop {
  key: string;
  destinationId: string;
  notes: string;
}
interface DraftDay {
  key: string;
  stops: DraftStop[];
}

let keyCounter = 0;
const uid = () => `k${++keyCounter}`;

const TRAVELER_TYPES: { value: TravelerType; label: string }[] = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
  { value: "honeymoon", label: "Honeymoon" },
];
const TIERS: BudgetTier[] = ["budget", "midRange", "luxury"];

const inputClass =
  "w-full px-4 py-2.5 border border-earth-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terra-400/40 focus:border-terra-400";
const labelClass = "block text-xs font-medium text-earth-500 uppercase tracking-wider mb-2";

function toDraftDays(trip: Itinerary): DraftDay[] {
  const stops = trip.stops.filter((s) => s.destination);
  const lastDay = Math.max(1, ...stops.map((s) => s.day));
  return Array.from({ length: lastDay }, (_, i) => ({
    key: uid(),
    stops: stops
      .filter((s) => s.day === i + 1)
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        key: uid(),
        destinationId: typeof s.destination === "string" ? s.destination : s.destination._id,
        notes: s.notes ?? "",
      })),
  }));
}

export function ItineraryEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // /itineraries/new?add=<destinationId> starts a trip with that destination on day 1.
  const preselectId = isEdit ? null : searchParams.get("add");

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [travelerType, setTravelerType] = useState<TravelerType>("couple");
  const [travelersText, setTravelersText] = useState("2");
  const [tier, setTier] = useState<BudgetTier>("midRange");
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState<DraftDay[]>([{ key: uid(), stops: [] }]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const numTravelers = Math.min(50, Math.max(1, parseInt(travelersText, 10) || 1));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([getDestinations(), id ? getItinerary(id) : Promise.resolve(null)])
      .then(([allDestinations, trip]) => {
        if (cancelled) return;
        setDestinations(allDestinations);
        if (!trip && preselectId && allDestinations.some((d) => d._id === preselectId)) {
          setDays([{ key: uid(), stops: [{ key: uid(), destinationId: preselectId, notes: "" }] }]);
        }
        if (trip) {
          setTitle(trip.title);
          setTravelerType(trip.travelerType);
          setTravelersText(String(trip.numTravelers));
          setTier(trip.budgetTier);
          setStartDate(trip.startDate ? trip.startDate.slice(0, 10) : "");
          setDays(toDraftDays(trip));
        }
      })
      .catch((err) => !cancelled && setLoadError(getErrorMessage(err, "We couldn't load this trip.")))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id, preselectId]);

  const destinationsById = useMemo(() => new Map(destinations.map((d) => [d._id, d])), [destinations]);

  const destinationsByRegion = useMemo(() => {
    const groups = new Map<string, Destination[]>();
    for (const d of destinations) {
      groups.set(d.region, [...(groups.get(d.region) ?? []), d]);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [destinations]);

  const summary = useMemo(
    () =>
      calculateBudget(
        days.flatMap((day, i) => day.stops.map((s) => ({ destinationId: s.destinationId, day: i + 1 }))),
        destinationsById,
        tier,
        numTravelers
      ),
    [days, destinationsById, tier, numTravelers]
  );

  const totalStops = days.reduce((n, d) => n + d.stops.length, 0);
  const hasCosts = summary.grandTotal > 0;

  // ---- day / stop editing ----
  const updateDay = (dayKey: string, fn: (stops: DraftStop[]) => DraftStop[]) =>
    setDays((current) => current.map((d) => (d.key === dayKey ? { ...d, stops: fn(d.stops) } : d)));

  const addStop = (dayKey: string, destinationId: string) =>
    updateDay(dayKey, (stops) => [...stops, { key: uid(), destinationId, notes: "" }]);

  const moveStop = (dayKey: string, index: number, direction: -1 | 1) =>
    updateDay(dayKey, (stops) => {
      const target = index + direction;
      if (target < 0 || target >= stops.length) return stops;
      const copy = [...stops];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  const removeDay = (dayKey: string) =>
    setDays((current) => (current.length === 1 ? current : current.filter((d) => d.key !== dayKey)));

  async function handleSave() {
    setSaveError(null);
    if (!title.trim()) {
      setSaveError("Give your trip a title first.");
      return;
    }

    const input = {
      title: title.trim(),
      travelerType,
      numTravelers,
      budgetTier: tier,
      startDate: startDate || null,
      stops: days.flatMap((day, dayIndex) =>
        day.stops.map((s, order) => ({
          destination: s.destinationId,
          day: dayIndex + 1,
          order,
          ...(s.notes.trim() && { notes: s.notes.trim() }),
        }))
      ),
    };

    setSaving(true);
    try {
      if (id) await updateItinerary(id, input);
      else await createItinerary(input);
      navigate("/itineraries");
    } catch (err) {
      setSaveError(getErrorMessage(err, "We couldn't save your trip."));
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="mx-auto max-w-6xl px-6 pt-32 text-foreground/50">Loading…</p>;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl px-6 pt-32 text-center">
        <p className="text-foreground/70 mb-4">{loadError}</p>
        <Button asChild variant="outline">
          <Link to="/itineraries">Back to your trips</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
      <Link to="/itineraries" className="inline-flex items-center gap-1.5 text-sm text-forest-700/70 hover:text-terra-400">
        <ArrowLeft className="h-4 w-4" /> Your trips
      </Link>
      <h1 className="font-display text-4xl mt-3 mb-8">{isEdit ? "Edit trip" : "Plan a trip"}</h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Trip details */}
          <section className="rounded-2xl border border-earth-200 bg-white p-6 space-y-5">
            <div>
              <label htmlFor="trip-title" className={labelClass}>Trip title</label>
              <input
                id="trip-title"
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g. Coast getaway with the family"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="trip-type" className={labelClass}>Traveling as</label>
                <select
                  id="trip-type"
                  value={travelerType}
                  onChange={(e) => setTravelerType(e.target.value as TravelerType)}
                  className={inputClass}
                >
                  {TRAVELER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="trip-travelers" className={labelClass}>Travelers</label>
                <input
                  id="trip-travelers"
                  inputMode="numeric"
                  value={travelersText}
                  onChange={(e) => setTravelersText(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  onBlur={() => setTravelersText(String(numTravelers))}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="trip-start" className={labelClass}>Start date (optional)</label>
                <input
                  id="trip-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <span className={labelClass}>Budget level</span>
              <div className="inline-flex rounded-full border border-earth-200 p-1 bg-earth-50" role="group" aria-label="Budget level">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    aria-pressed={tier === t}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      tier === t ? "bg-terra-400 text-white" : "text-forest-700 hover:bg-earth-100"
                    }`}
                  >
                    {TIER_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Days */}
          {days.map((day, dayIndex) => (
            <section key={day.key} className="rounded-2xl border border-earth-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl">Day {dayIndex + 1}</h2>
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(day.key)}
                    className="text-xs text-forest-700/60 hover:text-terra-500 transition-colors"
                  >
                    Remove day
                  </button>
                )}
              </div>

              <ul className="space-y-3">
                {day.stops.map((stop, index) => {
                  const dest = destinationsById.get(stop.destinationId);
                  return (
                    <li key={stop.key} className="rounded-lg border border-earth-200 p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{dest?.name ?? "Unknown destination"}</p>
                          {dest && <p className="text-xs text-foreground/50">{dest.region}, {dest.county}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => moveStop(day.key, index, -1)}
                          disabled={index === 0}
                          aria-label="Move up"
                          className="p-1.5 rounded hover:bg-muted disabled:opacity-30"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStop(day.key, index, 1)}
                          disabled={index === day.stops.length - 1}
                          aria-label="Move down"
                          className="p-1.5 rounded hover:bg-muted disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDay(day.key, (stops) => stops.filter((s) => s.key !== stop.key))}
                          aria-label={`Remove ${dest?.name ?? "stop"}`}
                          className="p-1.5 rounded hover:bg-muted text-terra-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <input
                        value={stop.notes}
                        maxLength={500}
                        onChange={(e) =>
                          updateDay(day.key, (stops) =>
                            stops.map((s) => (s.key === stop.key ? { ...s, notes: e.target.value } : s))
                          )
                        }
                        placeholder="Notes (optional)"
                        aria-label="Stop notes"
                        className={`${inputClass} mt-2 py-2`}
                      />
                    </li>
                  );
                })}
              </ul>

              <div className={day.stops.length ? "mt-4" : ""}>
                <label htmlFor={`add-${day.key}`} className="sr-only">Add a destination to day {dayIndex + 1}</label>
                <select
                  id={`add-${day.key}`}
                  value=""
                  onChange={(e) => e.target.value && addStop(day.key, e.target.value)}
                  className={inputClass}
                >
                  <option value="">+ Add a destination</option>
                  {destinationsByRegion.map(([region, list]) => (
                    <optgroup key={region} label={region}>
                      {list.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </section>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => setDays((current) => [...current, { key: uid(), stops: [] }])}
            disabled={days.length >= 30}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add day
          </Button>
        </div>

        {/* Budget + save */}
        <aside className="lg:sticky lg:top-28 space-y-4">
          <section className="rounded-2xl border border-earth-200 bg-white p-6">
            <h2 className="font-display text-xl mb-1">Estimated budget</h2>
            <p className="text-xs text-foreground/50 mb-4">
              {TIER_LABELS[tier]} level, {numTravelers} {numTravelers === 1 ? "traveler" : "travelers"}, {summary.numDays}{" "}
              {summary.numDays === 1 ? "day" : "days"}
            </p>

            {hasCosts ? (
              <>
                <dl className="space-y-2 text-sm">
                  {[
                    ["Accommodation", summary.totalAccommodation],
                    ["Food", summary.totalFood],
                    ["Transport", summary.totalTransport],
                    ["Activities", summary.totalActivities],
                  ].map(([label, amount]) => (
                    <div key={label as string} className="flex justify-between">
                      <dt className="text-foreground/60">{label}</dt>
                      <dd>{formatMoney(summary.currency, amount as number)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 pt-4 border-t border-earth-200">
                  <p className="text-xs uppercase tracking-wider text-earth-500">Total</p>
                  <p className="font-display text-3xl">{formatMoney(summary.currency, summary.grandTotal)}</p>
                  <p className="text-xs text-foreground/50 mt-1">
                    About {formatMoney(summary.currency, summary.grandTotal / numTravelers)} per person
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground/60">Add a destination to see what this trip could cost.</p>
            )}
            <p className="text-xs text-foreground/40 mt-4">Based on average costs per destination. Real prices vary.</p>
          </section>

          {saveError && (
            <p role="alert" className="rounded-lg bg-terra-400/10 text-terra-600 text-sm px-4 py-3">{saveError}</p>
          )}

          <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : `Save trip${totalStops ? "" : " (no stops yet)"}`}
          </Button>
        </aside>
      </div>
    </div>
  );
}
