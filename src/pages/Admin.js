import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAllAdmins,
  getAllUsers,
  makeUserAdmin,
  removeAdminRole,
  deleteUser,
} from "../services/admin";
import { getCurrentUser } from "../services/user_service";
import "./Admin.css";

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("admins");

  useEffect(() => {
    document.body.classList.add("admin-page");
    return () => {
      document.body.classList.remove("admin-page");
    };
  }, []);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Check if user is admin
      const hasAdminRole = user?.roles?.some(
        (role) => role.name === "ROLE_ADMIN" || role.name === "ADMIN"
      );

      if (!hasAdminRole) {
        setError("Access denied. Admin privileges required.");
        return;
      }

      // Load data
      await Promise.all([fetchAdmins(), fetchUsers()]);
    } catch (error) {
      console.error("Error initializing admin data:", error);
      setError(error.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const adminData = await getAllAdmins();
      setAdmins(adminData);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to load admins");
    }
  };

  const fetchUsers = async () => {
    try {
      const userData = await getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (window.confirm("Are you sure you want to make this user an admin?")) {
      try {
        await makeUserAdmin(userId);
        toast.success("User promoted to admin successfully!");
        await Promise.all([fetchAdmins(), fetchUsers()]);
      } catch (error) {
        console.error("Error making user admin:", error);
        toast.error(error.message || "Failed to make user admin");
      }
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (currentUser?.id === userId) {
      toast.error("You cannot remove your own admin role!");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to remove admin role from this user?"
      )
    ) {
      try {
        await removeAdminRole(userId);
        toast.success("Admin role removed successfully!");
        await Promise.all([fetchAdmins(), fetchUsers()]);
      } catch (error) {
        console.error("Error removing admin role:", error);
        toast.error(error.message || "Failed to remove admin role");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (currentUser?.id === userId) {
      toast.error("You cannot delete your own account!");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone!"
      )
    ) {
      try {
        await deleteUser(userId);
        toast.success("User deleted successfully!");
        await Promise.all([fetchAdmins(), fetchUsers()]);
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(error.message || "Failed to delete user");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserRole = (roles) => {
    if (!roles || roles.length === 0) return "User";
    return roles.map((role) => role.name.replace("ROLE_", "")).join(", ");
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">Loading admin panel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="admin-error">
          {error}
          <button onClick={initializeData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage users and administrators</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "admins" ? "active" : ""}`}
          onClick={() => setActiveTab("admins")}
        >
          Admins ({admins.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          All Users ({users.length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "admins" && (
          <div className="admin-section">
            <h2>Administrator Users</h2>
            {admins.length === 0 ? (
              <div className="no-data">No administrators found.</div>
            ) : (
              <div className="users-table">
                <div className="table-header">
                  <div className="header-cell">User</div>
                  <div className="header-cell">Email</div>
                  <div className="header-cell">Role</div>
                  <div className="header-cell">Joined</div>
                  <div className="header-cell">Actions</div>
                </div>
                {admins.map((admin) => (
                  <div key={admin.id} className="table-row">
                    <div className="table-cell">
                      <div className="user-info">
                        <div className="user-name">{admin.name}</div>
                        <div className="user-id">ID: {admin.id}</div>
                      </div>
                    </div>
                    <div className="table-cell">{admin.email}</div>
                    <div className="table-cell">
                      <span className="role-badge admin-role">
                        {getUserRole(admin.roles)}
                      </span>
                    </div>
                    <div className="table-cell">
                      {formatDate(admin.createdAt)}
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        {currentUser?.id !== admin.id && (
                          <button
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="action-btn remove-btn"
                            title="Remove Admin Role"
                          >
                            Remove Admin
                          </button>
                        )}
                        {currentUser?.id === admin.id && (
                          <span className="current-user-badge">You</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="admin-section">
            <h2>All Users</h2>
            {users.length === 0 ? (
              <div className="no-data">No users found.</div>
            ) : (
              <div className="users-table">
                <div className="table-header">
                  <div className="header-cell">User</div>
                  <div className="header-cell">Email</div>
                  <div className="header-cell">Role</div>
                  <div className="header-cell">Joined</div>
                  <div className="header-cell">Actions</div>
                </div>
                {users.map((user) => (
                  <div key={user.id} className="table-row">
                    <div className="table-cell">
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-id">ID: {user.id}</div>
                      </div>
                    </div>
                    <div className="table-cell">{user.email}</div>
                    <div className="table-cell">
                      <span
                        className={`role-badge ${
                          getUserRole(user.roles).includes("ADMIN")
                            ? "admin-role"
                            : "user-role"
                        }`}
                      >
                        {getUserRole(user.roles)}
                      </span>
                    </div>
                    <div className="table-cell">
                      {formatDate(user.createdAt)}
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        {currentUser?.id !== user.id && (
                          <>
                            {!getUserRole(user.roles).includes("ADMIN") ? (
                              <button
                                onClick={() => handleMakeAdmin(user.id)}
                                className="action-btn make-admin-btn"
                                title="Make Admin"
                              >
                                Make Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemoveAdmin(user.id)}
                                className="action-btn remove-btn"
                                title="Remove Admin"
                              >
                                Remove Admin
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="action-btn delete-btn"
                              title="Delete User"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {currentUser?.id === user.id && (
                          <span className="current-user-badge">You</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
