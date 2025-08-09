import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import JoditEditor from "jodit-react";
import { getCategories } from "../services/categories";
import { getPostById, updatePost } from "../services/posts";
import { getCurrentUser, ensureValidToken } from "../services/user_service";
import { myAxios } from "../services/helper";
import "./Addpost.css";

const EditPost = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const editor = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageName: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [post, setPost] = useState(null);

  // Jodit editor configuration
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder:
        "Write your post content here... (minimum 10 characters)\n\nContact: Ravi Shankar Kumar\nPhone: 8709931070\nEmail: ravicse19.23@gmail.com",
      height: 400,
      toolbar: true,
      spellcheck: true,
      language: "en",
      toolbarButtonSize: "medium",
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      askBeforePasteHTML: true,
      askBeforePasteFromWord: true,
      defaultActionOnPaste: "insert_clear_html",
      buttons: [
        "source",
        "|",
        "bold",
        "strikethrough",
        "underline",
        "italic",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "link",
        "table",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "fullsize",
      ],
      uploader: {
        insertImageAsBase64URI: true,
      },
      removeButtons: ["about", "print"],
      disablePlugins: "paste",
    }),
    []
  );

  useEffect(() => {
    initializeData();
  }, [postId]);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Debug: Check if token is set
      console.log("Current user:", user);
      console.log(
        "Authorization header:",
        myAxios.defaults.headers.common["Authorization"]
      );

      // Get categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      // Get post data
      const postData = await getPostById(postId);
      setPost(postData);

      // Check if user is the author of the post
      if (postData.user?.id !== user.id) {
        toast.error("You can only edit your own posts");
        navigate("/posts");
        return;
      }

      // Set form data
      setFormData({
        title: postData.title || "",
        content: postData.content || "",
        imageName: postData.imageName || "",
        categoryId: postData.category?.id?.toString() || "",
      });
    } catch (error) {
      console.error("Error initializing data:", error);
      setError("Failed to load post data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (newContent) => {
    setFormData((prev) => ({
      ...prev,
      content: newContent,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (
      formData.title.trim().length < 3 ||
      formData.title.trim().length > 100
    ) {
      toast.error("Title must be between 3 and 100 characters");
      return false;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return false;
    }
    // Remove HTML tags for length validation
    const plainTextContent = formData.content.replace(/<[^>]*>/g, "").trim();
    if (plainTextContent.length < 10) {
      toast.error("Content must be at least 10 characters long");
      return false;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("User information not available. Please login again.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Ensure token is valid before making the request
      const isTokenValid = await ensureValidToken();
      if (!isTokenValid) {
        toast.error("Your session has expired. Please login again.");
        navigate("/auth");
        return;
      }

      // Prepare post data matching PostDto structure
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageName: formData.imageName.trim() || null,
        categoryId: parseInt(formData.categoryId),
      };

      // Update post
      const updatedPost = await updatePost(postId, postData);

      console.log("Post updated successfully:", updatedPost);
      toast.success("Post updated successfully!");

      // Navigate to posts page to see the updated post
      navigate("/posts");
    } catch (error) {
      console.error("Error updating post:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update post. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (post) {
      setFormData({
        title: post.title || "",
        content: post.content || "",
        imageName: post.imageName || "",
        categoryId: post.category?.id?.toString() || "",
      });
    }
  };

  const handleCancel = () => {
    navigate("/posts");
  };

  if (loading) {
    return (
      <div className="addpost-container">
        <div className="loading">Loading post data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="addpost-container">
        <div className="error">
          {error}
          <button onClick={initializeData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="addpost-container">
        <div className="error">Post not found</div>
      </div>
    );
  }

  return (
    <div className="addpost-container">
      <form onSubmit={handleSubmit}>
        <h1>Edit Post</h1>

        {currentUser && (
          <div className="user-info">
            <p>
              Editing post as: <strong>{currentUser.name}</strong>
            </p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter post title (3-100 characters) - By Ravi Shankar Kumar"
            value={formData.title}
            onChange={handleChange}
            required
            minLength="3"
            maxLength="100"
          />
          <small>Title must be between 3 and 100 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Category *</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <JoditEditor
            ref={editor}
            value={formData.content}
            config={config}
            tabIndex={1}
            onBlur={handleEditorChange}
            onChange={handleEditorChange}
          />
          <small>
            Content must be at least 10 characters long (HTML supported)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="imageName">Image Name (Optional)</label>
          <input
            type="text"
            id="imageName"
            name="imageName"
            placeholder="Enter image name (optional) - Contact: 8709931070"
            value={formData.imageName}
            onChange={handleChange}
          />
          <small>You can upload an image after updating the post</small>
        </div>

        <div className="form-buttons">
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Updating Post..." : "Update Post"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="reset-btn"
            disabled={submitting}
          >
            Reset Form
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
