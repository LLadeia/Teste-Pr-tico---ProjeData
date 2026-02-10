import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import RawMaterials from "./pages/RawMaterials";
import ProductRawMaterials from "./pages/ProductRawMaterials";
import Production from "./pages/Production";
import Login from "./pages/Login";
import SuperUserLogin from "./pages/SuperUserLogin";
import Auditory from "./pages/Auditory";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<SuperUserLogin />} />
          <Route path="/superuser" element={<SuperUserLogin />} />
          <Route path="/auditory" element={<Auditory />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/raw-materials" element={<RawMaterials />} />
          <Route path="/relations" element={<ProductRawMaterials />} />
          <Route path="/production" element={<Production />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
