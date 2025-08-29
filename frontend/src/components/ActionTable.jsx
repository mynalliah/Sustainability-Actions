import { useState } from "react";

function Row({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    action: item.action,
    date: item.date,       
    points: item.points,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setBusy(true);
    setErr("");
    try {
      const payload = {
        action: draft.action.trim(),
        date: draft.date,
        points: Number(draft.points),
      };
      await onUpdate(item.id, payload);
      setEditing(false);
    } catch (e) {
      setErr(e?.response?.data || e.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr>
      <td>{item.id}</td>
      <td>
        {editing ? (
          <input
            value={draft.action}
            onChange={(e) => setDraft({ ...draft, action: e.target.value })}
          />
        ) : item.action}
      </td>
      <td>
        {editing ? (
          <input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          />
        ) : item.date}
      </td>
      <td>
        {editing ? (
          <input
            type="number"
            value={draft.points}
            onChange={(e) => setDraft({ ...draft, points: e.target.value })}
            min={0}
          />
        ) : item.points}
      </td>
      <td style={{ whiteSpace:"nowrap" }}>
        {editing ? (
          <>
            <button onClick={save} disabled={busy}>Save</button>{" "}
            <button onClick={() => { setEditing(false); setDraft(item); }} disabled={busy}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>{" "}
            <button onClick={() => onDelete(item.id)} style={{ color:"crimson" }}>Delete</button>
          </>
        )}
        <div style={{ color:"crimson", fontSize:12 }}>{err ? String(err) : ""}</div>
      </td>
    </tr>
  );
}

export default function ActionTable({ items, onUpdate, onDelete }) {
  return (
    <table border="1" cellPadding="8" cellSpacing="0" style={{ width:"100%", maxWidth:800 }}>
      <thead>
        <tr>
          <th>ID</th><th>Action</th><th>Date</th><th>Points</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr><td colSpan="5" style={{ textAlign:"center" }}>No actions yet</td></tr>
        ) : (
          items.map(a => (
            <Row key={a.id} item={a} onUpdate={onUpdate} onDelete={onDelete} />
          ))
        )}
      </tbody>
    </table>
  );
}
