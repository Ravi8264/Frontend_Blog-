import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home/Home";
import Auth from "./pages/auth/Auth";
import About from "./pages/about/About";
import Dashboard from "./pages/Dashboard";
import Navbar from "./component/Navbar/Navbar";
import Footer from "./component/Footer/Footer";
import PrivateRoute from "./component/privateroute";
import { initAuth } from "./services/user_service";
import ProfileInfo from "./pages/profileinfo/ProfileInfo";
import Addpost from "./pages/addpost/Addpost";
import Posts from "./pages/post/Posts";
import CategoryManagement from "./pages/categories/CategoryManagement";
import Admin from "./pages/admin/Admin";
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
          <Route path="/posts" element={<Posts />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profileinfo" element={<ProfileInfo />} />
            <Route path="/addpost" element={<Addpost />} />
            <Route path="/edit-post/:postId" element={<Addpost />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
