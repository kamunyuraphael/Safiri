import { Mail, MapPin } from "lucide-react";

export function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-28 pb-20 bg-earth-50 min-h-screen">
      <p className="text-terra-400 text-sm font-medium tracking-widest uppercase mb-3">Contact</p>
      <h1 className="font-display text-4xl mb-6 text-forest-800">Get in touch.</h1>
      <p className="text-forest-700/70 mb-10 max-w-lg">
        Questions, feedback, or a destination we should add? Reach out.
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-forest-700">
          <Mail className="h-5 w-5 text-terra-400" />
          <span>hello@safiri.travel</span>
        </div>
        <div className="flex items-center gap-3 text-forest-700">
          <MapPin className="h-5 w-5 text-terra-400" />
          <span>Thika, Kenya</span>
        </div>
      </div>
    </div>
  );
}
