export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div>
          <h2>Civic Connect</h2>

          <p className="footer-text">
            Connecting citizens and communities with their local authorities.
          </p>
        </div>

        <div>
          <h3>Quick Links</h3>

          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Civic Connect
      </div>
    </footer>
  );
}