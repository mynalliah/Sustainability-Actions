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
import ActionForm from "./components/ActionForm";
import ActionTable from "./components/ActionTable";

export default function App() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (payload) => {
    const created = await createAction(payload);
    setActions((prev) => [...prev, created]);
  };

  const handleUpdate = async (id, payload) => {
    const updated = await updateAction(id, payload);
    setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const handleDelete = async (id) => {
    const ok = await deleteAction(id);
    if (ok) setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const totalPoints = actions.reduce(
    (sum, a) => sum + (Number.isFinite(+a.points) ? +a.points : 0),
    0
  );

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <header style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <h1 style={{ margin: 0 }}>Sustainability Actions</h1>
        <span style={{ color: "#555" }}>
          {actions.length} item{actions.length === 1 ? "" : "s"} • Total points:{" "}
          <strong>{totalPoints}</strong>
        </span>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={load}
            title="Fetch the latest data from the server"
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" }}
          >
            Refresh
          </button>
        </div>
      </header>

      <section style={{ marginTop: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Add Action</h2>
        {/* Pass load() so ActionForm's "Refresh List" button works */}
        <ActionForm onCreate={handleCreate} onRefresh={load} />
      </section>

      <section>
        <h2 style={{ marginTop: 0 }}>Actions</h2>
        {loading ? <div>Loading…</div> : null}
        {error ? <div style={{ color: "crimson" }}>{error}</div> : null}
        <ActionTable
          items={actions}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
}
