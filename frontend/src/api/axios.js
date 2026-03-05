import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// 🔹 Enviar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔹 Manejar token vencido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      localStorage.getItem("token")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;