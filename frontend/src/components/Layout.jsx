import { useNavigate } from "react-router-dom";

function Layout({ children, setToken }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div style={layoutStyle}>
      
      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <h2>Inventario</h2>

        <button onClick={() => navigate("/")}
          style={btnStyle}>
          Dashboard
        </button>

        <button onClick={() => navigate("/productos")}
          style={btnStyle}>
          Productos
        </button>

        <button onClick={() => navigate("/clientes")}
          style={btnStyle}>
          Clientes
        </button>

        <button onClick={() => navigate("/proveedores")}
          style={btnStyle}>
          Proveedores
        </button>
        
        <button onClick={() => navigate("/ventas")}
          style={btnStyle}>
          Ventas
        </button>
        
        <button onClick={() => navigate("/Compras")}
          style={btnStyle}>
          Compras
        </button>
        

        <hr />

        <button onClick={logout}
          style={{ ...btnStyle, background: "#dc2626" }}>
          Cerrar sesión
        </button>
      </div>

      {/* CONTENIDO */}
      <div style={{
        flex: 1,
        padding: "30px",
        background: "#f1f5f9"
      }}>
        {children}
      </div>
    </div>
  );
}

const btnStyle = {
  display: "block",
  width: "100%",
  margin: "10px 0",
  padding: "10px",
  background: "#334155",
  color: "white",
  border: "none",
  cursor: "pointer"
};

const layoutStyle = {
  display: "flex",
  minHeight: "100vh"
};

const sidebarStyle = {
  width: "220px",
  background: "#1e293b",
  color: "white",
  padding: "20px",
  position: "sticky",
  top: 0,
  height: "100vh"
};
export default Layout;