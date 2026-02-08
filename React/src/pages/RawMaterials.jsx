import { useEffect, useState } from "react";
import api from '/src/api/api.js';


export default function RawMaterials() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState(0);

  const load = () =>
    api.get("raw-materials/").then(res => setItems(res.data));

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await api.post("raw-materials/", { name, stock });
    setName("");
    setStock(0);
    load();
  };

  return (
    <>
      <h2>🧪 Matérias-Primas</h2>

      <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
      <input type="number" value={stock} onChange={e => setStock(e.target.value)} />
      <button onClick={create}>Cadastrar</button>

      <ul>
        {items.map(i => (
          <li key={i.id}>{i.name} | Estoque: {i.stock}</li>
        ))}
      </ul>
    </>
  );
}
