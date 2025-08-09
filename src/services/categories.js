import { myAxios } from "./helper";

// Main categories service function with switch case
export const categoriesService = async (action, data = null, id = null) => {
  try {
    let response;

    switch (action) {
      case "GET_ALL":
        response = await myAxios.get("/api/categories/");
        return response.data;

      case "GET_BY_ID":
        if (!id) throw new Error("ID is required for GET_BY_ID");
        response = await myAxios.get(`/api/categories/${id}`);
        return response.data;

      case "CREATE":
        if (!data) throw new Error("Data is required for CREATE");
        response = await myAxios.post("/api/categories/", data);
        return response.data;

      case "UPDATE":
        if (!id) throw new Error("ID is required for UPDATE");
        if (!data) throw new Error("Data is required for UPDATE");
        response = await myAxios.put(`/api/categories/${id}`, data);
        return response.data;

      case "DELETE":
        if (!id) throw new Error("ID is required for DELETE");
        response = await myAxios.delete(`/api/categories/${id}`);
        return response.data;

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in categoriesService (${action}):`, error);
    throw error;
  }
};

// Convenience functions using the switch case service
export const getCategories = async () => {
  return await categoriesService("GET_ALL");
};

export const getCategoryById = async (id) => {
  return await categoriesService("GET_BY_ID", null, id);
};

export const createCategory = async (categoryData) => {
  return await categoriesService("CREATE", categoryData);
};

export const updateCategory = async (id, categoryData) => {
  return await categoriesService("UPDATE", categoryData, id);
};

export const deleteCategory = async (id) => {
  return await categoriesService("DELETE", null, id);
};
