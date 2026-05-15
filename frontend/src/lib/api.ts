import axios from "axios";

// Em dev, usa o proxy do Vite (/api → :3333).
// Em produção, lê VITE_API_URL definido no Vercel (ex.: https://processmap-api.onrender.com).
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Erro de comunicação com a API";
    err.userMessage = msg;
    return Promise.reject(err);
  }
);
