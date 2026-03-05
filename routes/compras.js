const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middlewares/authMiddleware");

router.post("/", auth, async (req, res) => {
  const { proveedor_id, productos } = req.body;

  if (!proveedor_id || !productos || productos.length === 0) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let total = 0;

    for (let item of productos) {
      const [rows] = await connection.query(
        "SELECT precio_compra FROM productos WHERE id = ?",
        [item.producto_id]
      );

      if (rows.length === 0) {
        throw new Error("Producto no existe");
      }

      total += rows[0].precio_compra * item.cantidad;
    }

    const [compra] = await connection.query(
      "INSERT INTO compras (proveedor_id, total) VALUES (?, ?)",
      [proveedor_id, total]
    );

    const compra_id = compra.insertId;

    for (let item of productos) {
      const [producto] = await connection.query(
        "SELECT precio_compra FROM productos WHERE id = ?",
        [item.producto_id]
      );

      const subtotal = producto[0].precio_compra * item.cantidad;

      await connection.query(
        `INSERT INTO detalle_compras
        (compra_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [
          compra_id,
          item.producto_id,
          item.cantidad,
          producto[0].precio_compra,
          subtotal
        ]
      );

      // 🔥 AUMENTAR STOCK
      await connection.query(
        `UPDATE productos
         SET stock_actual = stock_actual + ?
         WHERE id = ?`,
        [item.cantidad, item.producto_id]
      );

      // 🔥 REGISTRAR MOVIMIENTO
      await connection.query(
        `INSERT INTO movimientos_stock
         (producto_id, tipo, cantidad, motivo)
         VALUES (?, 'ENTRADA', ?, 'Compra a proveedor')`,
        [item.producto_id, item.cantidad]
      );
    }

    await connection.commit();

    res.json({
      message: "Compra registrada correctamente",
      compra_id,
      total
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Listar historial de compras
router.get("/", async (req, res) => {
  try {

    const { proveedor, desde, hasta } = req.query;

    let query = `
      SELECT 
        c.id AS compra_id,
        c.proveedor_id,
        c.total,
        c.estado,
        c.created_at,
        p.nombre AS proveedor
      FROM compras c
      JOIN proveedores p ON c.proveedor_id = p.id
      WHERE 1=1
    `;

    const params = [];

    if (proveedor) {
      query += " AND p.id = ?";
      params.push(proveedor);
    }

    if (desde && hasta) {
      query += " AND DATE(c.created_at) BETWEEN ? AND ?";
      params.push(desde, hasta);
    }

    query += " ORDER BY c.created_at DESC";

    const [compras] = await db.query(query, params);

    for (let compra of compras) {
      const [detalles] = await db.query(`
        SELECT 
          pr.nombre,
          d.cantidad,
          d.precio_unitario,
          d.subtotal,
          d.producto_id
        FROM detalle_compras d
        JOIN productos pr ON d.producto_id = pr.id
        WHERE d.compra_id = ?
      `, [compra.compra_id]);

      compra.detalle = detalles;
    }

    res.json(compras);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener compras" });
  }
});

// Anular compra
router.post("/:id/anular", auth, async (req, res) => {

  const connection = await db.getConnection();

  try {

    const { id } = req.params;

    await connection.beginTransaction();

    const [compras] = await connection.query(
      "SELECT * FROM compras WHERE id = ?",
      [id]
    );

    if (compras.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    const compra = compras[0];

    if (compra.estado === "ANULADA") {
      await connection.rollback();
      return res.status(400).json({ message: "Compra ya anulada" });
    }

    const [detalles] = await connection.query(
      "SELECT * FROM detalle_compras WHERE compra_id = ?",
      [id]
    );

    for (let item of detalles) {

      // 🔥 DESCONTAR STOCK
      await connection.query(
        `UPDATE productos
         SET stock_actual = stock_actual - ?
         WHERE id = ?`,
        [item.cantidad, item.producto_id]
      );

      // 🔥 Registrar movimiento
      await connection.query(
        `INSERT INTO movimientos_stock
         (producto_id, tipo, cantidad, motivo)
         VALUES (?, 'SALIDA', ?, 'Anulación de compra')`,
        [item.producto_id, item.cantidad]
      );
    }

    await connection.query(
      "UPDATE compras SET estado = 'ANULADA' WHERE id = ?",
      [id]
    );

    await connection.commit();

    res.json({ message: "Compra anulada correctamente" });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Error al anular compra" });
  } finally {
    connection.release();
  }
});

module.exports = router;