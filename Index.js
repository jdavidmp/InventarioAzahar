require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const app = express();
const db = require('./config/db');

app.use(cors({ origin: "*"})); 
app.use(express.json()); 

// Rutas
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const ventasRoutes = require("./routes/ventas");
const comprasRoutes = require("./routes/compras");
const proveedoresRoutes = require("./routes/proveedores");
const dashboardRoutes = require("./routes/dashboard");
const reportesRoutes = require("./routes/reportes");

app.use('/auth', authRoutes);
app.use('/productos', productosRoutes);
app.use('/clientes', clientesRoutes);
app.use("/ventas", ventasRoutes);
app.use("/compras", comprasRoutes);
app.use("/proveedores", proveedoresRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/reportes", reportesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API Inventario funcionando');
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
