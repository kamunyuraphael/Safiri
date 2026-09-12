import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl mb-3">Off the map</h1>
      <p className="text-foreground/60 mb-6">This page doesn't exist.</p>
      <Button asChild>
        <Link to="/">Back home</Link>
      </Button>
    </div>
  );
}
