import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isSuperUser, setIsSuperUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    setIsSuperUser(userType === "superuser");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_type");
    setIsSuperUser(false);
    navigate("/");
  };

  return (
    <nav style={{ 
      padding: "15px 20px", 
      background: "#222", 
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <Link to="/" style={{ marginRight: 15, color: "#fff", textDecoration: "none" }}>
          🏠 Dashboard
        </Link>
        <Link to="/products" style={{ marginRight: 15, color: "#fff", textDecoration: "none" }}>
          📦 Produtos
        </Link>
        <Link to="/raw-materials" style={{ marginRight: 15, color: "#fff", textDecoration: "none" }}>
          🧪 Matérias-Primas
        </Link>
        <Link to="/relations" style={{ marginRight: 15, color: "#fff", textDecoration: "none" }}>
          🔗 Associação
        </Link>
        <Link to="/production" style={{ marginRight: 15, color: "#fff", textDecoration: "none" }}>
          🏭 Produção
        </Link>
        
        {isSuperUser && (
          <Link to="/auditory" style={{ marginRight: 15, color: "#ffc107", textDecoration: "none", fontWeight: "bold" }}>
            🔍 Auditoria
          </Link>
        )}
      </div>

      <div>
        {isSuperUser && (
          <span style={{ marginRight: "15px", color: "#ffc107", fontWeight: "bold" }}>
            👤 Admin
          </span>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 15px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          🚪 Sair
        </button>
      </div>
    </nav>
  );
}
