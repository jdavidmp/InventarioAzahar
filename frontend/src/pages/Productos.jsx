import { useEffect, useState } from "react";
import api from "../api/axios";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);

  const [productoActual, setProductoActual] = useState({
    nombre: "",
    categoria: "",
    precio_compra: "",
    precio_venta: "",
    stock_actual: "",
    fecha_vencimiento: ""
  });

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await api.get("/productos");
      setProductos(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const abrirCrear = () => {
    setEditando(false);
    setProductoActual({
      nombre: "",
      categoria: "",
      precio_compra: "",
      precio_venta: "",
      stock_actual: "",
      fecha_vencimiento: ""
    });
    setMostrarModal(true);
  };

  const abrirEditar = (producto) => {
    setEditando(true);
    setProductoActual(producto);
    setMostrarModal(true);
  };

  const guardarProducto = async () => {
    try {
      if (editando) {
        await api.put(`/productos/${productoActual.id}`, productoActual);
      } else {
        await api.post("/productos", productoActual);
      }

      setMostrarModal(false);
      obtenerProductos();
    } catch (error) {
      console.log(error.response?.data);
      alert("Error al guardar producto");
    }
  };

  const eliminarProducto = async (id) => {
    if (window.confirm("¿Eliminar producto?")) {
      await api.delete(`/productos/${id}`);
      obtenerProductos();
    }
  };

  return (
    <div>
      <h1 style={{
        marginBottom: "20px",
        fontSize: "24px",
        fontWeight: "600",
        color: "#1e293b"
      }}>Productos</h1>

      <button style={btnPrimary} onClick={abrirCrear}>
        + Agregar Producto
      </button>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio Venta</th>
            <th>Stock</th>
            <th>Vence</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}
              style={rowStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f1f5f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "white")
              }
            >
              <td style={tdStyle}>{p.id}</td>
              <td style={tdStyle}>{p.nombre}</td>
              <td style={tdStyle}>{p.categoria}</td>
              <td style={tdStyle}>${p.precio_venta}</td>
              <td style={tdStyle}>{p.stock_actual}</td>
              <td style={tdStyle}>
                {p.fecha_vencimiento
                  ? new Date(p.fecha_vencimiento).toLocaleDateString("es-ES")
                  : "-"}
              </td>
              <td style={tdStyle}>
                <button style={btnEdit} onClick={() => abrirEditar(p)}>
                  Editar
                </button>
                <button
                  style={btnDelete}
                  onClick={() => eliminarProducto(p.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2>{editando ? "Editar" : "Nuevo"} Producto</h2>

            <input
              placeholder="Nombre"
              value={productoActual.nombre}
              onChange={(e) =>
                setProductoActual({ ...productoActual, nombre: e.target.value })
              }
            />

            <input
              placeholder="Categoría"
              value={productoActual.categoria}
              onChange={(e) =>
                setProductoActual({
                  ...productoActual,
                  categoria: e.target.value
                })
              }
            />

            <input
              type="number"
              placeholder="Precio Compra"
              value={productoActual.precio_compra}
              onChange={(e) =>
                setProductoActual({
                  ...productoActual,
                  precio_compra: e.target.value
                })
              }
            />

            <input
              type="number"
              placeholder="Precio Venta"
              value={productoActual.precio_venta}
              onChange={(e) =>
                setProductoActual({
                  ...productoActual,
                  precio_venta: e.target.value
                })
              }
            />

            <input
              type="number"
              placeholder="Stock Actual"
              value={productoActual.stock_actual}
              onChange={(e) =>
                setProductoActual({
                  ...productoActual,
                  stock_actual: e.target.value
                })
              }
            />

            <input
              type="date"
              value={productoActual.fecha_vencimiento || ""}
              onChange={(e) =>
                setProductoActual({
                  ...productoActual,
                  fecha_vencimiento: e.target.value
                })
              }
            />

            <div style={{ marginTop: 15 }}>
              <button style={btnPrimary} onClick={guardarProducto}>
                Guardar
              </button>
              <button
                style={btnCancel}
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ESTILOS */

const tableStyle = {
  width: "100%",
  marginTop: "20px",
  borderCollapse: "separate",
  borderSpacing: 0,
  background: "white",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};

const btnPrimary = {
  background: "#2563eb",
  color: "white",
  padding: "8px 14px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

const btnEdit = {
  background: "#f59e0b",
  color: "white",
  padding: "6px 10px",
  border: "none",
  marginRight: "5px",
  borderRadius: "4px",
  cursor: "pointer"
};

const btnDelete = {
  background: "#dc2626",
  color: "white",
  padding: "6px 10px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

const btnCancel = {
  background: "gray",
  color: "white",
  padding: "8px 14px",
  border: "none",
  marginLeft: "10px",
  borderRadius: "4px",
  cursor: "pointer"
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  background: "white",
  padding: "25px",
  borderRadius: "8px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const thStyle = {
  background: "#1e293b",
  color: "white",
  padding: "12px",
  textAlign: "center",
  fontWeight: "600",
  fontSize: "14px"
};

const tdStyle = {
  padding: "12px",
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px"
};

const rowStyle = {
  transition: "0.2s",
  cursor: "default"
};

export default Productos;