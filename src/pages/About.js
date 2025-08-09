import React, { useEffect } from "react";
import "./About.css";
import aboutImage from "../image/pexels-andreas-gusicov-785963761-30959064.jpg";

const About = () => {
  useEffect(() => {
    document.body.classList.add("about-page");
    return () => {
      document.body.classList.remove("about-page");
    };
  }, []);

  return (
    <div className="about-container">
      <div className="about-hero">
        <div
          className="about-background"
          style={{ backgroundImage: `url(${aboutImage})` }}
        ></div>
        <div className="about-overlay">
          <div className="about-content">
            <h1 className="about-title">About Our Blog</h1>
            <p className="about-subtitle">
              Sharing stories, experiences, and insights from around the world
            </p>
          </div>
        </div>
      </div>

      <div className="about-sections">
        <div className="about-section">
          <div className="section-content">
            <h2>Our Mission</h2>
            <p>
              We believe in the power of storytelling to connect people across
              cultures, continents, and experiences. Our platform serves as a
              bridge between writers and readers, creating a global community
              where every voice matters.
            </p>
            <p>
              From personal journeys to professional insights, from creative
              fiction to thought-provoking analysis, we curate and share content
              that inspires, educates, and entertains our diverse audience.
            </p>
          </div>
        </div>

        <div className="about-section">
          <div className="section-content">
            <h2>What We Do</h2>
            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">✍️</div>
                <h3>Content Creation</h3>
                <p>
                  Empowering writers to share their unique perspectives and
                  stories with the world.
                </p>
              </div>
              <div className="feature">
                <div className="feature-icon">🌍</div>
                <h3>Global Community</h3>
                <p>
                  Connecting readers and writers from every corner of the globe.
                </p>
              </div>
              <div className="feature">
                <div className="feature-icon">💡</div>
                <h3>Knowledge Sharing</h3>
                <p>
                  Facilitating the exchange of ideas, experiences, and insights.
                </p>
              </div>
              <div className="feature">
                <div className="feature-icon">🎯</div>
                <h3>Quality Content</h3>
                <p>
                  Curating and promoting high-quality, engaging content for our
                  readers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="section-content">
            <h2>Our Values</h2>
            <div className="values-list">
              <div className="value-item">
                <h3>Authenticity</h3>
                <p>
                  We value genuine, honest storytelling that reflects real
                  experiences and perspectives.
                </p>
              </div>
              <div className="value-item">
                <h3>Diversity</h3>
                <p>
                  Celebrating voices from all backgrounds, cultures, and walks
                  of life.
                </p>
              </div>
              <div className="value-item">
                <h3>Innovation</h3>
                <p>
                  Embracing new ideas and creative approaches to content
                  creation and sharing.
                </p>
              </div>
              <div className="value-item">
                <h3>Community</h3>
                <p>
                  Building meaningful connections between writers and readers
                  worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="section-content">
            <h2>Contact Information</h2>
            <div className="contact-info">
              <div className="contact-item">
                <h3>Developer</h3>
                <p>
                  <strong>Ravi Shankar Kumar</strong>
                </p>
                <p>📧 Email: ravicse19.23@gmail.com</p>
                <p>📱 Phone: 8709931070</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="section-content">
            <h2>Join Our Community</h2>
            <p>
              Whether you're a seasoned writer or just starting your journey,
              whether you're looking to share your story or discover new
              perspectives, we welcome you to our growing community.
            </p>
            <div className="cta-buttons">
              <button className="cta-btn primary">Start Writing</button>
              <button className="cta-btn secondary">Explore Posts</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
