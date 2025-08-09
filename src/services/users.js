import { myAxios } from "./helper";

// Main users service function with switch case
export const usersService = async (action, data = null, id = null) => {
  try {
    let response;

    switch (action) {
      case "GET_ALL":
        response = await myAxios.get("/api/users/");
        return response.data;

      case "GET_BY_ID":
        if (!id) throw new Error("ID is required for GET_BY_ID");
        response = await myAxios.get(`/api/users/${id}`);
        return response.data;

      case "CREATE":
        if (!data) throw new Error("Data is required for CREATE");
        response = await myAxios.post("/api/users/", data);
        return response.data;

      case "UPDATE":
        if (!id) throw new Error("ID is required for UPDATE");
        if (!data) throw new Error("Data is required for UPDATE");
        response = await myAxios.put(`/api/users/${id}`, data);
        return response.data;

      case "DELETE":
        if (!id) throw new Error("ID is required for DELETE");
        response = await myAxios.delete(`/api/users/${id}`);
        return response.data;

      case "GET_USER_POSTS":
        if (!id) throw new Error("User ID is required for GET_USER_POSTS");
        response = await myAxios.get(`/api/user/${id}/posts`);
        return response.data;

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in usersService (${action}):`, error);
    throw error;
  }
};

// Convenience functions using the switch case service
export const getAllUsers = async () => {
  return await usersService("GET_ALL");
};

export const getUserById = async (id) => {
  return await usersService("GET_BY_ID", null, id);
};

export const createUser = async (userData) => {
  return await usersService("CREATE", userData);
};

export const updateUser = async (id, userData) => {
  return await usersService("UPDATE", userData, id);
};

export const deleteUser = async (id) => {
  return await usersService("DELETE", null, id);
};

export const getUserPosts = async (userId) => {
  return await usersService("GET_USER_POSTS", null, userId);
};
