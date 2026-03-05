import { useEffect, useState } from "react";
import api from "../api/axios";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);

  const [clienteActual, setClienteActual] = useState({
    nombre: "",
    tipo: "",
    telefono: "",
    email: ""
  });

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const abrirCrear = () => {
    setEditando(false);
    setClienteActual({
      nombre: "",
      tipo: "",
      telefono: "",
      email: ""
    });
    setMostrarModal(true);
  };

  const abrirEditar = (cliente) => {
    setEditando(true);
    setClienteActual(cliente);
    setMostrarModal(true);
  };

  const guardarCliente = async () => {
    try {
      if (editando) {
        await api.put(`/clientes/${clienteActual.id}`, clienteActual);
      } else {
        await api.post("/clientes", clienteActual);
      }

      setMostrarModal(false);
      obtenerClientes();
    } catch (error) {
      console.log(error.response?.data);
      alert("Error al guardar cliente");
    }
  };

  const eliminarCliente = async (id) => {
    if (window.confirm("¿Eliminar cliente?")) {
      await api.delete(`/clientes/${id}`);
      obtenerClientes();
    }
  };

  return (
    <div>
      <h1 style={{
        marginBottom: "20px",
        fontSize: "24px",
        fontWeight: "600",
        color: "#1e293b"
      }}>Clientes</h1>

      <button style={btnPrimary} onClick={abrirCrear}>
        + Nuevo Cliente
      </button>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}
                style={rowStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f1f5f9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
              <td style={tdStyle}>{c.id}</td>
              <td style={tdStyle}>{c.nombre}</td>
              <td style={tdStyle}>{c.tipo}</td>
              <td style={tdStyle}>{c.telefono}</td>
              <td style={tdStyle}>{c.email}</td>
              <td style={tdStyle}>
                <button style={btnEdit} onClick={() => abrirEditar(c)}>
                  Editar
                </button>
                <button
                  style={btnDelete}
                  onClick={() => eliminarCliente(c.id)}
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
            <h2>{editando ? "Editar" : "Nuevo"} Cliente</h2>

            <input
              placeholder="Nombre"
              value={clienteActual.nombre}
              onChange={(e) =>
                setClienteActual({ ...clienteActual, nombre: e.target.value })
              }
            />

            <input
              placeholder="Tipo (Minorista / Mayorista)"
              value={clienteActual.tipo}
              onChange={(e) =>
                setClienteActual({ ...clienteActual, tipo: e.target.value })
              }
            />

            <input
              placeholder="Teléfono"
              value={clienteActual.telefono}
              onChange={(e) =>
                setClienteActual({ ...clienteActual, telefono: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={clienteActual.email}
              onChange={(e) =>
                setClienteActual({ ...clienteActual, email: e.target.value })
              }
            />

            <div style={{ marginTop: 15 }}>
              <button style={btnPrimary} onClick={guardarCliente}>
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

/* === ESTILOS (mismos que productos) === */

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
export default Clientes;    