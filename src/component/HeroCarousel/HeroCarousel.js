import React, { useState, useEffect } from "react";
import "./HeroCarousel.css";

// Import images
import img1 from "../../image/pexels-pixabay-326212.jpg";
import img2 from "../../image/pexels-jovana-nesic-188639-593655.jpg";
import img3 from "../../image/pexels-longlens-30294241.jpg";
import img4 from "../../image/pexels-pixabay-45853.jpg";
import img5 from "../../image/pexels-pixabay-206359.jpg";
import img6 from "../../image/pexels-philippedonn-1133957.jpg";
import img7 from "../../image/pexels-pixabay-326055.jpg";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const images = [img1, img2, img3, img4, img5, img6, img7];
  const numSlides = images.length;

  // Preload images and handle loading state
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            setImagesLoaded((prev) => prev + 1);
            resolve();
          };
          img.onerror = reject;
          img.src = src.default || src;
        });
      });

      try {
        await Promise.all(imagePromises);
        // Small delay to show the loader
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error loading images:", error);
        setLoading(false);
      }
    };

    loadImages();
  }, [images]);

  useEffect(() => {
    if (loading) return; // Don't start carousel until images are loaded

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % numSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [numSlides, loading]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % numSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + numSlides) % numSlides);
  };

  const getTranslateXPercent = (index) => {
    // Place slides around the current slide with minimal movement using modulo
    const half = Math.floor(numSlides / 2);
    let relative = (index - currentSlide + numSlides) % numSlides; // 0..numSlides-1
    if (relative > half) {
      relative -= numSlides; // map to negative side for shortest path
    }
    return relative * 100; // percentage
  };

  if (loading) {
    return (
      <div className="hero-carousel">
        <div className="carousel-loader">
          <div className="loader-container">
            <div className="loader-spinner"></div>
            <div className="loader-text">Loading Amazing Stories...</div>
            <div className="loader-progress">
              <div
                className="loader-progress-bar"
                style={{ width: `${(imagesLoaded / numSlides) * 100}%` }}
              ></div>
            </div>
            <div className="loader-count">
              {imagesLoaded} of {numSlides} images loaded
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-carousel">
      <div className="carousel-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel-slide ${
              index === currentSlide ? "active" : ""
            }`}
            style={{
              backgroundImage: `url(${image.default || image})`,
              transform: `translateX(${getTranslateXPercent(index)}%)`,
            }}
          />
        ))}
      </div>

      <div className="carousel-overlay">
        <div className="hero-content">
          <div className="hero-badge">#1 MOST RECOMMENDED BLOG PLATFORM</div>

          <div className="awards-section">
            <div className="award">Best Content</div>
            <div className="award">Top Rated</div>
            <div className="award">User Choice</div>
            <div className="award">Excellence</div>
          </div>

          <h1 className="hero-title">We Create Amazing Stories</h1>

          <p className="hero-subtitle">on every searchable platform</p>
        </div>

        <div className="hero-footer">
          <div className="footer-left">
            Content creators sharing stories, experiences & insights for readers
            worldwide
          </div>
          <div className="footer-right">
            Global community serving readers across all continents
          </div>
        </div>
      </div>

      <button className="carousel-btn prev" onClick={prevSlide}>
        ‹
      </button>
      <button className="carousel-btn next" onClick={nextSlide}>
        ›
      </button>
    </div>
  );
};

export default HeroCarousel;
