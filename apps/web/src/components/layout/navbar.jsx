import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

        {/* Logo */}
        <Link to="/landing" className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Civic Connect Logo"
            className="h-10 w-10 rounded-xl object-contain"
          />

          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-blue-950">
              Civic Connect
            </h1>
            <p className="hidden text-[10px] font-medium uppercase tracking-widest text-slate-400 sm:block">
              Better communities together
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-7 md:flex">
          <a
            href="#about"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-800"
          >
            About
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-800"
          >
            How It Works
          </a>

          <a
            href="#impact"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-800"
          >
            Impact
          </a>

          <a
            href="#faq"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-800"
          >
            FAQ
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
}

