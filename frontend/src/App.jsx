import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Layout from "./components/Layout";
import Clientes from "./pages/Clientes";
import Ventas from "./pages/Ventas";
import Compras from "./pages/Compras";
import Proveedores from "./pages/Proveedores";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Si NO hay token → mostrar solo Login
  if (!token) {
    return <Login setToken={setToken} />;
  }

  // Si hay token → mostrar panel con sidebar
  return (
    <Layout setToken={setToken}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/proveedores" element={<Proveedores />} />
      </Routes>
    </Layout>
  );
}

export default App;