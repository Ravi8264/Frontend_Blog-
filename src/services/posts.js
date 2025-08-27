import { myAxios } from "./helper";

// Main posts service function with switch case
export const postsService = async (
  action,
  data = null,
  id = null,
  additionalParams = {}
) => {
  try {
    let response;

    switch (action) {
      case "GET_ALL":
        const {
          pageNumber = 0,
          pageSize = 10,
          sortBy = "id",
          sortDir = "asc",
        } = additionalParams;

        // For public endpoints, we can make the request without authentication
        response = await myAxios.get(`/api/posts`, {
          params: { pageNumber, pageSize, sortBy, sortDir },
        });
        return response.data;

      case "GET_BY_ID":
        if (!id) throw new Error("ID is required for GET_BY_ID");
        response = await myAxios.get(`/api/posts/${id}`);
        return response.data;

      case "CREATE":
        if (!data) throw new Error("Data is required for CREATE");
        if (!additionalParams.userId)
          throw new Error("userId is required for CREATE");
        if (!additionalParams.categoryId)
          throw new Error("categoryId is required for CREATE");
        response = await myAxios.post(
          `/api/user/${additionalParams.userId}/category/${additionalParams.categoryId}/posts`,
          data
        );
        return response.data;

      case "UPDATE":
        if (!id) throw new Error("ID is required for UPDATE");
        if (!data) throw new Error("Data is required for UPDATE");

        response = await myAxios.put(`/api/posts/${id}`, data);
        return response.data;

      case "DELETE":
        if (!id) throw new Error("ID is required for DELETE");

        response = await myAxios.delete(`/api/posts/${id}`);
        return response.data;

      case "GET_BY_CATEGORY":
        if (!id) throw new Error("Category ID is required for GET_BY_CATEGORY");
        response = await myAxios.get(`/api/category/${id}/posts`);
        return response.data;

      case "GET_BY_USER":
        if (!id) throw new Error("User ID is required for GET_BY_USER");
        response = await myAxios.get(`/api/user/${id}/posts`);
        return response.data;

      case "SEARCH":
        if (!additionalParams.keyword)
          throw new Error("Keyword is required for SEARCH");

        // Encode the keyword to handle special characters
        const encodedKeyword = encodeURIComponent(
          additionalParams.keyword.trim()
        );

        response = await myAxios.get(`/api/posts/search/${encodedKeyword}`);
        return response.data;

      case "UPLOAD_IMAGE":
        if (!id) throw new Error("Post ID is required for UPLOAD_IMAGE");
        if (!data) throw new Error("Image file is required for UPLOAD_IMAGE");
        const formData = new FormData();
        formData.append("image", data);
        response = await myAxios.post(
          `/api/post/image/upload/${id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data;

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    // Handle authentication errors specifically
    if (error.response?.status === 401 || error.response?.status === 403) {
      // For public endpoints like GET_ALL, GET_BY_ID, SEARCH, GET_BY_CATEGORY
      // we should not throw auth errors, just return empty results
      if (
        action === "GET_ALL" ||
        action === "GET_BY_ID" ||
        action === "SEARCH" ||
        action === "GET_BY_CATEGORY"
      ) {
        return {
          content: [],
          totalPages: 0,
          totalElements: 0,
          lastPage: true,
          firstPage: true,
        };
      }

      // For DELETE operations, provide specific error messages
      if (action === "DELETE") {
        if (error.response?.status === 403) {
          throw new Error(
            "You don't have permission to delete this post. Only the post author or admin can delete posts."
          );
        } else {
          throw new Error("Authentication failed. Please login again.");
        }
      }

      throw new Error("Authentication failed. Please login again.");
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

// Convenience functions using the switch case service
export const getAllPosts = async (
  pageNumber = 0,
  pageSize = 10,
  sortBy = "id",
  sortDir = "asc"
) => {
  return await postsService("GET_ALL", null, null, {
    pageNumber,
    pageSize,
    sortBy,
    sortDir,
  });
};

export const getPostById = async (postId) => {
  return await postsService("GET_BY_ID", null, postId);
};

export const createPost = async (postData, userId, categoryId) => {
  return await postsService("CREATE", postData, null, { userId, categoryId });
};

export const updatePost = async (postId, postData) => {
  return await postsService("UPDATE", postData, postId);
};

export const deletePost = async (postId) => {
  return await postsService("DELETE", null, postId);
};

export const getPostsByCategory = async (categoryId) => {
  return await postsService("GET_BY_CATEGORY", null, categoryId);
};

export const getPostsByUser = async (userId) => {
  return await postsService("GET_BY_USER", null, userId);
};

export const searchPosts = async (keyword) => {
  return await postsService("SEARCH", null, null, { keyword });
};

export const uploadPostImage = async (postId, imageFile) => {
  return await postsService("UPLOAD_IMAGE", imageFile, postId);
};
