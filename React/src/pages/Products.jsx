import { useEffect, useState } from "react";
import api from '/src/api/api.js';
import Spinner from '/src/components/Spinner.jsx';
import ModalForm from '/src/components/ModalForm.jsx';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("products/");
      setProducts(res.data);
    } catch (err) {
      pushToast("error", "Erro ao carregar produtos");
    }
    setLoading(false);
  };

  
  async function handleSubmit(e) {
    e.preventDefault();
    await create();
  }

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const create = async () => {
    if (!form.name.trim()) return pushToast("error", "Preencha o nome");
    if (!form.price || form.price <= 0) return pushToast("error", "Preencha o preço");
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append("image", imageFile);

      await api.post("products/", data);
      pushToast("success", "Produto criado");
      setForm({ name: "", price: "" , image: null});
      await load();
    } catch (err) {
      pushToast("error", "Erro ao criar");
    }
    setLoading(false);
  };

  const remove = async (id) => {
    if (!confirm("Deseja remover esse produto?")) return;
    setLoading(true);
    try {
      await api.delete(`products/${id}/`);
      pushToast("success", "Produto removido");
      await load();
    } catch (err) {
      pushToast("error", "Erro ao remover");
    }
    setLoading(false);
  };

  const openEdit = (product) => {
    setEditing(product);
    setModalVisible(true);
  };

  const saveEdit = async (name, price, imageFile) => {
    if (!name.trim()) return pushToast("error", "Preencha o nome");
    if (!price || price <= 0) return pushToast("error", "Preencha o preço");
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", name);
      data.append("price", price);
      if (imageFile) data.append("image", imageFile);

      await api.patch(`products/${editing.id}/`, data);
      pushToast("success", "Produto atualizado");
      setModalVisible(false);
      setEditing(null);
      await load();
    } catch (err) {
      pushToast("error", "Erro ao salvar");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Produtos</h1>

      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ marginBottom: 8, padding: 10, borderRadius: 6, background: t.type === "success" ? "#d4edda" : "#f8d7da", color: t.type === "success" ? "#155724" : "#721c24" }}>
            {t.message}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <section style={{ flex: 1 }}>
          <h3>Lista</h3>
          {loading ? <Spinner /> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>Imagem</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Nome</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Preço</th>
                  <th style={{ textAlign: "center", padding: 8 }}>Estoque</th>
                  <th style={{ width: 140 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: 8 }}>{p.image ? <img src={p.image} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover' }} /> : 'Sem imagem'}</td>
                    <td style={{ padding: 8 }}>{p.name}</td>
                    <td style={{ textAlign: "right", padding: 8 }}>R$ {parseFloat(p.price || 0).toFixed(2)}</td>
                    <td style={{ textAlign: "center", padding: 8 }}>{p.stock}</td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ marginRight: 8 }}>Editar</button>
                      <button onClick={() => remove(p.id)} style={{ color: "#a00" }}>Deletar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <aside style={{ width: 300 }}>
          <h3>Novo Produto</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <input type="text" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input type="number" placeholder="Preço" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <input type="file" onChange={e => setImageFile(e.target.files[0])} />
            <button onClick={create} disabled={loading}>
              {loading ? <><Spinner size={16} /> Salvando</> : "Criar"}
            </button>
          </div>
        </aside>
      </div>

      <ModalForm title="Editar Produto" visible={modalVisible} onClose={() => { setModalVisible(false); setEditing(null); }}>
        {editing && <EditModal product={editing} onSave={saveEdit} onCancel={() => { setModalVisible(false); setEditing(null); }} />}
      </ModalForm>
    </div>
  );
}

function EditModal({ product, onSave, onCancel }) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price || "");
  const [imageFile, setImageFile] = useState(null);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome" />
      <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço" step="0.01" min="0" />
      <input type="file" onChange={e => setImageFile(e.target.files[0])} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onCancel}>Cancelar</button>
        <button onClick={() => onSave(name, price, imageFile)}>Salvar</button>
      </div>
    </div>
  );
}
