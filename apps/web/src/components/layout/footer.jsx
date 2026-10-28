import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Civic Connect Logo"
              className="h-10 w-10 rounded-xl object-contain bg-white p-0.5"
            />

            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Civic Connect
              </h2>
              <p className="text-xs text-slate-400">
                Citizen-first civic complaint platform.
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
            A modern civic-technology platform empowering residents to report municipal
            issues with PRAGATI AI assistance, track milestone resolutions transparently,
            and build cleaner, safer cities together.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Platform
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <a
              href="#pragati-ai"
              className="flex items-center gap-1.5 transition hover:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>PRAGATI AI</span>
            </a>

            <a
              href="#how-it-works"
              className="block transition hover:text-white"
            >
              How It Works
            </a>

            <a
              href="#features"
              className="block transition hover:text-white"
            >
              Capabilities
            </a>

            <a
              href="#tracking-preview"
              className="block transition hover:text-white"
            >
              Tracking Milestone
            </a>

            <a
              href="#faq"
              className="block transition hover:text-white"
            >
              FAQ
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Portal Access
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <Link
              to="/login"
              className="block transition hover:text-white"
            >
              Citizen Login
            </Link>

            <Link
              to="/signup"
              className="block transition hover:text-white"
            >
              Register Account
            </Link>

            <Link
              to="/login"
              className="block transition hover:text-white"
            >
              Authority Portal
            </Link>

            <Link
              to="/citizen/track"
              className="block transition hover:text-white"
            >
              Track by Complaint ID
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Civic Connect. All rights reserved.</p>

          <p className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-brand font-bold text-slate-400">PRAGATI AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
