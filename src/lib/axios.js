import axios from "axios";

// Configuracion base del cliente HTTP
const api = axios.create({
  baseURL: "https://gestordeproyecto-database.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
