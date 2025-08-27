import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import JoditEditor from "jodit-react";
import { getCategories } from "../services/categories";
import { createPost, uploadPostImage, updatePost } from "../services/posts";
import { getCurrentUser } from "../services/user_service";
import { useAuth } from "../context/AuthContext";
import "./Addpost.css";

const Addpost = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  // New state for image handling
  const [imageMode, setImageMode] = useState("link"); // "link" or "upload"
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Jodit editor configuration
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder:
        "Write your post content here... (minimum 10 characters)\n\nContact: Ravi Shankar Kumar\nPhone: 8709931070\nEmail: ravi.kumar@thinkvista.in",
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

  // Auth error handler (stable)
  const handleAuthError = useCallback(
    (error) => {
      // Authentication error occurred
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
    },
    [logout, navigate]
  );

  // Make the page use a dark background and dark navbar while Addpost is mounted
  useEffect(() => {
    document.body.classList.add("addpost-dark");
    return () => {
      document.body.classList.remove("addpost-dark");
    };
  }, []);

  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Get categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      // Categories fetched successfully
    } catch (error) {
      // Error initializing data

      if (!handleAuthError(error)) {
        setError("Failed to load required data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

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

  // Image handling functions
  const handleImageModeChange = (mode) => {
    setImageMode(mode);
    // Clear previous image data when switching modes
    if (mode === "link") {
      setImageFile(null);
      setImagePreview(null);
    } else {
      setFormData(prev => ({ ...prev, imageName: "" }));
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5MB");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageData = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageName: "" }));
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
    
    // Validate image based on mode
    if (imageMode === "link") {
      if (!formData.imageName.trim()) {
        toast.error("Image link is required");
        return false;
      }
      // Basic URL validation
      try {
        new URL(formData.imageName.trim());
      } catch {
        toast.error("Please enter a valid image URL");
        return false;
      }
    } else {
      if (!imageFile) {
        toast.error("Please select an image file to upload");
        return false;
      }
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

      let imageName = "default-post.jpg";

      if (imageMode === "link") {
        // Use the provided image link
        imageName = formData.imageName.trim();
      } else {
        // Upload image file first
        if (imageFile) {
          // Create post first with a temporary image name
          const tempPostData = {
            title: formData.title.trim(),
            content: formData.content.trim(),
            imageName: "temp-image.jpg",
          };

          const createdPost = await createPost(
            tempPostData,
            currentUser.id,
            formData.categoryId
          );

          // Upload the image and get the image name
          const uploadResult = await uploadPostImage(createdPost.id, imageFile);
          imageName = uploadResult.imageName || "default-post.jpg";

          // Update the post with the correct image name
          await updatePost(createdPost.id, {
            ...tempPostData,
            imageName: imageName,
          });

          toast.success("Post created successfully!");
          clearImageData();
          setFormData({
            title: "",
            content: "",
            imageName: "",
            categoryId: "",
          });
          navigate("/posts");
          return;
        }
      }

      // For link mode, create post directly
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageName: imageName,
      };

      // Create post
      const createdPost = await createPost(
        postData,
        currentUser.id,
        formData.categoryId
      );

      // Post created successfully
      toast.success("Post created successfully!");

      // Reset form
      setFormData({
        title: "",
        content: "",
        imageName: "",
        categoryId: "",
      });

      // Navigate to posts page to see the created post
      navigate("/posts");
    } catch (error) {
      // Error creating post
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create post. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      content: "",
      imageName: "",
      categoryId: "",
    });
    if (editor.current) {
      editor.current.value = "";
    }
    // Clear image data
    clearImageData();
    setImageMode("link");
  };

  if (loading) {
    return (
      <div className="addpost-container">
        <div className="loading">Loading required data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="addpost-container">
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
    <div className="addpost-container">
      <form onSubmit={handleSubmit}>
        <h1>Add Post</h1>

        {currentUser && (
          <div className="user-info">
            <p>
              Creating post as: <strong>{currentUser.name}</strong>
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
          <label>Image *</label>
          
          {/* Image Mode Selection */}
          <div className="image-mode-selector">
            <label className="radio-label">
              <input
                type="radio"
                name="imageMode"
                value="link"
                checked={imageMode === "link"}
                onChange={() => handleImageModeChange("link")}
              />
              <span>Provide Image Link</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="imageMode"
                value="upload"
                checked={imageMode === "upload"}
                onChange={() => handleImageModeChange("upload")}
              />
              <span>Upload Image File</span>
            </label>
          </div>

          {/* Image Link Input */}
          {imageMode === "link" && (
            <div className="image-link-input">
              <input
                type="url"
                id="imageName"
                name="imageName"
                placeholder="Enter image URL (required) - Contact: 8709931070"
                value={formData.imageName}
                onChange={handleChange}
                required
              />
              <small>
                Please provide a valid image URL. If no image is provided, a default image will be shown.
              </small>
            </div>
          )}

          {/* Image Upload Input */}
          {imageMode === "upload" && (
            <div className="image-upload-input">
              <input
                type="file"
                id="imageFile"
                name="imageFile"
                accept="image/*"
                onChange={handleImageFileChange}
                required
              />
              <small>
                Select an image file (JPG, PNG, GIF, etc.) - Max size: 5MB
              </small>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={clearImageData}
                    className="clear-image-btn"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-buttons">
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Creating Post..." : "Create Post"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="reset-btn"
            disabled={submitting}
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default Addpost;
