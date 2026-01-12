import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page-root">
            <div className="bg"></div>

            {/* ===== NAVBAR ===== */}
            <nav>
                <div className="brand">
                    <img src="/images/logo.png" alt="ChatShield Logo" />
                    <span className="chat">CHAT</span><span className="shield">SHIELD</span>
                </div>
                <ul className="nav-links">
                    <li><a href="#hero">Home</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#docs">Docs</a></li>
                    <li><a href="#about">About</a></li>
                    <li><Link to="/register">Sign Up</Link></li>
                </ul>
            </nav>

            {/* HERO SECTION */}
            <section className="hero" id="hero">
                <h1>
                    Real-Time AI Moderation <br />
                    <span className="highlight-text">for Safer Digital Spaces</span>
                </h1>
                <p>Smarter moderation. Faster decisions. Safer conversations.</p>
                <img src="/images/logo.png" className="hero-logo" alt="ChatShield Logo" />
                <div className="logo-text">
                    <span className="chat">CHAT</span><span className="shield">SHIELD</span>
                </div>
                <div className="actions">
                    <a href="#features" className="btn-primary">View Demo</a>
                    <Link to="/register" className="btn-secondary">Sign Up</Link>
                </div>
            </section>

            {/* HERO VISUAL BAND */}
            <div className="hero-visual-band">
                <img src="/images/background.png" alt="AI network visualization" />
            </div>

            {/* FEATURES SECTION */}
            <section className="section" id="features">
                <h2>Everything you Need to <span className="highlight-text">Moderate Safely</span></h2>
                <div className="grid">
                    <div className="card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Admin Dashboard</h3>
                        <p>Full control with logs, overrides and analytics.</p>
                    </div>
                    <div className="card">
                        <div className="feature-icon">⚡</div>
                        <h3>Severity-Based Decisions</h3>
                        <p>Context-aware actions beyond keywords.</p>
                    </div>
                    <div className="card">
                        <div className="feature-icon">🔒</div>
                        <h3>Privacy & Security</h3>
                        <p>Secure AI workflows with minimal data retention.</p>
                    </div>
                    <div className="card">
                        <div className="feature-icon">🌐</div>
                        <h3>Multi-Language</h3>
                        <p>Seamless moderation across languages.</p>
                    </div>
                    <div className="card">
                        <div className="feature-icon">🎤</div>
                        <h3>Voice & Image</h3>
                        <p>Real-time audio & image moderation.</p>
                    </div>
                    <div className="card">
                        <div className="feature-icon">⚙️</div>
                        <h3>Behavior Analysis</h3>
                        <p>Detect patterns, not just words.</p>
                    </div>
                </div>
            </section>

            {/* USE CASES SECTION */}
            <section className="section" id="use-cases">
                <h2>Where ChatShield <span className="highlight-text">Fits</span></h2>
                <div className="usecase-grid">
                    <div className="usecase-card">
                        <div className="usecase-icon">🎓</div>
                        <h3>EdTech</h3>
                        <p>Safe classrooms and discussions.</p>
                    </div>
                    <div className="usecase-card">
                        <div className="usecase-icon">🎮</div>
                        <h3>Gaming</h3>
                        <p>Toxic-free multiplayer spaces.</p>
                    </div>
                    <div className="usecase-card">
                        <div className="usecase-icon">📱</div>
                        <h3>Social Media</h3>
                        <p>Healthy online communities.</p>
                    </div>
                    <div className="usecase-card">
                        <div className="usecase-icon">💼</div>
                        <h3>Corporate</h3>
                        <p>Professional internal communication.</p>
                    </div>
                </div>
            </section>

            <div className="section-divider"></div>

            {/* ABOUT SECTION */}
            <section id="about">
                <h3>About <span className="highlight-text">ChatShield</span></h3>
                <center>
                    <p className="about-short">
                        <strong>ChatShield</strong> is a real-time AI moderation prototype focused on safer and more responsible digital interactions.
                        It uses behavior-based analysis to enable proportional, severity-aware actions while supporting administrator review for critical decisions.
                    </p>
                </center>
            </section>

            {/* CONTACT */}
            <section className="prefooter-contact" id="contact">
                <h3>Contact & <span className="highlight-text">Collaboration</span></h3>
                <center>
                    <p>
                        ChatShield is an evolving prototype focused on responsible AI moderation.
                        For feedback, collaboration, or academic discussion, feel free to reach out.
                    </p>
                </center>

                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=chatshield.contactus@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="prefooter-email">
                    chatshield.contactus@gmail.com
                </a>
            </section>
        </div>
    );
};

export default LandingPage;
