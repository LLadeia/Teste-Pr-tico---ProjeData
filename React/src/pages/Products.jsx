import { useEffect, useState } from "react";
import api from '/src/api/api.js';


export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");

  const load = () =>
    api.get("products/").then(res => setProducts(res.data));

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await api.post("products/", { name });
    setName("");
    load();
  };

  const remove = async (id) => {
    await api.delete(`products/${id}/`);
    load();
  };

  return (
    <>
      <h2>📦 Produtos</h2>

      <input
        placeholder="Nome do produto"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={create}>Cadastrar</button>

      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.name}
            <button onClick={() => remove(p.id)}>🗑</button>
          </li>
        ))}
      </ul>
    </>
  );
}
