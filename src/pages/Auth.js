import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./Auth.css";

// Import images
import signupImage from "../image/ben-kolde-FaPxZ88yZrw-unsplash.jpg";
import loginImage from "../image/jess-bailey-q10VITrVYUM-unsplash.jpg";

const Auth = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          toast.error("Please enter email and password");
          return;
        }

        const res = await login({
          email: formData.email,
          password: formData.password,
        });
        if (!res) return; // login already handled error toast
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        if (!formData.name || !formData.email || !formData.password) {
          toast.error("Please fill all required fields");
          return;
        }

        const res = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
        });
        if (!res) return; // signup already handled error toast

        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          bio: "",
        });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong";
      toast.error(message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      bio: "",
    });
  };

  // Ensure navbar is dark on the auth page
  useEffect(() => {
    document.body.classList.add("auth-dark");
    return () => {
      document.body.classList.remove("auth-dark");
    };
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-split">
        {/* Image Section */}
        <div className="auth-image-section">
          <div
            className="auth-image"
            style={{
              backgroundImage: `url(${isLogin ? loginImage : signupImage})`,
            }}
          >
            <div className="image-overlay">
              <div className="image-content">
                <h2>
                  {isLogin
                    ? "Welcome Back"
                    : "Ready to start your success story?"}
                </h2>
                <p>
                  {isLogin
                    ? "Sign in to your account to continue your journey"
                    : "Signup to our website and start leafing through your favorite literature today!"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            {/* Always show header for both login and signup */}
            <div className="auth-header">
              <h1>{isLogin ? "Sign In" : "Create Account"}</h1>
              <p>
                {isLogin
                  ? "Enter your credentials to access your account"
                  : "Join our community and start sharing your stories"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Ravi Shankar Kumar"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="ravicse19.23@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                    className="form-input"
                  />
                </div>
              )}

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="bio">Bio (Optional)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself (e.g., Contact: 8709931070)"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="2"
                  />
                </div>
              )}

              <div className="form-button-container">
                <button type="submit" className="auth-button">
                  {isLogin ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="auth-toggle-btn"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
