import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCurrentUser } from "../../services/user_service";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to dark theme
  const { isLoggedIn, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);

    // Save to localStorage
    localStorage.setItem("theme", newTheme ? "dark" : "light");

    // Apply theme to document body
    if (newTheme) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  };

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = savedTheme ? savedTheme === "dark" : true; // Default to dark

    setIsDarkTheme(prefersDark);

    // Apply theme to document body
    if (prefersDark) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, []);

  // Check if user is admin
  useEffect(() => {
    const checkUserRole = async () => {
      if (isLoggedIn) {
        try {
          const user = await getCurrentUser();
          setCurrentUser(user);

          // Check if user has ADMIN role
          const hasAdminRole = user?.roles?.some(
            (role) => role.name === "ROLE_ADMIN" || role.name === "ADMIN"
          );
          setIsAdmin(hasAdminRole);

          console.log("User roles:", user?.roles);
          console.log("Is Admin:", hasAdminRole);
        } catch (error) {
          console.error("Error checking user role:", error);
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    closeMenu();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MyBlog
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          <Link to="/posts" className="navbar-link">
            Posts
          </Link>
          <Link to="/about" className="navbar-link">
            About
          </Link>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="navbar-link theme-toggle-btn"
            title={
              isDarkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"
            }
          >
            {isDarkTheme ? "☀️" : "🌙"}
          </button>

          {isLoggedIn ? (
            <>
              <Link to="/addpost" className="navbar-link">
                Add Post
              </Link>
              {isAdmin && (
                <Link to="/categories" className="navbar-link admin-link">
                  Categories
                </Link>
              )}
              <Link to="/profileinfo" className="navbar-link">
                Profile
              </Link>
              <button onClick={handleLogout} className="navbar-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="navbar-link">
              Sign In
            </Link>
          )}
        </div>

        {/* Hamburger Button */}
        <div
          className={`navbar-hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="navbar-mobile-menu">
            <button className="navbar-close" onClick={closeMenu}>
              ×
            </button>
            <Link to="/" onClick={closeMenu} className="navbar-mobile-link">
              Home
            </Link>
            <Link
              to="/posts"
              onClick={closeMenu}
              className="navbar-mobile-link"
            >
              Posts
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="navbar-mobile-link"
            >
              About
            </Link>

            {/* Mobile Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="navbar-mobile-link theme-toggle-btn"
              title={
                isDarkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"
              }
            >
              {isDarkTheme ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            {isLoggedIn ? (
              <>
                <Link
                  to="/addpost"
                  onClick={closeMenu}
                  className="navbar-mobile-link"
                >
                  Add Post
                </Link>
                {isAdmin && (
                  <Link
                    to="/categories"
                    onClick={closeMenu}
                    className="navbar-mobile-link admin-link"
                  >
                    Categories
                  </Link>
                )}
                <Link
                  to="/profileinfo"
                  onClick={closeMenu}
                  className="navbar-mobile-link"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar-mobile-link logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={closeMenu}
                className="navbar-mobile-link"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
