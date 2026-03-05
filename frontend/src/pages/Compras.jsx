import { useEffect, useState } from "react";
import api from "../api/axios";

function Compras() {

  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [items, setItems] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [filtroProveedor, setFiltroProveedor] = useState("");
const [filtroFecha, setFiltroFecha] = useState("");

  useEffect(() => {
    obtenerClientes();
    obtenerProductos();
    obtenerCompras();
  }, []);

  const obtenerClientes = async () => {
    const res = await api.get("/proveedores");
    setProveedores(res.data);
  };

  const obtenerProductos = async () => {
    const res = await api.get("/productos");
    setProductos(res.data);
  };

  const obtenerCompras = async () => {
  const res = await api.get("/compras");
  setHistorial(res.data);
};

  const agregarProducto = () => {
    setItems([
      ...items,
      {
        producto_id: "",
        nombre: "",
        precio: 0,
        cantidad: 1,
        subtotal: 0
      }
    ]);
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items];
    nuevosItems[index][campo] = valor;

    if (campo === "producto_id") {
      const producto = productos.find(p => p.id == valor);
      if (producto) {
        nuevosItems[index].precio = producto.precio_compra;
      }
    }

    nuevosItems[index].subtotal =
      nuevosItems[index].precio * nuevosItems[index].cantidad;

    setItems(nuevosItems);
  };

const eliminarItem = (index) => {
  const nuevosItems = items.filter((_, i) => i !== index);
  setItems(nuevosItems);
};

  const totalCompra = items.reduce((acc, item) => acc + item.subtotal, 0);

  const guardarCompra = async () => {
    try {
      await api.post("/compras", {
        proveedor_id: proveedorSeleccionado,
        productos: items
      });

      alert("Compra registrada correctamente");
      setItems([]);
      setProveedorSeleccionado("");

    } catch (error) {
      alert("Error al registrar compra");
    }

    obtenerCompras();
  };

  const anularCompra = async (id) => {
    if (!window.confirm("¿Seguro que deseas anular esta compra?")) return;

    try {
        await api.post(`/compras/${id}/anular`);
        alert("Compra anulada correctamente");
        obtenerCompras();
    } catch (error) {
        alert("Error al anular compra");
    }
  };

  const cancelarCompra = () => {
    if (items.length > 0) {
      if (!window.confirm("¿Seguro que deseas cancelar esta compra?")) return;
    }
    setItems([]);
    setProveedorSeleccionado("");
  };

  return (
    <div style={cardStyle}>
      <h1>Nueva Compra</h1>

      <select
        style={selectStyle}
        value={proveedorSeleccionado}
        onChange={(e) => setProveedorSeleccionado(e.target.value)}
      >
        <option value="">Todos los proveedores</option>
        {proveedores.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <br /><br />

      <button style={primaryButton} onClick={agregarProducto} disabled={items.some(i => !i.producto_id)}>+ Agregar Producto</button>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}></th>
            <th style={thStyle}>Producto</th>
            <th style={thStyle}>Precio Compra</th>
            <th style={thStyle}>Cantidad</th>
            <th style={thStyle}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={tdStyle}>
                <button
                  onClick={() => eliminarItem(index)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#dc2626",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  ✕
                </button>
              </td>
              <td style={tdStyle}>
                <select
                  style={selectStyle}
                  value={item.producto_id}
                  onChange={(e) =>
                    actualizarItem(index, "producto_id", e.target.value)
                  }
                >
                  <option value="">Seleccionar</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </td>

              <td style={tdStyle}>${item.precio}</td>

              <td style={tdStyle}>
                <input
                  style={inputStyle}
                  type="number"
                  value={item.cantidad}
                  min="1"
                  onChange={(e) =>
                    actualizarItem(index, "cantidad", Number(e.target.value))
                  }
                />
              </td>

              <td style={tdStyle}>${item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "20px", fontWeight: "600" }}>Total: ${totalCompra}</h2>

    <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
      <button
        onClick={guardarCompra}
        disabled={!proveedorSeleccionado || items.length === 0 ||
          items.some(i => !i.producto_id)}
        style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            transition: "0.3s",
            background:
              !proveedorSeleccionado ||
              items.length === 0 ||
              items.some(i => !i.producto_id)
                ? "#cbd5e1"   // gris deshabilitado
                : "#16a34a",  // verde activo
            color: "white"
          }}
      >
        Guardar Compra
      </button>
      <button
          onClick={cancelarCompra}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            background: "#ef4444",
            color: "white"
          }}
        >
          Cancelar
        </button>
      </div>

          <hr />
<h2>Historial de Compras</h2>

<div style={{
        display: "flex",
        gap: "15px",
        marginBottom: "20px",
        flexWrap: "wrap"
      }}>
        <select
          style={selectStyle}
          value={filtroProveedor}
          onChange={(e) => setFiltroProveedor(e.target.value)}
        >
          <option value="">Todos los proveedores</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1"
          }}
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
      </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(600px, 1fr))",
    gap: "20px"
  }}
>
  {historial
    .filter((compra) => {

      const coincideProveedor = filtroProveedor
        ? compra.proveedor_id == filtroProveedor
        : true;

      const coincideFecha = filtroFecha
        ? new Date(compra.created_at)
            .toISOString()
            .split("T")[0] === filtroFecha
        : true;

      return coincideProveedor && coincideFecha;
    })
    .map((compra) => (
      <div
        key={compra.compra_id}
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
        }}
      >
        {/* CONTENEDOR FLEX */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "flex-start"
          }}
        >
          {/* IZQUIERDA */}
          <div style={{ flex: 1 }}>
            <p><strong>Compra #{compra.compra_id}</strong></p>
            <p><strong>Proveedor:</strong> {compra.proveedor}</p>
            <p><strong>Fecha:</strong> {new Date(compra.created_at).toLocaleString()}</p>
            <p>
              <strong>Estado:</strong>{" "}
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background:
                    compra.estado === "ACTIVA" ? "#dcfce7" : "#e2e8f0",
                  color:
                    compra.estado === "ACTIVA" ? "#166534" : "#475569"
                }}
              >
                {compra.estado}
              </span>
            </p>
            <p><strong>Total:</strong> ${compra.total.toLocaleString("es-CO")}</p>

            {compra.estado === "ACTIVA" && (
              <button
                onClick={() => anularCompra(compra.compra_id)}
                style={dangerButton}
              >
                Anular Compra
              </button>
            )}
          </div>

          {/* DERECHA - PRODUCTOS SIN TABLA */}
          <div style={{ flex: 2 }}>
            {compra.detalle.map((d, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <p><strong>Producto:</strong> {d.nombre}</p>
                <p><strong>Cantidad:</strong> {d.cantidad}</p>
                <p><strong>Precio:</strong> ${d.precio_unitario}</p>
                <p><strong>Subtotal:</strong> ${d.subtotal}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    ))}
</div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginBottom: "30px"
};

const selectStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  width: "250px",
  marginRight: "10px"
};

const inputStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  width: "80px",
  textAlign: "center"
};

const primaryButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  marginTop: "10px"
};

const dangerButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer"
};

const tableStyle = {
  width: "100%",
  marginTop: "20px",
  borderCollapse: "collapse",
  textAlign: "center"
};

const thStyle = {
  borderBottom: "2px solid #e2e8f0",
  padding: "10px",
  fontWeight: "600",
  fontSize: "14px"
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "14px"
};

export default Compras;