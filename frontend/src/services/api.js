/**
 * Lightweight API client for the Sustainability Actions backend.
 * - Uses a single preconfigured Axios instance (JSON in/out).
 */

import axios from "axios";

/**
 * Create a shared Axios instance:
 * - `baseURL` comes from the frontend env (.env.local)
 * - Default header ensures requests are sent as JSON.
 */
const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000",
    headers: {"Content-Type": "application/json" },
});

/**
 * GET /api/actions/
 * Fetch all actions.
 *
 * @returns {Promise<Array>} Resolves to an array of action objects.
 */
export const getActions = () => api.get("/api/actions/").then(r => r.data);

/**
 * POST /api/actions/
 * Create a new action.
 *
 * @param {{ action: string, date: string, points: number }} data
 *   - action: description (<= 255 chars)
 *   - date: "YYYY-MM-DD"
 *   - points: non-negative integer
 * @returns {Promise<Object>} Resolves to the created action (with server-assigned `id`).
 */

export const createAction = (data) =>
    api.post("/api/actions/", data).then(r => r.data);

/**
 * PATCH /api/actions/:id/
 * Partially update an existing action (use PUT for full replacement).
 *
 * @param {number} id - The action's id.
 * @param {Partial<{ action: string, date: string, points: number }>} data
 *   Only include fields you want to update.
 * @returns {Promise<Object>} Resolves to the updated action.
 */
export const updateAction = (id, data) => 
    api.patch(`/api/actions/${id}/`, data).then(r => r.data);

/**
 * DELETE /api/actions/:id/
 * Delete an action by id.
 *
 * @param {number} id - The action's id.
 * @returns {Promise<boolean>} Resolves to `true` if deletion succeeded (204 No Content).
 */
export const deleteAction = (id) =>
    api.delete(`/api/actions/${id}/`).then(r => r.status === 204);

/**
 * Export the raw Axios instance too, in case you need
 * to add interceptors (auth, logging) or make ad-hoc requests.
 */
export default api;