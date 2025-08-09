import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllPosts, searchPosts, deletePost } from "../services/posts";
import { createComment } from "../services/comments";
import {
  getCurrentUser,
  ensureValidToken,
  getCurrentTokenInfo,
} from "../services/user_service";
import { useAuth } from "../context/AuthContext";
import "./Posts.css";
import placeholderImg from "../image/image.png";

const Posts = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    postId: null,
    postTitle: "",
  });
  const [commentInputs, setCommentInputs] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  // Removed post detail modal state; showing full content inline
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
    lastPage: false,
    firstPage: true,
  });

  const firstLoadRef = useRef(true);
  const loadMoreRef = useRef(null);

  // Apply full-page dark background for Posts page
  useEffect(() => {
    document.body.classList.add("posts-dark");
    return () => {
      document.body.classList.remove("posts-dark");
    };
  }, []);

  useEffect(() => {
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return; // initial fetch already done in initializeData
    }

    if (searchKeyword.trim()) {
      handleSearch();
    } else {
      // Append when pageNumber increases
      fetchPosts(pagination.pageNumber > 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageNumber, pagination.pageSize]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (searchKeyword.trim()) return; // disable during search
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setPagination((prev) => ({
            ...prev,
            pageNumber: prev.pageNumber + 1,
          }));
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loadingMore, searchKeyword]);

  const handleAuthError = (error) => {
    console.error("Authentication error:", error);
    const errorMessage = error.message || "Authentication failed";

    if (
      errorMessage.includes("No user data available") ||
      errorMessage.includes("login again") ||
      errorMessage.includes("401") ||
      errorMessage.includes("Unauthorized")
    ) {
      toast.error("Session expired. Please login again.");
      logout();
      navigate("/auth", { replace: true });
      return true; // Indicates this was an auth error
    }
    return false; // Not an auth error
  };

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

      // Initial page load
      await fetchPosts(false);
    } catch (error) {
      console.error("Error initializing data:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (append = false) => {
    try {
      if (append) setLoadingMore(true);
      const response = await getAllPosts(
        pagination.pageNumber,
        pagination.pageSize,
        "createdDate",
        "desc"
      );

      setHasMore(!response.lastPage);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
        lastPage: response.lastPage || false,
        firstPage: response.firstPage || prev.pageNumber === 0,
      }));

      setPosts((prev) =>
        append ? [...prev, ...(response.content || [])] : response.content || []
      );
    } catch (error) {
      console.error("Error fetching posts:", error);

      if (!handleAuthError(error)) {
        toast.error("Failed to load posts");
      }
    } finally {
      if (append) setLoadingMore(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      // reset and load first page
      setPosts([]);
      setPagination((prev) => ({ ...prev, pageNumber: 0 }));
      await fetchPosts(false);
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
      setHasMore(false);
    } catch (error) {
      console.error("Error searching posts:", error);

      if (!handleAuthError(error)) {
        toast.error("Failed to search posts");
      }
    }
  };

  const canDeletePost = (post) => {
    if (!currentUser) return false;
    if (!post) return false;

    // Check if user is the author of the post
    const isAuthor = post.user?.id === currentUser.id;

    // Check if user has admin role (if roles are available)
    const isAdmin = currentUser.roles?.some(
      (role) => role.name === "ROLE_ADMIN" || role.name === "ADMIN"
    );

    return isAuthor || isAdmin;
  };

  // Removed open/close handlers for post detail modal

  const handleDelete = async (postId) => {
    // Find the post to get its title
    const post = posts.find((p) => p.id === postId);

    // Check if user can delete this post
    if (!canDeletePost(post)) {
      toast.error("You don't have permission to delete this post.");
      return;
    }

    setDeleteModal({
      show: true,
      postId: postId,
      postTitle: post?.title || "this post",
    });
  };

  const confirmDelete = async () => {
    try {
      // Debug: Log current token and user info
      const tokenInfo = await getCurrentTokenInfo();
      console.log("Current token info:", tokenInfo);
      console.log("Current user:", currentUser);
      console.log(
        "Post to delete:",
        posts.find((p) => p.id === deleteModal.postId)
      );

      // Ensure token is valid before making the request
      const isTokenValid = await ensureValidToken();
      if (!isTokenValid) {
        toast.error("Your session has expired. Please login again.");
        logout();
        navigate("/auth", { replace: true });
        return;
      }

      // Check permissions: allow author or admin
      const post = posts.find((p) => p.id === deleteModal.postId);
      const isAdmin = currentUser?.roles?.some(
        (role) => role.name === "ROLE_ADMIN" || role.name === "ADMIN"
      );
      const isAuthor = post && currentUser && post.user?.id === currentUser.id;
      if (!(isAuthor || isAdmin)) {
        toast.error("You don't have permission to delete this post.");
        setDeleteModal({ show: false, postId: null, postTitle: "" });
        return;
      }

      await deletePost(deleteModal.postId);
      toast.success("Post deleted successfully!");
      // Remove from list
      setPosts((prev) => prev.filter((p) => p.id !== deleteModal.postId));
      setDeleteModal({ show: false, postId: null, postTitle: "" });
    } catch (error) {
      console.error("Error deleting post:", error);

      if (!handleAuthError(error)) {
        // Show the specific error message from the service
        const errorMessage = error.message || "Failed to delete post";
        toast.error(errorMessage);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, postId: null, postTitle: "" });
  };

  // Removed manual page change handler (using infinite scroll)

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

  // Removed truncateContent; showing full content inline now

  const renderContent = (content) => {
    if (!content) return "";
    // For display, we can show HTML content
    return content;
  };

  const toPlainText = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  const extractFirstImageUrlFromHtml = (html) => {
    if (!html) return null;
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
      return `/images/${name}`;
    }
    const fromContent = extractFirstImageUrlFromHtml(post?.content);
    if (fromContent) return fromContent;
    return placeholderImg;
  };

  const getUserRole = (roles) => {
    if (!roles || roles.length === 0) return "User";
    return roles.map((role) => role.name.replace("ROLE_", "")).join(", ");
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleAddComment = async (postId) => {
    if (!currentUser) {
      toast.error("Please login to add comments");
      navigate("/auth");
      return;
    }

    const commentText = commentInputs[postId]?.trim();
    if (!commentText) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));

      const commentData = {
        content: commentText,
        userId: currentUser.id,
      };

      await createComment(commentData, postId);
      toast.success("Comment added successfully!");

      // Clear the input
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

      // Refresh the posts to show the new comment
      await fetchPosts(false);
    } catch (error) {
      console.error("Error adding comment:", error);
      if (!handleAuthError(error)) {
        toast.error("Failed to add comment");
      }
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="posts-container">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="posts-container">
        <div className="error">
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={initializeData} className="retry-btn">
              Retry
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/auth", { replace: true });
              }}
              className="login-btn"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h1>All Posts ({pagination.totalElements})</h1>
      </div>

      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search posts... - Contact: Ravi Shankar Kumar (8709931070)"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="search-btn">
            Search
          </button>
        </div>
        {searchKeyword && (
          <button
            onClick={() => {
              setSearchKeyword("");
              setPosts([]);
              setPagination((prev) => ({ ...prev, pageNumber: 0 }));
              setHasMore(true);
              fetchPosts(false);
            }}
            className="clear-search-btn"
          >
            Clear Search
          </button>
        )}
      </div>

      <div className="posts-content">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found.</p>
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  {/* Top Section: Image Left + Title Right */}
                  <div className="post-header">
                    <div className="post-image">
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
                    </div>
                    <div className="post-title-section">
                      <h3>{post.title}</h3>
                    </div>
                  </div>

                  {/* Bottom Section: Full Content */}
                  <div className="post-content">
                    <div
                      className="post-content-full"
                      dangerouslySetInnerHTML={{
                        __html: renderContent(post.content),
                      }}
                    />
                    <div className="post-meta">
                      <span className="post-category">
                        {post.category?.title || "Uncategorized"}
                      </span>
                      <span className="post-author">
                        By {post.user?.name || "Unknown"}
                      </span>
                      <span className="post-date">
                        {formatDate(post.createdDate)}
                      </span>
                      {post.user?.roles && (
                        <span className="post-role">
                          {getUserRole(post.user.roles)}
                        </span>
                      )}
                    </div>
                    {post.comments && post.comments.length > 0 && (
                      <div className="comments-list">
                        {post.comments.slice(0, 1).map((comment, index) => (
                          <div
                            key={comment.id || index}
                            className="comment-item"
                          >
                            <div className="comment-author">
                              {comment.user?.name || "User"}
                            </div>
                            <div className="comment-text">
                              {toPlainText(comment.content)}
                            </div>
                          </div>
                        ))}
                        {post.comments.length > 1 && (
                          <div className="more-comments-note">
                            +{post.comments.length - 1} more comment(s)
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add Comment Section */}
                    <div className="add-comment-section">
                      {currentUser ? (
                        <div className="comment-input-container">
                          <div className="comment-input-header">
                            <span className="comment-user-name">
                              {currentUser.name}
                            </span>
                            <span className="comment-label">
                              Add a comment:
                            </span>
                          </div>
                          <div className="comment-input-wrapper">
                            <textarea
                              placeholder="Write your comment here... - Contact: Ravi Shankar Kumar (8709931070)"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                handleCommentChange(post.id, e.target.value)
                              }
                              className="comment-input"
                              rows={3}
                              disabled={commentSubmitting[post.id]}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={
                                commentSubmitting[post.id] ||
                                !commentInputs[post.id]?.trim()
                              }
                              className="add-comment-btn"
                            >
                              {commentSubmitting[post.id]
                                ? "Adding..."
                                : "Add Comment"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="login-to-comment">
                          <p>
                            <button
                              onClick={() => navigate("/auth")}
                              className="login-link-btn"
                            >
                              Login
                            </button>{" "}
                            to add comments
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="post-actions">
                      {currentUser && (
                        <>
                          {post.user?.id === currentUser.id && (
                            <button
                              onClick={() => navigate(`/edit-post/${post.id}`)}
                              className="edit-btn"
                            >
                              Edit
                            </button>
                          )}
                          {canDeletePost(post) && (
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            {!searchKeyword && (
              <div ref={loadMoreRef} className="infinite-sentinel">
                {loadingMore ? "Loading more..." : hasMore ? "" : ""}
              </div>
            )}
          </>
        )}
      </div>

      {deleteModal.show && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete "{deleteModal.postTitle}"?</p>
            <div className="delete-modal-actions">
              <button onClick={confirmDelete} className="confirm-delete-btn">
                Delete
              </button>
              <button onClick={cancelDelete} className="cancel-delete-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Removed post detail modal and Add button */}
    </div>
  );
};

export default Posts;
