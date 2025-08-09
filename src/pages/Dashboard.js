import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleAddPost = () => {
    navigate("/addpost");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "3rem",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        <h1 style={{ color: "#1f2937", marginBottom: "1rem" }}>
          Welcome to Dashboard
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
          You are successfully logged in! This is your protected dashboard area.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <p style={{ color: "#374151" }}>
            Your JWT token is stored in localStorage and will be automatically
            included in API requests.
          </p>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button
            onClick={handleAddPost}
            style={{
              background: "#3b82f6",
              color: "#ffffff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#2563eb";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#3b82f6";
            }}
          >
            Add Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
