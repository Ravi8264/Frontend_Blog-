// Direct HTTP calls to backend - same for all environments
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com/api";

export { API_BASE_URL };
