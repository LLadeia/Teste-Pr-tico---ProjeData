import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export default function Login() {
  const [username, setUsername] = useState("testuser");
  const [password, setPassword] = useState("testpass123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/token/`, {
        username,
        password
      });

      const access_token = response.data.access;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_type", "user");
      
      // Redirecionar para dashboard
      navigate("/Dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    if (!token) {
      setError("Faça login primeiro");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`✓ Teste OK! ${response.data.length} produtos encontrados`);
    } catch (err) {
      setError(`Erro ao testar API: ${err.response?.status || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUsername("testuser");
    setPassword("testpass123");
    setMessage("Desconectado");
  };

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "600px", 
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ margin: "0 0 10px 0", color: "#333" }}>🔐 Login - Sistema de Produção</h1>
          <p style={{ color: "#666", margin: 0 }}>Acesso para usuários do sistema</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Usuário:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Senha:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Entrando..." : "🚀 Entrar"}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
            color: "#721c24"
          }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #eee", color: "#666", fontSize: "14px" }}>
          <p style={{ margin: "0 0 10px 0" }}>
            <strong>Credenciais de Teste:</strong>
          </p>
          <p style={{ margin: "0 0 5px 0" }}>👤 Usuário: <code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: "3px" }}>testuser</code></p>
          <p style={{ margin: 0 }}>🔑 Senha: <code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: "3px" }}>testpass123</code></p>
        </div>
      </div>
    </div>
  );
}
