import { useState } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/destinations", label: "Destinations" },
  { to: "/#experiences", label: "Experiences" },
  { to: "/#budget-planner", label: "Budget Planner" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-earth-50/90 backdrop-blur-md border-b border-earth-200/60">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="font-display text-xl font-semibold tracking-tight text-forest-800">
            Safiri
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className="text-sm font-medium text-forest-700/80 hover:text-terra-400 transition-colors duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <button className="text-sm font-medium text-forest-700 hover:text-terra-400 transition-colors">
            Sign in
          </button>
          <Link
            to="/#plan"
            className="px-4 py-2 bg-terra-400 text-white text-sm font-medium rounded-full hover:bg-terra-600 transition-colors duration-200"
          >
            Plan a trip
          </Link>
        </div>

        <button
          className="md:hidden text-forest-800"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-forest-800 pt-24 px-8 flex flex-col gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="font-display text-2xl text-earth-100 italic hover:text-savanna-400 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/#plan"
            onClick={() => setMobileOpen(false)}
            className="mt-4 px-6 py-3 bg-terra-400 text-white font-medium rounded-full self-start hover:bg-terra-600 transition-colors"
          >
            Plan a trip
          </Link>
        </div>
      )}
    </>
  );
}
