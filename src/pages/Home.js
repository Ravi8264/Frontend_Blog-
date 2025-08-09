import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllPosts, searchPosts } from "../services/posts";
// import { createComment } from "../services/comments";
import { getCurrentUser } from "../services/user_service";
import HeroCarousel from "../component/HeroCarousel/HeroCarousel";
import placeholderImg from "../image/image.png";
import "./Home.css";

// Import a blog header image
// Note: header background is handled via CSS

const Home = () => {
  useEffect(() => {
    document.body.classList.add("home-page");
    return () => {
      document.body.classList.remove("home-page");
    };
  }, []);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchKeyword] = useState("");
  // const [commentText, setCommentText] = useState({});
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
    lastPage: false,
    firstPage: true,
  });
  const carouselRef = useRef(null);
  const cardStepRef = useRef(0);
  const loopedPosts = posts.length > 0 ? [...posts, ...posts] : [];

  useEffect(() => {
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      handleSearch();
    } else {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageNumber, pagination.pageSize, searchKeyword]);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user (optional - don't fail if no user)
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        console.log("Current user loaded:", user);
      } catch (userError) {
        console.log(
          "No user logged in, continuing as guest:",
          userError.message
        );
        setCurrentUser(null);
      }

      // Fetch initial posts
      await fetchPosts();
    } catch (error) {
      console.error("Error initializing data:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      let errorMessage = "Failed to load posts. Please try again.";

      if (error.response?.status === 404) {
        errorMessage =
          "Posts endpoint not found. Please check if the backend is running.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message.includes("Network Error")) {
        errorMessage =
          "Cannot connect to server. Please check if the backend is running on http://localhost:8080";
      } else if (error.message) {
        errorMessage = `Failed to load posts: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts with params:", {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        sortBy: "createdDate",
        sortDir: "desc",
      });

      const response = await getAllPosts(
        pagination.pageNumber,
        pagination.pageSize,
        "createdDate",
        "desc"
      );

      console.log("Posts response:", response);

      setPosts(response.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
        lastPage: response.lastPage || false,
        firstPage: response.firstPage || true,
      }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      console.error("Fetch posts error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      toast.error(`Failed to load posts: ${error.message}`);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchPosts();
      return;
    }

    try {
      const searchResults = await searchPosts(searchKeyword);
      setPosts(searchResults);
      setPagination((prev) => ({
        ...prev,
        totalPages: 1,
        totalElements: searchResults.length,
        lastPage: true,
        firstPage: true,
      }));
    } catch (error) {
      console.error("Error searching posts:", error);
      toast.error("Failed to search posts");
    }
  };

  // comment editing and add are not used in this view state currently

  // const handleAddComment = async (postId) => { /* unused */ };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      pageNumber: newPage,
    }));
  };

  // Navigate user to create blog flow
  const handleCreateBlog = () => {
    if (currentUser) {
      navigate("/addpost");
    } else {
      navigate("/auth");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return "";
    // Remove HTML tags for truncation
    const plainText = content.replace(/<[^>]*>/g, "");
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  };

  const extractFirstImageUrlFromHtml = (html) => {
    if (!html) return null;
    // Get URLs from href/src or plain text inside content
    const srcMatch = html.match(
      /src=["']([^"']+\.(?:png|jpe?g|gif|webp|svg))(?:\?[^"']*)?["']/i
    );
    if (srcMatch && srcMatch[1]) return srcMatch[1];
    const hrefMatch = html.match(
      /href=["']([^"']+\.(?:png|jpe?g|gif|webp|svg))(?:\?[^"']*)?["']/i
    );
    if (hrefMatch && hrefMatch[1]) return hrefMatch[1];
    const urlMatch = html.match(
      /https?:\/\/[^\s<>"]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s<>"]*)?/i
    );
    if (urlMatch && urlMatch[0]) return urlMatch[0];
    return null;
  };

  const resolvePostImage = (post) => {
    const name = post?.imageName;
    if (name && name !== "default.img") {
      if (/^https?:\/\//i.test(name)) return name;
      return `/images/${name}`; // keep existing convention
    }
    const fromContent = extractFirstImageUrlFromHtml(post?.content);
    if (fromContent) return fromContent;
    return placeholderImg;
  };

  // Manual scroll buttons (optional - agar chahiye toh rakh sakte hain)
  const scrollCarousel = (direction) => {
    const el = carouselRef.current;
    if (!el) return;

    const amount = cardStepRef.current || Math.floor(el.clientWidth * 0.9);
    const half = el.scrollWidth / 2;

    if (direction === "right") {
      if (el.scrollLeft + amount >= half - 5) {
        el.scrollLeft = el.scrollLeft - half;
      }
      el.scrollBy({ left: amount, behavior: "smooth" });
    } else {
      if (el.scrollLeft - amount <= 0) {
        el.scrollLeft = el.scrollLeft + half;
      }
      el.scrollBy({ left: -amount, behavior: "smooth" });
    }
  };

  // Fixed auto-scroll - working version
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || posts.length === 0) {
      console.log("❌ Auto-scroll skipped:", {
        element: !!el,
        postsLength: posts.length,
      });
      return;
    }

    console.log("🚀 Auto-scroll initializing...", {
      postsCount: posts.length,
      element: el,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    });

    // Card width calculate karo
    const calculateCardWidth = () => {
      const firstCard = el.querySelector(".carousel-item");
      if (firstCard) {
        const style = window.getComputedStyle(firstCard);
        const marginLeft = parseFloat(style.marginLeft || "0");
        const marginRight = parseFloat(style.marginRight || "0");
        const width = Math.ceil(
          firstCard.offsetWidth + marginLeft + marginRight
        );
        console.log("📏 Card width calculated:", width);
        return width;
      }
      const fallback = Math.floor(el.clientWidth * 0.8);
      console.log("📏 Card width fallback:", fallback);
      return fallback;
    };

    // Wait for DOM to be ready and force scroll
    setTimeout(() => {
      cardStepRef.current = calculateCardWidth();

      console.log("📊 Scroll dimensions:", {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        cardStep: cardStepRef.current,
        hasOverflow: el.scrollWidth > el.clientWidth,
      });

      // Force auto-scroll even with few posts for testing
      console.log(`✅ Starting auto-scroll with ${posts.length} posts`);

      let autoScrollTimer = null;
      let scrollPosition = 0;
      let isActive = true;

      // Enhanced auto-scroll function - more aggressive
      const autoScroll = () => {
        if (!isActive || !el) {
          console.log("❌ Auto-scroll inactive or element missing");
          return;
        }

        const scrollAmount = 300; // Reduced scroll amount for smoother movement
        const maxScroll = el.scrollWidth - el.clientWidth;

        console.log("🔄 Auto-scrolling...", {
          currentScrollLeft: el.scrollLeft,
          scrollPosition,
          scrollAmount,
          maxScroll,
          totalWidth: el.scrollWidth,
          isActive,
        });

        // Increment scroll position
        scrollPosition += scrollAmount;

        // Reset if we've gone too far
        if (scrollPosition >= maxScroll || scrollPosition >= el.scrollWidth) {
          console.log("🔄 Resetting to start");
          scrollPosition = 0;
        }

        // Apply scroll
        try {
          el.scrollTo({
            left: scrollPosition,
            behavior: "smooth",
          });
          console.log(`📍 Scrolled to position: ${scrollPosition}`);
        } catch (error) {
          console.error("❌ Scroll error:", error);
        }
      };

      // Start timer - 2 seconds for quick testing
      console.log("🚀 Creating auto-scroll timer...");
      autoScrollTimer = setInterval(() => {
        console.log("⏰ Timer fired! Calling autoScroll...");
        autoScroll();
      }, 1500); // Faster scrolling for better visibility
      console.log("✅ Auto-scroll timer created:", autoScrollTimer);

      // Manual test scroll after 1 second
      setTimeout(() => {
        console.log("🧪 Manual test scroll...");
        el.scrollTo({ left: 300, behavior: "smooth" });
      }, 1000);

      // Test if timer is working after 3 seconds
      setTimeout(() => {
        console.log("🔍 Timer check - is timer still active?", autoScrollTimer);
      }, 3000);

      // Immediate test of autoScroll function
      setTimeout(() => {
        console.log("🧪 Testing autoScroll function directly...");
        autoScroll();
      }, 2500);

      // Cleanup function
      return () => {
        isActive = false;
        if (autoScrollTimer) {
          clearInterval(autoScrollTimer);
          autoScrollTimer = null;
          console.log("🛑 Auto-scroll timer cleared and deactivated");
        }
      };
    }, 500); // Longer delay to ensure everything is loaded
  }, [posts.length]); // Re-run when posts change

  // Debug useEffect triggers
  useEffect(() => {
    console.log("🔄 useEffect triggered - posts.length changed:", posts.length);
  }, [posts.length]);

  // const renderContent = (content) => content || ""; // unused

  const getUserRole = (roles) => {
    if (!roles || roles.length === 0) return "User";
    return roles.map((role) => role.name.replace("ROLE_", "")).join(", ");
  };

  // const isPostAuthor = (post) => currentUser && post.user?.id === currentUser.id; // unused

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error">
          {error}
          <button onClick={initializeData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <HeroCarousel />

      {/* Map banner with overlay content */}
      <div className="map-banner">
        <div className="map-banner-content">
          <h2 className="map-title">Join millions of others</h2>
          <p className="map-subtitle">
            Whether sharing your expertise, breaking news, or whatever’s on your
            mind, you’re in good company. Start your blog in minutes.
          </p>
          <button className="map-cta-btn" onClick={handleCreateBlog}>
            Create Your Blog
          </button>
        </div>
      </div>

      {/* Blog Header Image Section */}
      <div className="blog-header-image">
        <div className="blog-header-overlay">
          <div className="blog-header-content">
            <h1>Welcome to Our Blog</h1>
            <p>Discover and engage with posts from our community</p>
            <div className="blog-header-meta">
              <div className="blog-author">
                <span>Written by</span>
                <strong>Ravi Shankar Kumar</strong>
              </div>
              <div className="blog-contact">
                <span>Contact</span>
                <strong>8709931070</strong>
              </div>
              <div className="blog-date">
                <span>Published on</span>
                <strong>
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="posts-content">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found.</p>
            {currentUser && (
              <button
                onClick={() => navigate("/addpost")}
                className="create-first-post-btn"
              >
                Create Your First Post
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={`posts-carousel-wrapper ${
                posts.length >= 4 ? "has-many-posts" : ""
              }`}
            >
              <button
                type="button"
                className="carousel-btn left"
                onClick={() => scrollCarousel("left")}
                aria-label="Previous"
              >
                ‹
              </button>
              <div className="posts-carousel" ref={carouselRef}>
                {loopedPosts.map((post, i) => (
                  <div
                    key={`${post.id}-${i}`}
                    className="story-card carousel-item"
                    onClick={() => navigate(`/posts`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigate(`/posts`);
                      }
                    }}
                  >
                    {/* Image with Hover Overlay */}
                    <div className="story-image">
                      <img
                        src={resolvePostImage(post)}
                        alt={post.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = placeholderImg;
                        }}
                      />
                      <div className="story-overlay">
                        <div className="story-badges">
                          <span className="story-category">
                            {post.category?.title || "Uncategorized"}
                          </span>
                          {post.user?.roles && (
                            <span className="story-role">
                              {getUserRole(post.user.roles)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Area - Below Image */}
                    <div className="story-content">
                      <div className="story-main">
                        <h3 className="story-title">{post.title}</h3>
                        <p className="story-excerpt">
                          {truncateContent(post.content, 80)}
                        </p>
                      </div>

                      <div className="story-footer">
                        <div className="story-meta">
                          <span className="story-author">
                            By {post.user?.name || "Unknown"}
                          </span>
                          <span className="story-date">
                            {formatDate(post.createdDate)}
                          </span>
                        </div>

                        <div className="story-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/posts`);
                            }}
                            className="story-view-btn"
                          >
                            View Posts
                          </button>
                          {post.comments && post.comments.length > 0 && (
                            <span className="story-comments">
                              {post.comments.length} comment
                              {post.comments.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="carousel-btn right"
                onClick={() => scrollCarousel("right")}
                aria-label="Next"
              >
                ›
              </button>
            </div>

            {!searchKeyword && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.pageNumber - 1)}
                  disabled={pagination.firstPage}
                  className="page-btn"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.pageNumber + 1} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.pageNumber + 1)}
                  disabled={pagination.lastPage}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
