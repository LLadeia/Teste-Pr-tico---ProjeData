import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: 15, background: "#222", color: "#fff" }}>
      <Link to="/" style={{ marginRight: 15 }}>🏠 Dashboard</Link>
      <Link to="/products" style={{ marginRight: 15 }}>📦 Produtos</Link>
      <Link to="/raw-materials" style={{ marginRight: 15 }}>🧪 Matérias-Primas</Link>
      <Link to="/relations" style={{ marginRight: 15 }}>🔗 Associação</Link>
      <Link to="/production">🏭 Produção</Link>
    </nav>
  );
}
