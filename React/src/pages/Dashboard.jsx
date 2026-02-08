import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <h1>📊 Sistema de Produção</h1>

      <ul>
        <li><Link to="/products">Cadastro de Produtos</Link></li>
        <li><Link to="/raw-materials">Cadastro de Matérias-Primas</Link></li>
        <li><Link to="/relations">Associar Matérias-Primas</Link></li>
        <li><Link to="/production">Produção</Link></li>
      </ul>
    </div>
  );
}
