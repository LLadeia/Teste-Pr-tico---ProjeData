import React from "react";

export default function ModalForm({ title, children, onClose, visible }) {
  if (!visible) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, minWidth: 320, maxWidth: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} aria-label="close">✖</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
