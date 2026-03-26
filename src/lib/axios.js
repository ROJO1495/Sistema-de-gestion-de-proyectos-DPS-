import axios from "axios";

// Configuracion base del cliente HTTP
const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;