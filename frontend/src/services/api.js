import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000",
    headers: {"Content-Type": "application/json" },
});
// CRUD for /api/actions/
export const getActions = () => api.get("/api/actions/").then(r => r.data);

export const createAction = (data) =>
    api.post("/api/actions/", data).then(r => r.data);

export const updateAction = (id, data) => 
    api.patch(`/api/actions/${id}/`, data).then(r => r.data);

export const deleteAction = (id) =>
    api.delete(`/api/actions/${id}/`).then(r => r.status === 204);

export default api;