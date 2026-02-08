import { useEffect, useState } from "react";
import api from '/src/api/api.js';


export default function ProductRawMaterials() {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [product, setProduct] = useState("");
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get("products/").then(res => setProducts(res.data));
    api.get("raw-materials/").then(res => setMaterials(res.data));
  }, []);

  const associate = async () => {
    await api.post("product-raw-materials/", {
      product,
      raw_material: material,
      quantity
    });
    alert("Associado com sucesso");
  };

  return (
    <>
      <h2>🔗 Associação</h2>

      <select onChange={e => setProduct(e.target.value)}>
        <option>Produto</option>
        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <select onChange={e => setMaterial(e.target.value)}>
        <option>Matéria-prima</option>
        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>

      <input
        type="number"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
      />

      <button onClick={associate}>Associar</button>
    </>
  );
}
