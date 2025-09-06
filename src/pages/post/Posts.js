import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllPosts, searchPosts, deletePost } from "../../services/posts";
import { createComment } from "../../services/comments";
import { getCurrentUser } from "../../services/user_service";
import { useAuth } from "../../context/AuthContext";
import "./Posts.css";
import placeholderImg from "../../image/image.png";

const Posts = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Apply dark background
  useEffect(() => {
    document.body.classList.add("posts-dark");
    return () => {
      document.body.classList.remove("posts-dark");
    };
  }, []);

  const loadUserAndPosts = useCallback(async () => {
    setLoading(true);

    // Get current user
    const user = await getCurrentUser();
    setCurrentUser(user);

    // Load posts
    const response = await getAllPosts(currentPage, 10, "createdDate", "desc");
    setPosts(response.content || []);
    setTotalPages(response.totalPages || 0);

    setLoading(false);
  }, [currentPage]);

  useEffect(() => {
    loadUserAndPosts();
  }, [loadUserAndPosts]);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setCurrentPage(0);
      await loadUserAndPosts();
      return;
    }

    setLoading(true);
    const searchResults = await searchPosts(searchKeyword.trim());

    if (searchResults && searchResults.length > 0) {
      setPosts(searchResults);
      toast.success(`Found ${searchResults.length} post(s)`);
    } else {
      setPosts([]);
      toast.info("No posts found");
    }
    setLoading(false);
  };

  const handleDelete = async (postId) => {
    if (!currentUser) {
      toast.error("Please login to delete posts");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (
      !post ||
      (post.user?.id !== currentUser.id &&
        !currentUser.roles?.some((r) => r.name === "ROLE_ADMIN"))
    ) {
      toast.error("You can only delete your own posts");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      await deletePost(postId);
      toast.success("Post deleted successfully!");
      setPosts(posts.filter((p) => p.id !== postId));
    }
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

    setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));

    await createComment(
      {
        content: commentText,
        userId: currentUser.id,
      },
      postId
    );

    toast.success("Comment added successfully!");
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    await loadUserAndPosts(); // Refresh posts to show new comment
    setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPostImage = (post) => {
    if (post.imageName && post.imageName !== "default.img") {
      return post.imageName.startsWith("http")
        ? post.imageName
        : `/images/${post.imageName}`;
    }
    return placeholderImg;
  };

  if (loading) {
    return (
      <div className="posts-container">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h1>All Posts</h1>
      </div>

      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search posts..."
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
              setCurrentPage(0);
              loadUserAndPosts();
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
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-image">
                    <img
                      src={getPostImage(post)}
                      alt={post.title}
                      onError={(e) => {
                        e.currentTarget.src = placeholderImg;
                      }}
                    />
                  </div>
                  <div className="post-title-section">
                    <h3>{post.title}</h3>
                  </div>
                </div>

                <div className="post-content">
                  <div
                    className="post-content-full"
                    dangerouslySetInnerHTML={{ __html: post.content }}
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
                  </div>

                  {/* Comments */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="comments-list">
                      {post.comments.map((comment, index) => (
                        <div key={comment.id || index} className="comment-item">
                          <div className="comment-author">
                            {comment.user?.name || "Anonymous"}
                          </div>
                          <div className="comment-text">
                            {comment.content.replace(/<[^>]*>/g, "")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="add-comment-section">
                    {currentUser ? (
                      <div className="comment-input-container">
                        <textarea
                          placeholder="Write your comment..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
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

                  {/* Post Actions */}
                  <div className="post-actions">
                    {currentUser && post.user?.id === currentUser.id && (
                      <button
                        onClick={() => navigate(`/edit-post/${post.id}`)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                    )}
                    {currentUser && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Pagination */}
      {!searchKeyword && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage >= totalPages - 1}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Posts;
