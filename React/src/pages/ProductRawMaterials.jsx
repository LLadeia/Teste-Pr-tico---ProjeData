import { useEffect, useState } from "react";
import api from "/src/api/api.js";
import Spinner from "/src/components/Spinner.jsx";
import ModalForm from "/src/components/ModalForm.jsx";

export default function ProductRawMaterials() {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [associations, setAssociations] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [manufacturingPrice, setManufacturingPrice] = useState(0);

  const [editing, setEditing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => { loadData(); }, []);

  const commonInput = { width: "100%", padding: 8 };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, mRes, aRes] = await Promise.all([
        api.get("products/"),
        api.get("raw-materials/"),
        api.get("product-raw-materials/"),
      ]);
      setProducts(pRes.data);
      setMaterials(mRes.data);
      setAssociations(aRes.data);
    } catch (err) {
      pushToast("error", "Erro ao carregar dados");
    }
    setLoading(false);
  };

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const associate = async () => {
    if (!selectedProduct || !selectedMaterial || !quantity) return pushToast("error", "Preencha o formulário");
    setLoading(true);
    try {
      // Verifica estoque
      const mat = (await api.get(`raw-materials/${selectedMaterial}/`)).data;
      if (mat.stock < Number(quantity)) {
        pushToast("error", "Sem estoque suficiente");
        setLoading(false);
        return;
      }

      // Cria associação
      await api.post(`product-raw-materials/`, {
        product: selectedProduct,
        raw_material: selectedMaterial,
        quantity: Number(quantity),
        manufacturing_price: Number(manufacturingPrice) || 0,
      });

      // Debita matéria-prima
      await api.patch(`raw-materials/${selectedMaterial}/`, { stock: mat.stock - Number(quantity) });

      pushToast("success", "Matéria-prima adicionada ao produto");
      setSelectedMaterial("");
      setQuantity(1);
      setManufacturingPrice(0);
      await loadData();
    } catch (err) {
      pushToast("error", "Erro ao associar");
    }
    setLoading(false);
  };

  const removeAssociation = async (id) => {
    if (!confirm("Deseja remover essa associação?")) return;
    setLoading(true);
    try {
      await api.delete(`product-raw-materials/${id}/`);
      pushToast("success", "Associação removida");
      await loadData();
    } catch (err) {
      pushToast("error", "Erro ao remover");
    }
    setLoading(false);
  };

  const openEdit = (assoc) => {
    setEditing(assoc);
    setModalVisible(true);
  };

  const saveEdit = async (values) => {
    setLoading(true);
    try {
      const assoc = editing;
      const oldQty = Number(assoc.quantity);
      const newQty = Number(values.quantity);

      // Ajusta estoque da matéria-prima envolvida
      const matRes = await api.get(`raw-materials/${assoc.raw_material}/`);
      const mat = matRes.data;
      const diff = newQty - oldQty;
      if (diff > 0 && mat.stock < diff) {
        pushToast("error", "Estoque insuficiente para aumentar quantidade");
        setLoading(false);
        return;
      }

      await api.patch(`product-raw-materials/${assoc.id}/`, { quantity: newQty });
      await api.patch(`raw-materials/${assoc.raw_material}/`, { stock: mat.stock - diff });

      pushToast("success", "Associação atualizada");
      setModalVisible(false);
      setEditing(null);
      await loadData();
    } catch (err) {
      pushToast("error", "Erro ao salvar edição");
    }
    setLoading(false);
  };

  // Filtra associações do produto selecionado
  const filteredAssocs = selectedProduct 
    ? associations.filter(a => String(a.product) === String(selectedProduct))
    : associations;

  return (
    <div style={{ padding: 20 }}>
      <h1>Adicionar Matérias-Primas ao Produto</h1>

      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ marginBottom: 8, padding: 10, borderRadius: 6, background: t.type === "success" ? "#d4edda" : "#f8d7da", color: t.type === "success" ? "#155724" : "#721c24" }}>
            {t.message}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <section style={{ flex: 1 }}>
          <h3>Lista de Matérias-Primas por Produto</h3>
          
            <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Filtrar por Produto</label>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={commonInput}>
              <option value="">-- Listar Todos --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {loading ? <Spinner /> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>Produto</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Matéria-prima</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Preço Mat.</th>
                  <th style={{ textAlign: "center", padding: 8 }}>Qtd</th>
                  <th style={{ textAlign: "right", padding: 8 }}>valor da fabricação</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Custo Total</th>
                  <th style={{ width: 140 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssocs.map(a => {
                  const product = products.find(p => p.id === a.product);
                  const material = materials.find(m => m.id === a.raw_material);
                  const materialPrice = parseFloat(material?.price || 0);
                  const manufacturing = parseFloat(a.manufacturing_price || 0);
                  const totalCost = materialPrice * parseFloat(a.quantity) + (manufacturing || 0);
                  return (
                    <tr key={a.id} style={{ borderTop: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{a.product_name || a.product}</td>
                      <td style={{ padding: 8 }}>{a.raw_material_name || a.raw_material}</td>
                      <td style={{ textAlign: "right", padding: 8 }}>R$ {materialPrice.toFixed(2)}</td>
                      <td style={{ textAlign: "center", padding: 8 }}>{a.quantity}</td>
                      <td style={{ textAlign: "right", padding: 8 }}>R$ {(parseFloat(a.manufacturing_price) || 0).toFixed(2)}</td>
                      <td style={{ textAlign: "right", padding: 8, fontWeight: "bold" }}>R$ {Number(totalCost || 0).toFixed(2)}</td>
                      <td style={{ padding: 8 }}>
                        <button onClick={() => openEdit(a)} style={{ marginRight: 8 }}>Editar</button>
                        <button onClick={() => removeAssociation(a.id)} style={{ color: "#a00" }}>Deletar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <aside style={{ width: 340 }}>
          <h3>Adicionar Associação</h3>
          <div style={{ display: "grid", gap: 8 }}>
              <div>
              <label style={{ display: "block", marginBottom: 4 }}>Produto</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={commonInput}>
                <option value="">Selecione um produto</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 4 }}>Matéria-Prima</label>
              <select value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)} style={commonInput}>
                <option value="">Selecione uma matéria-prima</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} (estoque: {m.stock})</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 4 }}>Quantidade Necessária</label>
              <input type="number" min="0.01" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} style={commonInput} />
            </div>
              <div>              
              <label style={{ display: "block", marginBottom: 4 }}>Valor da fabricação</label>
              <input type="number" min="0.00" step="0.01" value={manufacturingPrice} onChange={e => setManufacturingPrice(e.target.value)} style={commonInput} />
              </div>

            <button onClick={associate} disabled={loading} style={{ padding: 10, background: "#007bff", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              {loading ? <><Spinner size={16} /> Adicionando</> : "Adicionar Associação"}
            </button>
          </div>
        </aside>
      </div>

      <ModalForm title="Editar Quantidade" visible={modalVisible} onClose={() => { setModalVisible(false); setEditing(null); }}>
        {editing && <EditForm assoc={editing} materials={materials} products={products} onCancel={() => { setModalVisible(false); setEditing(null); }} onSave={saveEdit} />}
      </ModalForm>
    </div>
  );
}

function EditForm({ assoc, onSave, onCancel }) {
  const [q, setQ] = useState(String(assoc.quantity ?? ""));
  const [manuf, setManuf] = useState(assoc.manufacturing_price ?? "");

  const handleSave = () => {
    const payload = {
      ...assoc,
      quantity: Number(q),
      manufacturing_price: manuf === "" ? null : Number(manuf)
    };
    onSave(payload);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div><strong>Produto:</strong> {assoc.product_name || assoc.product}</div>
      <div><strong>Matéria-prima:</strong> {assoc.raw_material_name || assoc.raw_material}</div>
      <label>Quantidade</label>
      <input type="number" step="0.01" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8 }} />
      <label>Valor da fabricação</label>
      <input type="number" step="0.01" value={manuf ?? ""} onChange={e => setManuf(e.target.value)} style={{ padding: 8 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onCancel}>Cancelar</button>
        <button onClick={handleSave}>Salvar</button>
      </div>
    </div>
  );
}

