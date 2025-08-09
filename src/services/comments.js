import { myAxios } from "./helper";

// Main comments service function with switch case
export const commentsService = async (
  action,
  data = null,
  id = null,
  additionalParams = {}
) => {
  try {
    let response;

    switch (action) {
      case "GET_ALL":
        response = await myAxios.get(`/api/comments`);
        return response.data;

      case "GET_BY_POST_ID":
        if (!id) throw new Error("Post ID is required for GET_BY_POST_ID");
        response = await myAxios.get(`/api/comments/post/${id}`);
        return response.data;

      case "CREATE":
        if (!data) throw new Error("Data is required for CREATE");
        if (!additionalParams.postId)
          throw new Error("postId is required for CREATE");
        response = await myAxios.post(
          `/api/comments/post/${additionalParams.postId}/comments`,
          data
        );
        return response.data;

      case "UPDATE":
        if (!id) throw new Error("ID is required for UPDATE");
        if (!data) throw new Error("Data is required for UPDATE");
        response = await myAxios.put(`/api/comments/${id}`, data);
        return response.data;

      case "DELETE":
        if (!id) throw new Error("ID is required for DELETE");
        response = await myAxios.delete(`/api/comments/${id}`);
        return response.data;

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in commentsService (${action}):`, error);
    throw error;
  }
};

// Convenience functions using the switch case service
export const getAllComments = async () => {
  return await commentsService("GET_ALL");
};

export const getCommentsByPostId = async (postId) => {
  return await commentsService("GET_BY_POST_ID", null, postId);
};

export const createComment = async (commentData, postId) => {
  return await commentsService("CREATE", commentData, null, { postId });
};

export const updateComment = async (commentId, commentData) => {
  return await commentsService("UPDATE", commentData, commentId);
};

export const deleteComment = async (commentId) => {
  return await commentsService("DELETE", null, commentId);
};
