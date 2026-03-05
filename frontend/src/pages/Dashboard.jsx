import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function Dashboard() {

  const [data, setData] = useState({
    ventasHoy: 0,
    comprasHoy: 0,
    bajoStock: 0,
    ventasSemana: []
  });

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    obtenerDashboard();
  }, []);

  const obtenerDashboard = async () => {
    const res = await api.get("/dashboard");
    setData(res.data);
  };

  const descargarReporteVentas = async () => {
    const res = await api.get(
      `/reportes/ventas?desde=${fechaDesde}&hasta=${fechaHasta}`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_ventas.pdf";
    link.click();
  };

  const descargarReporteCompras = async () => {
    const res = await api.get(
      `/reportes/compras?desde=${fechaDesde}&hasta=${fechaHasta}`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_compras.pdf";
    link.click();
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>📊 Dashboard</h1>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginBottom: "40px"
      }}>

        <div style={cardStyle}>
          <h3>💰 Ventas Hoy</h3>
          <h2>${data.ventasHoy}</h2>
        </div>

        <div style={cardStyle}>
          <h3>📦 Compras Hoy</h3>
          <h2>${data.comprasHoy}</h2>
        </div>

        <div style={cardStyle}>
          <h3>⚠ Bajo Stock</h3>
          <h2>{data.bajoStock}</h2>
        </div>

      </div>

      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        alignItems: "center"
      }}>
        <label>Desde:</label>
        <input
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1"
          }}
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
        />

        <label>Hasta:</label>
        <input
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1"
          }}
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
        />
      </div>

      <div style={{
        display: "flex",
        gap: "15px",
        marginBottom: "40px"
      }}>
        <button
          onClick={descargarReporteVentas}
          style={primaryButton}
        >
          📄 Descargar Reporte Ventas
        </button>

        <button
          onClick={descargarReporteCompras}
          style={primaryButton}
        >
          📄 Descargar Reporte Compras
        </button>
      </div>

      {/* Gráfico */}
      <h2>📈 Ventas últimos 7 días</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data.ventasSemana.map(item => ({
            ...item,
            fechaFormateada: new Date(item.fecha)
              .toLocaleDateString("es-ES")
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fechaFormateada" />
          <YAxis />
          <Tooltip
            labelFormatter={(value) =>
              new Date(value).toLocaleDateString("es-ES")
            }
          />
          <Line type="monotone" dataKey="total" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

const cardStyle = {
  background: "#f5f5f5",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};

const primaryButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600"
};

export default Dashboard;