import { useEffect, useState } from "react";
import { getActions, createAction, updateAction, deleteAction } from "./services/api";
import ActionForm from "./components/ActionForm";
import ActionTable from "./components/ActionTable";

function App() {
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

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    const created = await createAction(payload);
    setActions(prev => [...prev, created]);
  };

  const handleUpdate = async (id, payload) => {
    const updated = await updateAction(id, payload);
    setActions(prev => prev.map(a => (a.id === id ? updated : a)));
  };

  const handleDelete = async (id) => {
    const ok = await deleteAction(id);
    if (ok) setActions(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ padding:24, fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1>Sustainability Actions</h1>

      <section style={{ marginBottom:24 }}>
        <h2>Add Action</h2>
        <ActionForm onCreate={handleCreate} />
      </section>

      <section>
        <h2>Actions</h2>
        {loading ? <div>Loading…</div> : null}
        {error ? <div style={{ color:"crimson" }}>{error}</div> : null}
        <ActionTable items={actions} onUpdate={handleUpdate} onDelete={handleDelete} />
      </section>
    </div>
  );
}

export default App;
