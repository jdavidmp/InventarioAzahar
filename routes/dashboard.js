const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {

    // 🔹 Ventas hoy
    const [ventasHoy] = await db.query(`
      SELECT IFNULL(SUM(total),0) as total
      FROM ventas
      WHERE DATE(created_at) = CURDATE()
      AND estado = 'ACTIVA'
    `);

    // 🔹 Compras hoy
    const [comprasHoy] = await db.query(`
      SELECT IFNULL(SUM(total),0) as total
      FROM compras
      WHERE DATE(created_at) = CURDATE()
      AND estado = 'ACTIVA'
    `);

    // 🔹 Productos bajo stock (menos de 5)
    const [bajoStock] = await db.query(`
      SELECT COUNT(*) as total
      FROM productos
      WHERE stock_actual <= 5
    `);

    // 🔹 Ventas últimos 7 días
    const [ventasSemana] = await db.query(`
      SELECT DATE(created_at) as fecha,
             SUM(total) as total
      FROM ventas
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      AND estado = 'ACTIVA'
      GROUP BY DATE(created_at)
      ORDER BY fecha ASC
    `);

    res.json({
      ventasHoy: ventasHoy[0].total,
      comprasHoy: comprasHoy[0].total,
      bajoStock: bajoStock[0].total,
      ventasSemana
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error dashboard" });
  }
});

module.exports = router;