import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categories";
import { getCurrentUser } from "../services/user_service";
import { useAuth } from "../context/AuthContext";
import "./CategoryManagement.css";

const CategoryManagement = () => {
  const { logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    categoryId: null,
    categoryTitle: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Load current user to determine role
        try {
          const user = await getCurrentUser();
          setCurrentUser(user);
          const admin = user?.roles?.some(
            (r) => r.name === "ROLE_ADMIN" || r.name === "ADMIN"
          );
          setIsAdmin(!!admin);
        } catch (e) {
          setCurrentUser(null);
          setIsAdmin(false);
        }

        fetchCategories();
      } catch (e) {
        setError("Failed to initialize categories page.");
      }
    };
    init();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
    });
    setEditingCategory(null);
    setShowAddForm(false);
  };

  const guardAdmin = () => {
    if (!isAdmin) {
      toast.error("Only admins can manage categories");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!guardAdmin()) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success("Category updated successfully!");
      } else {
        await createCategory(formData);
        toast.success("Category created successfully!");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save category. Please try again.";
      toast.error(message);
    }
  };

  const handleEdit = (category) => {
    if (!guardAdmin()) return;
    setEditingCategory(category);
    setFormData({
      title: category.title,
      description: category.description,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!guardAdmin()) return;
    const category = categories.find((c) => c.id === categoryId);
    setDeleteModal({
      show: true,
      categoryId: categoryId,
      categoryTitle: category?.title || "this category",
    });
  };

  const confirmDelete = async () => {
    if (!guardAdmin()) return;
    try {
      await deleteCategory(deleteModal.categoryId);
      toast.success("Category deleted successfully!");
      fetchCategories();
      setDeleteModal({ show: false, categoryId: null, categoryTitle: "" });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, categoryId: null, categoryTitle: "" });
  };

  const handleCancel = () => {
    resetForm();
  };

  if (loading) {
    return (
      <div className="category-management-container">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-management-container">
        <div className="error">
          {error}
          <button onClick={fetchCategories} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-management-container">
      <div className="category-header">
        <h1>Category Management</h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(true)}
            className="add-category-btn"
          >
            Add New Category
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="info-banner">
          Only admins can add, edit, or delete categories. You can view the list
          below.
        </div>
      )}

      {showAddForm && isAdmin && (
        <div className="category-form-container">
          <h2>{editingCategory ? "Edit Category" : "Add New Category"}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter category title - Ravi Shankar Kumar"
                required
                minLength="3"
                maxLength="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description - Contact: 8709931070"
                required
                minLength="5"
                maxLength="250"
                rows="4"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingCategory ? "Update Category" : "Create Category"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-list">
        <h2>All Categories ({categories.length})</h2>
        {categories.length === 0 ? (
          <div className="no-categories">
            <p>No categories found. Create your first category!</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-content">
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>
                {isAdmin && (
                  <div className="category-actions">
                    <button
                      onClick={() => handleEdit(category)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteModal.show && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete {deleteModal.categoryTitle}?</p>
            <div className="modal-buttons">
              <button onClick={confirmDelete} className="confirm-btn">
                Delete
              </button>
              <button onClick={cancelDelete} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
