import { useEffect, useState } from "react";
import { getDestinations } from "@/services/destinationService";
import type { Destination } from "@/types/destination";

const WELCOME_LINES = [
  "Discover Kenya, one trip at a time.",
  "Real places. Real costs. Real seasons.",
  "Plan smarter, travel further.",
];

export function AuthCarousel() {
  const [slides, setSlides] = useState<Destination[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    getDestinations()
      .then((data) => setSlides(data.filter((d) => d.images[0]?.url).slice(0, 5)))
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) {
    // Graceful fallback if the API isn't reachable yet — a plain brand panel
    // instead of a broken/empty image area.
    return (
      <div className="h-full w-full bg-forest-800 flex items-center justify-center p-12">
        <p className="font-display text-3xl text-earth-100 text-center leading-tight">
          {WELCOME_LINES[0]}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {slides.map((slide, i) => (
        <img
          key={slide._id}
          src={slide.images[0].url}
          alt={slide.name}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/20 to-forest-900/40" />

      <div className="relative h-full flex flex-col justify-end p-12">
        <p className="font-display text-3xl text-earth-50 leading-tight mb-3 max-w-sm">
          {WELCOME_LINES[active % WELCOME_LINES.length]}
        </p>
        <p className="text-earth-200/80 text-sm mb-6">
          {slides[active].name}, {slides[active].region}
        </p>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-savanna-400" : "w-1.5 bg-earth-50/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
