const axios = require("axios");

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Your HTTP backend URL
    const backendUrl =
      "http://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com";

    // Extract the path from the request
    const path = event.path.replace("/.netlify/functions/api-proxy", "");
    const fullUrl = `${backendUrl}${path}`;

    console.log("Proxying request to:", fullUrl);

    // Forward the request to your HTTP backend
    const response = await axios({
      method: event.httpMethod,
      url: fullUrl,
      headers: {
        "Content-Type": event.headers["content-type"] || "application/json",
        Authorization: event.headers.authorization || "",
        ...event.headers,
      },
      data: event.body,
      params: event.queryStringParameters,
      timeout: 15000,
    });

    console.log("Backend response status:", response.status);

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        "Content-Type": response.headers["content-type"] || "application/json",
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Proxy error:", error.message);

    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || "Internal server error",
      }),
    };
  }
};
