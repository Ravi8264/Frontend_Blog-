import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          <h3>Loading...</h3>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  return isLoggedIn ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default PrivateRoute;
