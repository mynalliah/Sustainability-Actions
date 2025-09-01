import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  // close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayMouseDown = (e) => {
    // only close if the click is on the overlay
    if (e.target.classList.contains("modal-overlay")) onClose?.();
  };

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <h3 id="modal-title" style={{ margin: 0 }}>{title}</h3>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
