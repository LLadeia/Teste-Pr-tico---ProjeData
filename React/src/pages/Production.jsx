import { useEffect, useState } from "react";
import api from '/src/api/api.js';
import Spinner from '/src/components/Spinner.jsx';

export default function Production() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [productions, setProductions] = useState([]);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [pRes, prodRes] = await Promise.all([
        api.get("products/"),
        api.get("production-logs/")
      ]);
      setProducts(pRes.data);
      setProductions(prodRes.data);
    } catch (err) {
      pushToast("error", "Erro ao carregar dados");
      console.error(err);
    }
    setLoading(false);
  };

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const checkCanProduce = async (productId) => {
    setLoading(true);
    try {
      const res = await api.get(`products/${productId}/can_produce/`);
      setStatus(res.data);
    } catch (err) {
      pushToast("error", "Erro ao verificar estoque");
      setStatus(null);
    }
    setLoading(false);
  };

  const produce = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const res = await api.post(
        `products/${selectedProduct}/produce/`,
        { quantity }
      );
      pushToast("success", `✅ Produzido com sucesso! ${quantity}x`);
      setSelectedProduct(null);
      setQuantity(1);
      setStatus(null);
      await loadInitial();
    } catch (err) {
      const msg = err.response?.data?.raw_material 
        ? `❌ Sem estoque: ${err.response.data.raw_material}`
        : "Estoque insuficiente";
      pushToast("error", msg);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🏭 Produção</h1>

      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ marginBottom: 8, padding: 10, borderRadius: 6, background: t.type === "success" ? "#d4edda" : "#f8d7da", color: t.type === "success" ? "#155724" : "#721c24", fontSize: 14 }}>
            {t.message}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 30 }}>
        <section style={{ flex: 1 }}>
          <h3>📋 Histórico de Produções</h3>
          {loading ? <Spinner /> : (
            <div style={{ overflowY: "auto", maxHeight: 500 }}>
              {productions.length === 0 ? (
                <p style={{ color: "#999" }}>Nenhuma produção registrada</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 8 }}>Produto</th>
                      <th style={{ textAlign: "center", padding: 8 }}>Quantidade</th>
                      <th style={{ textAlign: "left", padding: 8 }}>Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productions.map(p => (
                      <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                        <td style={{ padding: 8 }}>{p.product_name}</td>
                        <td style={{ textAlign: "center", padding: 8 }}>x{p.quantity}</td>
                        <td style={{ padding: 8, fontSize: 12, color: "#666" }}>{formatDate(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>

        <aside style={{ width: 380 }}>
          <h3>🔧 Produzir Agora</h3>
          <div style={{ display: "grid", gap: 16, padding: 16, background: "#f9f9f9", borderRadius: 8 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Produto</label>
              <select
                value={selectedProduct || ""}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  checkCanProduce(e.target.value);
                }}
                style={{ width: "100%", padding: 10, borderRadius: 4 }}
              >
                <option value="">Selecione um produto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {loading && (
              <div style={{ color: "#007bff", display: "flex", alignItems: "center", gap: 8 }}>
                <Spinner size={20} /> Verificando estoque...
              </div>
            )}

            {status && !loading && (
              <div style={{ padding: 12, borderRadius: 6, background: status.can_produce ? "#e8f5e9" : "#ffebee" }}>
                {status.can_produce ? (
                  <p style={{ color: "green", margin: 0 }}>✅ Pode produzir</p>
                ) : (
                  <div style={{ color: "red", margin: 0 }}>
                    <p style={{ margin: "0 0 6px 0", fontWeight: "bold" }}>❌ Falta: {status.limiting_raw_material}</p>
                    <small>Necessário: {status.required} | Disponível: {status.available}</small>
                  </div>
                )}
              </div>
            )}

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Quantidade</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 4 }}
              />
            </div>

            <button
              onClick={produce}
              disabled={loading || !status?.can_produce}
              style={{ padding: 12, background: status?.can_produce ? "#007bff" : "#ccc", color: "#fff", border: "none", borderRadius: 4, cursor: status?.can_produce ? "pointer" : "not-allowed", fontSize: 14, fontWeight: "bold" }}
            >
              {loading ? <><Spinner size={16} /> Produzindo...</> : "Produzir Agora"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
