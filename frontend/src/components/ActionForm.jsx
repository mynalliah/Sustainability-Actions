// Renders the "Add Action" form and  "Refresh List" button.
// - `onCreate(payload)` is called to create a new action via the parent.
// - `onRefresh()` is optionally called to re-fetch the latest actions from the backend
//   (useful if the JSON file changed on the server and you want to pull without reloading the page).
import { useState } from "react";

export default function ActionForm({ onCreate }) {
  // Local form state for controlled inputs
  const [form, setForm] = useState({ action: "", date: "", points: "" });
  // UI state: submitting flag + error message
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Keep inputs in sync with state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Submit handler -> validate -> call parent `onCreate` -> reset form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        action: form.action.trim(),
        date: form.date,
        points: Number(form.points),
      };

      // Minimal client-side validation (server/serializer will also validate)
      if (!payload.action) throw new Error("Action is required.");
      if (!payload.date) throw new Error("Date is required.");
      if (Number.isNaN(payload.points)) throw new Error("Points must be a number.");

      await onCreate(payload);
      setForm({ action: "", date: "", points: "" });
    } catch (err) {
      setError(err?.response?.data || err.message || "Failed to create action.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Inline styles to guarantee alignment ----
  const formGrid = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",  // Action wide | Date | Points
    gap: "12px 16px",
    alignItems: "end",                    // align input bottoms
    maxWidth: 900,
  };
  const field = { display: "flex", flexDirection: "column" };
  const label = { display: "block", marginBottom: 6, fontWeight: 600 };
  const input = { width: "100%" };
  const errorStyle = { gridColumn: "1 / -1", color: "crimson", fontSize: "0.9rem" };
  const submitBtn = { gridColumn: "1 / -1", padding: "8px 12px", borderRadius: 6 };

  return (
    <form style={formGrid} onSubmit={handleSubmit}>
      <div style={field}>
        <label htmlFor="action" style={label}>Action</label>
        <input
          id="action"
          name="action"
          value={form.action}
          onChange={handleChange}
          placeholder="Recycling"
          required
          style={input}
        />
      </div>

      <div style={field}>
        <label htmlFor="date" style={label}>Date</label>
        <input
          id="date"
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          style={input}
        />
      </div>

      <div style={field}>
        <label htmlFor="points" style={label}>Points</label>
        <input
          id="points"
          type="number"
          name="points"
          value={form.points}
          onChange={handleChange}
          min={0}
          required
          style={input}
        />
      </div>

      {error ? <div style={errorStyle}>{String(error)}</div> : null}

      <button type="submit" style={submitBtn} disabled={submitting}>
        {submitting ? "Adding..." : "Add Action"}
      </button>
    </form>
  );
}
