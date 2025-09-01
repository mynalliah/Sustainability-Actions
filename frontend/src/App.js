// Top-level React component for the Sustainability Actions app.
// Responsibilities:
//  - Fetch the list of actions from the backend (via services/api).
//  - Handle create / update / delete operations and keep local state in sync.
//  - Provide a manual "Refresh" button so users can re-fetch the latest data
//    without reloading the page.
//  - Show basic loading/error UI and a simple total points summary.

import { useEffect, useState } from "react";
import {
  getActions,
  createAction,
  updateAction,
  deleteAction,
} from "./services/api";
import ActionTable from "./components/ActionTable";
import AddActionModal from "./components/AddActionModal";

export default function App() {
  // Local UI state

  // Load list of actions
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Data loading 

  /**
   * Fetch the latest actions from the backend and populate local state.
   */
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getActions();
      setActions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load actions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); 

  // CRUD handlers 

  /**
   * Create a new action via API, then append it to local state.
   */
  const handleCreate = async (payload) => {
    const created = await createAction(payload);
    setActions((prev) => [...prev, created]);
  };

  /**
   * Update an existing action; replace it in local state using the server response.
   */
  const handleUpdate = async (id, payload) => {
    const updated = await updateAction(id, payload);
    setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  /**
   * Delete an action by id; remove it from local state when API confirms success.
   */
  const handleDelete = async (id) => {
    const ok = await deleteAction(id);
    if (ok) setActions((prev) => prev.filter((a) => a.id !== id));
  };

  // Derived values 

  // Compute the total points across all actions; 
  const totalPoints = actions.reduce(
    (sum, a) => sum + (Number.isFinite(+a.points) ? +a.points : 0),
    0
  );

  // Render 

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      {/* Page header with a small summary and primary actions */}
      <header style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <h1 style={{ margin: 0 }}>Sustainability Actions</h1>

        {/* Simple summary: item count + total points */}
        <span style={{ color: "#555" }}>
          {actions.length} item{actions.length === 1 ? "" : "s"} • Total points:{" "}
          <strong>{totalPoints}</strong>
        </span>

        {/* Right-aligned actions */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn btn-primary"
            title="Add a new action"
          >
            Add Action
          </button>
          <button
            onClick={load}
            className="btn btn-secondary"
            title="Fetch the latest data from the server"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Table + loading/error indicators */}
      <section style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Actions</h2>

        {/* Basic async states */}
        {loading ? <div>Loading…</div> : null}
        {error ? <div style={{ color: "crimson" }}>{error}</div> : null}

        {/* Data table */}
        <ActionTable
          items={actions}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </section>

      {/* Add Action Modal: shown when user clicks "Add Action". */}
      <AddActionModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}