import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800">
              🏙️
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Civic Connect
              </h2>
              <p className="text-xs text-slate-400">
                Better communities together.
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
            A digital platform designed to connect citizens and civic
            authorities, making local problem reporting and resolution
            simpler and more transparent.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Platform</h3>

          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <a
              href="#about"
              className="block transition hover:text-white"
            >
              About
            </a>

            <a
              href="#how-it-works"
              className="block transition hover:text-white"
            >
              How It Works
            </a>

            <a
              href="#impact"
              className="block transition hover:text-white"
            >
              Impact
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
          <h3 className="font-semibold">Account</h3>

          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <Link
              to="/login"
              className="block transition hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="block transition hover:text-white"
            >
              Create Account
            </Link>

            <a
              href="#contact"
              className="block transition hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Civic Connect. All rights reserved.</p>

          <p>Built for better communities.</p>
        </div>
      </div>
    </footer>
  );
}
