import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Navbar from "./component/Navbar/Navbar";
import Footer from "./component/Footer/Footer";
import PrivateRoute from "./component/privateroute";
import { initAuth } from "./services/user_service";
import ProfileInfo from "./pages/ProfileInfo";
import Addpost from "./pages/Addpost";
import EditPost from "./pages/EditPost";
import Posts from "./pages/Posts";
import CategoryManagement from "./pages/CategoryManagement";
import { AuthProvider } from "./context/AuthContext";

function App() {
  useEffect(() => {
    // Initialize authentication on app load
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />

          {/* Public Routes */}
          <Route path="/posts" element={<Posts />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profileinfo" element={<ProfileInfo />} />
            <Route path="/addpost" element={<Addpost />} />
            <Route path="/edit-post/:postId" element={<EditPost />} />
            <Route path="/categories" element={<CategoryManagement />} />
          </Route>
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
