import { Link } from "react-router-dom";
import { Compass, Globe } from "lucide-react";

const EXPLORE_LINKS = [
  { label: "Destinations", to: "/destinations" },
  { label: "Experiences", to: "/#experiences" },
  { label: "Budget Planner", to: "/#budget-planner" },
];

const COMPANY_LINKS = [
  { label: "About Safiri", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-forest-900 py-16 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-6 w-6 text-terra-400" strokeWidth={2.2} />
              <span className="font-display text-2xl font-semibold text-earth-100">Safiri</span>
            </div>
            <p className="text-forest-700/70 text-sm leading-relaxed max-w-xs text-[#6b8065]">
              Kenya's local travel assistant. We help you discover extraordinary
              places and plan every shilling with confidence.
            </p>
          </div>
          <div>
            <p className="text-savanna-400 text-xs font-medium tracking-widest uppercase mb-4">Explore</p>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[#6b8065] text-sm hover:text-[#d4a96a] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-savanna-400 text-xs font-medium tracking-widest uppercase mb-4">Company</p>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[#6b8065] text-sm hover:text-[#d4a96a] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-forest-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#4a6040] text-xs flex items-center gap-1.5">
            © 2026 Safiri. Proudly Kenyan. Made with <Globe className="h-3.5 w-3.5 inline" /> in Thika.
          </p>
          <p className="text-[#4a6040] text-xs italic font-display">
            Safari nzuri — Have a good journey.
          </p>
        </div>
      </div>
    </footer>
  );
}
