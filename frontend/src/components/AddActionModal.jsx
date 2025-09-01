// wraps the add-action form inside the generic Modal
// shows Action / Date / Points fields with OK (Create) and Cancel.

import { useState } from "react";
import Modal from "./Modal";

export default function AddActionModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ action: "", date: "", points: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const reset = () => {
    setForm({ action: "", date: "", points: "" });
    setErr("");
  };

  const handleOk = async () => {
    setErr("");
    setBusy(true);
    try {
      const payload = {
        action: form.action.trim(),
        date: form.date,
        points: Number(form.points),
      };
      if (!payload.action) throw new Error("Action is required.");
      if (!payload.date) throw new Error("Date is required.");
      if (Number.isNaN(payload.points)) throw new Error("Points must be a number.");

      await onCreate(payload); // parent will update list
      reset();
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data || e.message || "Failed to create action.");
    } finally {
      setBusy(false);
    }
  };

  const footer = (
    <>
      <button type="button" onClick={onClose} className="btn btn-secondary" disabled={busy}>
        Cancel
      </button>
      <button type="button" onClick={handleOk} className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : "OK"}
      </button>
    </>
  );

  return (
    <Modal open={open} onClose={onClose} title="Add Action" footer={footer}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="action">Action</label>
          <input
            id="action"
            name="action"
            value={form.action}
            onChange={onChange}
            placeholder="Recycling"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="points">Points</label>
          <input
            id="points"
            type="number"
            name="points"
            min={0}
            value={form.points}
            onChange={onChange}
            required
          />
        </div>

        {err ? <div className="form-error">{String(err)}</div> : null}
      </div>
    </Modal>
  );
}
