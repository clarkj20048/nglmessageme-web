const PROD_API_BASE_URL = "https://nglmessageme-backend.onrender.com";
const DEV_API_BASE_URL = "http://localhost:5000";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? DEV_API_BASE_URL : PROD_API_BASE_URL)
).replace(/\/+$/, "");

export default API_BASE_URL;
