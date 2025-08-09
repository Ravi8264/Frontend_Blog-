import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-wrapper">
        {/* Header Section */}
        <div className="footer-header">
          <h1 className="footer-title">MyBlog</h1>
          <p className="footer-help">Visit Help Center</p>
        </div>

        {/* Links Grid */}
        <div className="footer-links">
          {/* Company */}
          <div className="footer-column">
            <h4 className="column-title">Company</h4>
            <ul className="column-links">
              <li>
                <a href="#" className="footer-link">
                  About us
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Our offerings
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Newsroom
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Investors
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div className="footer-column">
            <h4 className="column-title">Products</h4>
            <ul className="column-links">
              <li>
                <a href="#" className="footer-link">
                  Write
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Read
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Share
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Publish
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  MyBlog for Business
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Premium
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Gift subscriptions
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="footer-column">
            <h4 className="column-title">Community</h4>
            <ul className="column-links">
              <li>
                <a href="#" className="footer-link">
                  Writers
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Diversity and Inclusion
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Sustainability
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-column">
            <h4 className="column-title">Resources</h4>
            <ul className="column-links">
              <li>
                <a href="#" className="footer-link">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Writing Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Location */}
        <div className="footer-social-section">
          {/* Social Icons */}
          <div className="social-icons">
            <i className="bx bxl-facebook social-icon"></i>
            <i className="bx bxl-twitter social-icon"></i>
            <i className="bx bxl-youtube social-icon"></i>
            <i className="bx bxl-instagram social-icon"></i>
            <i className="bx bxl-linkedin social-icon"></i>
          </div>

          {/* Location & Language */}
          <div className="location-info">
            <span className="location-item">
              <i className="bx bx-globe location-icon"></i>
              English
            </span>
            <span className="location-item">
              <i className="bx bxs-location-plus location-icon"></i>
              Bengaluru
            </span>
            <span className="location-item">
              <i className="bx bx-phone location-icon"></i>
              8709931070
            </span>
            <span className="location-item">
              <i className="bx bx-envelope location-icon"></i>
              ravicse19.23@gmail.com
            </span>
          </div>
        </div>

        {/* App Store Badges */}
        <div className="app-badges">
          <img
            src="https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/illustrations/app-store-google-4d63c31a3e.svg"
            alt="Google Play"
            className="app-badge"
          />
          <img
            src="https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/illustrations/app-store-apple-f1f919205b.svg"
            alt="App Store"
            className="app-badge"
          />
        </div>

        {/* Bottom Copyright */}
        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} MyBlog Technologies Inc. | Developed by
            Ravi Shankar Kumar
          </p>
          <div className="legal-links">
            <a href="#" className="legal-link">
              Privacy
            </a>
            <a href="#" className="legal-link">
              Accessibility
            </a>
            <a href="#" className="legal-link">
              Terms
            </a>
            <a href="#" className="legal-link">
              Contact: 8709931070
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
