import { useEffect, useState } from "react";
import api from '/src/api/api.js';



export default function Production() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Buscar produtos
  useEffect(() => {
    api.get("products/")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  // 🔹 Verificar se pode produzir
  const checkCanProduce = async (productId) => {
    setLoading(true);
    try {
      const res = await api.get(`products/${productId}/can_produce/`);
      setStatus(res.data);
    } catch (err) {
      alert("Erro ao verificar produção");
    }
    setLoading(false);
  };

  // 🔹 Produzir
  const produce = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const res = await api.post(
        `products/${selectedProduct}/produce/`,
        { quantity }
      );
      alert(`Produzido com sucesso: ${res.data.quantity_produced}`);
    } catch (err) {
      alert("Estoque insuficiente");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🏭 Produção</h1>

      <select
        onChange={(e) => {
          setSelectedProduct(e.target.value);
          checkCanProduce(e.target.value);
        }}
      >
        <option>Selecione um produto</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <br /><br />

      {status && (
        <div>
          {status.can_produce ? (
            <p style={{ color: "green" }}>✅ Pode produzir</p>
          ) : (
            <p style={{ color: "red" }}>
              ❌ Falta: {status.limiting_raw_material}
            </p>
          )}
        </div>
      )}

      <br />

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
      />

      <br /><br />

      <button
        onClick={produce}
        disabled={loading || !status?.can_produce}
      >
        Produzir
      </button>
    </div>
  );
}
