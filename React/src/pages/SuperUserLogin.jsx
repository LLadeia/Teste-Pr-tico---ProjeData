import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export default function SuperUserLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se já há token salvo
    const token = localStorage.getItem("token");
    if (token) {
      checkUserRole(token);
    }
  }, []);

  const checkUserRole = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/user/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = response.data;
      if (user.is_superuser) {
        setUserInfo(user);
        setMessage("✓ Você está logado como superusuário!");
      } else {
        localStorage.removeItem("token");
        setError("Este login é apenas para superusuários");
      }
    } catch (err) {
      localStorage.removeItem("token");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${API_URL}/token/`, {
        username,
        password
      });

      const token = response.data.access;

      // Verificar se é superusuário
      const userResponse = await axios.get(`${API_URL}/auth/user/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = userResponse.data;
      if (!user.is_superuser) {
        setError("❌ Este login é apenas para superusuários!");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user_type", "superuser");
      setUserInfo(user);
      setMessage("✓ Login como Superusuário realizado!");

      // Redirecionar para auditoria
      setTimeout(() => navigate("/auditory"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
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
          <h1 style={{ margin: "0 0 10px 0", color: "#333" }}>👤 Painel de Superusuário</h1>
          <p style={{ color: "#666", margin: 0 }}>Acesso restrito à auditoria do sistema</p>
        </div>

        {!userInfo ? (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Usuário:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário superusuário"
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
                backgroundColor: loading ? "#ccc" : "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Entrando..." : "🔐 Acessar Painel"}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              backgroundColor: "#e7f3ff", 
              padding: "20px", 
              borderRadius: "5px",
              marginBottom: "20px"
            }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>
                Logado como:
              </p>
              <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#0066cc" }}>
                {userInfo.username} (Admin)
              </p>
            </div>

            <button
              onClick={() => navigate("/auditory")}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "10px",
                cursor: "pointer"
              }}
            >
              📊 Ir para Auditoria
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              🚪 Sair
            </button>
          </div>
        )}

        {message && (
          <div style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "5px",
            color: "#155724"
          }}>
            {message}
          </div>
        )}

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
      </div>
    </div>
  );
}
