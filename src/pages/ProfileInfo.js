import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../services/user_service";
import { useAuth } from "../context/AuthContext";
import "./ProfileInfo.css";

function ProfileInfo() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        console.log("User profile data:", userData);
        setUserProfile(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading Profile...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="no-profile-container">
        <h2>No Profile Data</h2>
        <p>Unable to load profile information.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="profile-title">User Profile</h1>
          <p className="profile-subtitle">Your account information</p>
        </div>

        <div>
          <div className="profile-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="profile-info-item">
              <strong className="profile-info-label">User ID:</strong>{" "}
              {userProfile.id}
            </div>
            <div className="profile-info-item">
              <strong className="profile-info-label">Name:</strong>{" "}
              {userProfile.name || "Ravi Shankar Kumar"}
            </div>
            <div className="profile-info-item">
              <strong className="profile-info-label">Email:</strong>{" "}
              {userProfile.email || "ravicse19.23@gmail.com"}
            </div>
            <div className="profile-info-item">
              <strong className="profile-info-label">Phone:</strong>{" "}
              {userProfile.phone || "8709931070"}
            </div>
            <div className="profile-info-item">
              <strong className="profile-info-label">About:</strong>{" "}
              {userProfile.about ||
                "Contact: 8709931070 | Email: ravicse19.23@gmail.com"}
            </div>
          </div>

          <div className="roles-status-container">
            <div className="roles-section">
              <h3 className="section-title">Roles</h3>
              <div>
                {userProfile.roles && userProfile.roles.length > 0 ? (
                  userProfile.roles.map((role, index) => (
                    <span key={role.id} className="role-badge">
                      {role.name}
                    </span>
                  ))
                ) : (
                  <p className="no-roles">No roles assigned</p>
                )}
              </div>
            </div>

            <div className="status-section">
              <h3 className="section-title">Account Status</h3>
              <div className="profile-info-item">
                <strong className="profile-info-label">Status:</strong>{" "}
                <span className="status-active">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfo;
