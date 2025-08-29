import { useState } from "react";

export default function ActionForm({ onCreate }) {
    const [form, setForm] = useState({ action: "", date: "", points: ""});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm(f => ({ ...f, [name]: value}));
    };
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
            if (!payload.action) throw new Error("Action is required.");
            if (!payload.date) throw new Error("Date is required.");
            if (Number.isNaN(payload.points)) throw new Error("Points must be a number.");
            await onCreate(payload);
            setForm({ action: "", date: "", points: ""});
        } catch (err) {
            setError(err?.response?.data || err.message || "Failed to create action.");
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{ display:"grid", gap:12, maxWidth:520 }}>
          <div>
          <label htmlFor="action">Action</label><br />
            <input
            id="action"
            name="action"
            value={form.action}
            onChange={handleChange}
            placeholder="Recycling"
            required
            />

            <label htmlFor="date">Date</label><br />
            <input
            id="date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            />

            <label htmlFor="points">Points</label><br />
            <input
            id="points"
            type="number"
            name="points"
            value={form.points}
            onChange={handleChange}
            min={0}
            required
            />
          </div>
          {error ? <div style={{ color:"crimson" }}>{String(error)}</div> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Action"}
          </button>
        </form>
      );
    }