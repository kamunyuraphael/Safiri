import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { to: "/destinations", label: "Destinations" },
  { to: "/#experiences", label: "Experiences" },
  { to: "/#budget-planner", label: "Budget Planner" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate("/");
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-earth-50/90 backdrop-blur-md border-b border-earth-200/60">
        <Link to="/" className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-terra-400" strokeWidth={2.2} />
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
          {isAuthenticated ? (
            <>
              <span className="text-sm text-forest-700/70">Hi, {user?.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:text-terra-400 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-forest-700 hover:text-terra-400 transition-colors"
            >
              Sign in
            </Link>
          )}
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
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 text-earth-100 font-display text-2xl italic hover:text-savanna-400 transition-colors self-start"
            >
              <LogOut className="h-5 w-5" /> Log out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-4 font-display text-2xl text-earth-100 italic hover:text-savanna-400 transition-colors"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/#plan"
            onClick={() => setMobileOpen(false)}
            className="px-6 py-3 bg-terra-400 text-white font-medium rounded-full self-start hover:bg-terra-600 transition-colors"
          >
            Plan a trip
          </Link>
        </div>
      )}
    </>
  );
}
