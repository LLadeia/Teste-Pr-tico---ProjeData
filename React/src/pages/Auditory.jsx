import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Auditory() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAuditory();
  }, [filter]);

  const fetchAuditory = async () => {
    setLoading(true);
    try {
      let url = "/auditory/";
      if (filter !== "all") {
        url += `?model=${filter}`;
      }
      const response = await api.get(url);
      setChanges(response.data);
    } catch (error) {
      console.error("Erro ao buscar auditoria:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case "+":
        return "➕";
      case "~":
        return "✏️";
      case "-":
        return "🗑️";
      default:
        return "📝";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🔍 Auditoria do Sistema</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Visualize todas as alterações realizadas pelos usuários
      </p>

      {/* Filtros */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "8px 15px",
            backgroundColor: filter === "all" ? "#007bff" : "#ddd",
            color: filter === "all" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Todas as Alterações
        </button>
        <button
          onClick={() => setFilter("Product")}
          style={{
            padding: "8px 15px",
            backgroundColor: filter === "Product" ? "#007bff" : "#ddd",
            color: filter === "Product" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Produtos
        </button>
        <button
          onClick={() => setFilter("RawMaterial")}
          style={{
            padding: "8px 15px",
            backgroundColor: filter === "RawMaterial" ? "#007bff" : "#ddd",
            color: filter === "RawMaterial" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Matérias-Primas
        </button>
        <button
          onClick={() => setFilter("ProductRawMaterial")}
          style={{
            padding: "8px 15px",
            backgroundColor: filter === "ProductRawMaterial" ? "#007bff" : "#ddd",
            color: filter === "ProductRawMaterial" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Relações
        </button>
      </div>

      {/* Lista de Alterações */}
      {loading ? (
        <p>Carregando...</p>
      ) : changes.length === 0 ? (
        <p style={{ color: "#999" }}>Nenhuma alteração encontrada</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {changes.map((change) => (
            <div
              key={`${change.model}-${change.id}`}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>
                  {getChangeIcon(change.change_reason[0])}
                </span>
                <div>
                  <strong>{change.object_str}</strong>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {change.change_reason === "+" && "Criado"}
                    {change.change_reason === "~" && "Alterado"}
                    {change.change_reason === "-" && "Deletado"}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "10px" }}>
                <div>
                  <strong>👤 Quem alterou:</strong>
                  <p style={{ margin: "5px 0", color: "#333" }}>{change.changed_by}</p>
                </div>
                <div>
                  <strong>⏰ Quando:</strong>
                  <p style={{ margin: "5px 0", color: "#333" }}>
                    {formatDate(change.changed_at)}
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px" }}>
                <strong>📋 Valores Alterados:</strong>
                <pre
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "12px",
                    color: "#555",
                    overflow: "auto"
                  }}
                >
                  {JSON.stringify(change.changes, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
