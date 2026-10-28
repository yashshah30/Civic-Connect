import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        
        {/* Logo */}
        <Link to="/landing" className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Civic Connect Logo"
            className="h-10 w-10 rounded-xl object-contain shadow-sm"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold tracking-tight text-blue-950">
                Civic Connect
              </h1>
            </div>
            <p className="hidden text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:block">
              Better communities together
            </p>
          </div>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#pragati-ai"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-900 transition hover:text-blue-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>PRAGATI AI</span>
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-900"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-900"
          >
            Capabilities
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-900"
          >
            FAQ
          </a>
        </div>

        {/* Auth Buttons & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
          >
            Sign In
          </Link>

          <Link
            to="/signup"
            className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Get Started
          </Link>

          {/* Hamburger Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none md:hidden"
            aria-label="Toggle Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col space-y-3">
            <a
              href="#pragati-ai"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-900"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>PRAGATI AI</span>
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-blue-900"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-blue-900"
            >
              Capabilities
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-blue-900"
            >
              FAQ
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
