import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

async function testLogin() {
  console.log("==================================================");
  console.log("Teste de Integração: React + Django");
  console.log("==================================================\n");

  // TESTE 1: Login
  console.log("[TESTE 1] Testando LOGIN...");
  try {
    const loginResponse = await axios.post(`${API_URL}/token/`, {
      username: "testuser",
      password: "testpass123"
    });

    console.log(`Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      const token = loginResponse.data.access;
      console.log("✓ Login bem-sucedido!");
      console.log(`  Token: ${token.substring(0, 20)}...\n`);

      // TESTE 2: Acessar endpoint protegido
      console.log("[TESTE 2] Testando acesso a endpoints protegidos...");
      
      const axiosWithToken = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      try {
        const productsResponse = await axiosWithToken.get("/products/");
        console.log(`  GET /products/ - Status: ${productsResponse.status}`);
        console.log("  ✓ Acesso autorizado aos produtos");
        console.log(`  Resposta:`, productsResponse.data);
      } catch (error) {
        console.log(`  ✗ Erro ao acessar produtos:`, error.message);
      }

      // TESTE 3: Tentar acessar sem token
      console.log("\n[TESTE 3] Testando acesso SEM token (deve ser 401)...");
      try {
        await axios.get(`${API_URL}/products/`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`  Status: ${error.response.status}`);
          console.log("  ✓ Corretamente rejeitado sem token");
        } else {
          console.log(`  ! Retornou ${error.response?.status}`);
        }
      }
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log("✗ Erro de conexão - Django não está respondendo");
    } else {
      console.log("✗ Erro:", error.message);
    }
  }

  console.log("\n==================================================");
  console.log("Testes concluídos!");
  console.log("==================================================");
}

export default testLogin;
