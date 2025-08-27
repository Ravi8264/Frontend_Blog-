import { myAxios } from "./helper";

// Admin service functions
export const adminService = async (action, data = null, id = null) => {
  try {
    let response;

    switch (action) {
      case "MAKE_ADMIN":
        if (!id) throw new Error("User ID is required for MAKE_ADMIN");
        response = await myAxios.post(`/api/admin/make-admin/${id}`);
        return response.data;

      case "REMOVE_ADMIN":
        if (!id) throw new Error("User ID is required for REMOVE_ADMIN");
        response = await myAxios.put(`/api/admin/remove-admin/${id}`);
        return response.data;

      case "GET_ADMIN":
        if (!id) throw new Error("Admin ID is required for GET_ADMIN");
        response = await myAxios.get(`/api/admin/get-admin/${id}`);
        return response.data;

      case "GET_ALL_ADMINS":
        response = await myAxios.get(`/api/admin/get-all-admins`);
        return response.data;

      case "GET_ALL_USERS":
        response = await myAxios.get(`/api/admin/users/all`);
        return response.data;

      case "UPDATE_USER":
        if (!id) throw new Error("User ID is required for UPDATE_USER");
        if (!data) throw new Error("User data is required for UPDATE_USER");
        response = await myAxios.put(`/api/admin/users/update/${id}`, data);
        return response.data;

      case "DELETE_USER":
        if (!id) throw new Error("User ID is required for DELETE_USER");
        response = await myAxios.delete(`/api/admin/users/delete/${id}`);
        return response.data;

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Access denied. Admin privileges required.");
    }

    // Handle network errors
    if (error.code === "NETWORK_ERROR" || !error.response) {
      throw new Error("Network error. Please check your connection.");
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    throw new Error(errorMessage);
  }
};

// Convenience functions
export const makeUserAdmin = async (userId) => {
  return await adminService("MAKE_ADMIN", null, userId);
};

export const removeAdminRole = async (userId) => {
  return await adminService("REMOVE_ADMIN", null, userId);
};

export const getAdmin = async (adminId) => {
  return await adminService("GET_ADMIN", null, adminId);
};

export const getAllAdmins = async () => {
  return await adminService("GET_ALL_ADMINS");
};

export const getAllUsers = async () => {
  return await adminService("GET_ALL_USERS");
};

export const updateUser = async (userId, userData) => {
  return await adminService("UPDATE_USER", userData, userId);
};

export const deleteUser = async (userId) => {
  return await adminService("DELETE_USER", null, userId);
};
