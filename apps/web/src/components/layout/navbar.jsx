import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">
          Civic Connect
        </a>

        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="/login">Login</a>
          <a href="/signup" className="signup-button">
            Sign Up
          </a>
        </div>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <a href="/" onClick={() => setMenuOpen(false)}>
            Home
          </a>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>

          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>

          <a href="/login" onClick={() => setMenuOpen(false)}>
            Login
          </a>

          <a href="/signup" onClick={() => setMenuOpen(false)}>
            Sign Up
          </a>
        </div>
      )}
    </nav>
  );
}

