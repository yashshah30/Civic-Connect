import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/footer";

export default function Landing() {
  return (
    <>
      <Navbar />

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Connect with Your Community</h1>

          <p className="hero-text">
            Civic Connect makes it easier for citizens to stay informed,
            raise concerns, and connect with their local authorities.
          </p>

          <div className="hero-buttons">
            <a href="/signup" className="primary-button">
              Get Started
            </a>

            <a href="#features" className="secondary-button">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="section section-white">
        <div className="section-container">
          <h2 className="section-title">Why Civic Connect?</h2>

          <p className="section-description">
            Civic Connect helps bridge the gap between citizens and local
            authorities through simple and accessible digital communication.
          </p>
        </div>
      </section>

      <section id="features" className="section section-light">
        <div className="section-container">
          <h2 className="section-title">Key Features</h2>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Report Issues</h3>
              <p>
                Easily report civic issues and concerns in your community.
              </p>
            </div>

            <div className="feature-card">
              <h3>Stay Informed</h3>
              <p>
                Stay updated about important community announcements and
                activities.
              </p>
            </div>

            <div className="feature-card">
              <h3>Track Progress</h3>
              <p>
                Follow the progress of reported civic issues and requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-white">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>

          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your Civic Connect account.</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Raise a Concern</h3>
              <p>Submit an issue or request from your community.</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Track Updates</h3>
              <p>Follow updates as your concern is addressed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">
            Ready to Connect with Your Community?
          </h2>

          <p className="cta-text">
            Join Civic Connect and help make your community better.
          </p>

          <a href="/signup" className="cta-button">
            Join Civic Connect
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}