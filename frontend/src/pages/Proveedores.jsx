import { useEffect, useState } from "react";
import api from "../api/axios";

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);

  const [proveedorActual, setProveedorActual] = useState({
    nombre: "",
    telefono: "",
    email: ""
  });

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const abrirCrear = () => {
    setEditando(false);
    setProveedorActual({
      nombre: "",
      telefono: "",
      email: ""
    });
    setMostrarModal(true);
  };

  const abrirEditar = (proveedor) => {
    setEditando(true);
    setProveedorActual(proveedor);
    setMostrarModal(true);
  };

  const guardarProveedor = async () => {
    try {
      if (editando) {
        await api.put(`/proveedores/${proveedorActual.id}`, proveedorActual);
      } else {
        await api.post("/proveedores", proveedorActual);
      }

      setMostrarModal(false);
      obtenerProveedores();
    } catch (error) {
      console.log(error.response?.data);
      alert("Error al guardar proveedor");
    }
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm("¿Eliminar proveedor?")) {
      try {
        await api.delete(`/proveedores/${id}`);
        obtenerProveedores();
      } catch (error) {
        alert("No se puede eliminar proveedor con compras registradas");
      }
    }
  };

  return (
    <div>
      <h1 style={{
        marginBottom: "20px",
        fontSize: "24px",
        fontWeight: "600",
        color: "#1e293b"
      }}>Proveedores</h1>

      <button style={btnPrimary} onClick={abrirCrear}>
        + Nuevo Proveedor
      </button>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((p) => (
            <tr kkey={p.id}
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
              <td style={tdStyle}>{p.telefono}</td>
              <td style={tdStyle}>{p.email}</td>
              <td style={tdStyle}>
                <button style={btnEdit} onClick={() => abrirEditar(p)}>
                  Editar
                </button>
                <button
                  style={btnDelete}
                  onClick={() => eliminarProveedor(p.id)}
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
            <h2>{editando ? "Editar" : "Nuevo"} Proveedor</h2>

            <input
              placeholder="Nombre"
              value={proveedorActual.nombre}
              onChange={(e) =>
                setProveedorActual({
                  ...proveedorActual,
                  nombre: e.target.value
                })
              }
            />

            <input
              placeholder="Teléfono"
              value={proveedorActual.telefono}
              onChange={(e) =>
                setProveedorActual({
                  ...proveedorActual,
                  telefono: e.target.value
                })
              }
            />

            <input
              placeholder="Email"
              value={proveedorActual.email}
              onChange={(e) =>
                setProveedorActual({
                  ...proveedorActual,
                  email: e.target.value
                })
              }
            />

            <div style={{ marginTop: 15 }}>
              <button style={btnPrimary} onClick={guardarProveedor}>
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

/* === MISMOS ESTILOS === */

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

export default Proveedores;