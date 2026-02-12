import { useEffect, useState } from "react";
import api from '/src/api/api.js';
import Spinner from '/src/components/Spinner.jsx';
import ModalForm from '/src/components/ModalForm.jsx';

export default function RawMaterials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", stock: 0, price: "" });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("raw-materials/");
      setItems(res.data);
    } catch (err) {
      pushToast("error", "Erro ao carregar");
    }
    setLoading(false);
  };

  const pushToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const create = async () => {
    if (!form.name.trim()) return pushToast("error", "Preencha o nome");
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append("image", imageFile);

      await api.post("raw-materials/", data);
      pushToast("success", "Matéria-prima criada");
      setForm({ name: "", stock: 0, price: "" , image: null});
      setImageFile(null);
      await load();
    } catch (err) {
      pushToast("error", "Erro ao criar");
    }
    setLoading(false);
  };

  const remove = async (id) => {
    if (!confirm("Deseja remover?")) return;
    setLoading(true);
    try {
      await api.delete(`raw-materials/${id}/`);
      pushToast("success", "Removido");
      await load();
    } catch (err) {
      pushToast("error", "Erro ao remover");
    }
    setLoading(false);
  };

  const openEdit = (item) => {
    setEditing(item);
    setModalVisible(true);
  };

  const saveEdit = async (values, imageFile) => {
    if (!values.name.trim()) return pushToast("error", "Preencha o nome");
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(values).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append("image", imageFile);

      await api.patch(`raw-materials/${editing.id}/`, data);
      pushToast("success", "Atualizado");
      setModalVisible(false);
      setEditing(null);
      setImageFile(null);
      await load();
    } catch (err) {
      pushToast("error", "Erro ao salvar");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🧪 Matérias-Primas</h1>

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
                  <th style={{ textAlign: "right", padding: 8 }}>Preço Unit.</th>
                  <th style={{ textAlign: "center", padding: 8 }}>Estoque</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Valor Total</th>
                  <th style={{ width: 140 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => {
                  const price = parseFloat(i.price || 0);
                  const stock = parseFloat(i.stock || 0);
                  const totalValue = price * stock;
                  return (
                    <tr key={i.id} style={{ borderTop: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{i.image ? <img src={i.image} alt={i.name} style={{ width: 50, height: 50, objectFit: 'cover' }} /> : 'Sem imagem'}</td>
                      <td style={{ padding: 8 }}>{i.name}</td>
                      <td style={{ textAlign: "right", padding: 8 }}>R$ {price.toFixed(2)}</td>
                      <td style={{ textAlign: "center", padding: 8 }}>{stock}</td>
                      <td style={{ textAlign: "right", padding: 8, fontWeight: "bold" }}>R$ {totalValue.toFixed(2)}</td>
                      <td style={{ padding: 8 }}>
                        <button onClick={() => openEdit(i)} style={{ marginRight: 8 }}>Editar</button>
                        <button onClick={() => remove(i.id)} style={{ color: "#a00" }}>Deletar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <aside style={{ width: 300 }}>
          <h3>Nova Matéria-Prima</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <input type="text" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <label>Preço</label>
            <input type="number" placeholder="Preço" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <label>Estoque</label>
            <input type="number" placeholder="Estoque" min="0" step="1" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            <label>Imagem</label>
            <input type="file" onChange={e => setImageFile(e.target.files[0])} />
            <button onClick={create} disabled={loading}>
              {loading ? <><Spinner size={16} /> Salvando</> : "Criar"}
            </button>
          </div>
        </aside>
      </div>

      <ModalForm title="Editar Matéria-Prima" visible={modalVisible} onClose={() => { setModalVisible(false); setEditing(null); }}>
        {editing && <EditModal item={editing} onSave={saveEdit} onCancel={() => { setModalVisible(false); setEditing(null); }} />}
      </ModalForm>
    </div>
  );
}

function EditModal({ item, onSave, onCancel }) {
  const [values, setValues] = useState({ name: item.name, stock: item.stock, price: item.price || "" });
  const [imageFile, setImageFile] = useState(null);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label>Nome</label>
      <input type="text" value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} />
      <label>Estoque</label>
      <input type="number" min="0" step="0.01" value={values.stock} onChange={e => setValues({ ...values, stock: e.target.value })} />
      <label>Preço</label>
      <input type="number" min="0" step="0.01" value={values.price} onChange={e => setValues({ ...values, price: e.target.value })} />
      <label>Imagem</label>
      <input type="file" onChange={e => setImageFile(e.target.files[0])} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onCancel}>Cancelar</button>
        <button onClick={() => onSave(values, imageFile)}>Salvar</button>
      </div>
    </div>
  );
}
