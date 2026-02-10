import React from "react";

export default function Spinner({ size = 24 }) {
  const style = {
    width: size,
    height: size,
    border: `${Math.max(2, Math.round(size / 8))}px solid #ccc`,
    borderTop: `${Math.max(2, Math.round(size / 8))}px solid #007bff`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  return (
    <div style={{ display: "inline-block", verticalAlign: "middle" }}>
      <div style={style} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
