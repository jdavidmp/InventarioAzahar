const express = require("express");
const router = express.Router();
const db = require('../config/db');
const auth = require('../middlewares/authMiddleware'); // 👈 IMPORTAMOS AUTH

// Crear venta (PROTEGIDA CON TOKEN)
router.post("/", auth, async (req, res) => {
    const { cliente_id, productos } = req.body;

    if (!cliente_id || !productos || productos.length === 0) {
        return res.status(400).json({ message: "Datos incompletos" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let total = 0;

        // Validar stock y calcular total
        for (let item of productos) {

            const [rows] = await connection.query(
                "SELECT precio_venta, stock_actual FROM productos WHERE id = ?",
                [item.producto_id]
            );

            if (rows.length === 0) {
                throw new Error("Producto no existe");
            }

            if (rows[0].stock_actual < item.cantidad) {
                throw new Error("Stock insuficiente");
            }

            total += rows[0].precio_venta * item.cantidad;
        }

        // Crear venta principal
        const [venta] = await connection.query(
            "INSERT INTO ventas (cliente_id, total, estado) VALUES (?, ?, 'ACTIVA')",
            [cliente_id, total]
        );

        const venta_id = venta.insertId;

        // Crear detalle + descontar stock
        for (let item of productos) {

            const [producto] = await connection.query(
                "SELECT precio_venta FROM productos WHERE id = ?",
                [item.producto_id]
            );

            const subtotal = producto[0].precio_venta * item.cantidad;

            await connection.query(
                `INSERT INTO detalle_ventas 
                 (venta_id, producto_id, cantidad, precio_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                  venta_id,
                  item.producto_id,
                  item.cantidad,
                  producto[0].precio_venta,
                  subtotal
                ]
                
            );

            await connection.query(
              `UPDATE productos
              SET stock_actual = stock_actual - ?
              WHERE id = ?`,
              [item.cantidad, item.producto_id]
            );
            
            await connection.query(
              `INSERT INTO movimientos_stock
              (producto_id, tipo, cantidad, motivo)
              VALUES (?, 'SALIDA', ?, 'Venta a cliente')`,
              [item.producto_id, item.cantidad]
            );
        }

        await connection.commit();

        res.json({
          message: "Venta registrada correctamente",
          venta_id,
          total
        });

    } catch (error) {

        await connection.rollback();
        console.error(error);

        res.status(500).json({
          message: error.message
        });

    } finally {

        connection.release();
    }
});

// Listar historial de ventas
router.get("/", async (req, res) => {
    try {
        const [ventas] = await db.query(`
            SELECT 
                v.id AS venta_id,
                v.total,
                v.created_at,
                v.estado,
                c.nombre AS cliente
            FROM ventas v
            JOIN clientes c ON v.cliente_id = c.id
            ORDER BY v.created_at DESC
        `);

        for (let venta of ventas) {
            const [detalles] = await db.query(`
                SELECT 
                    p.nombre,
                    d.cantidad,
                    d.precio_unitario,
                    d.subtotal
                FROM detalle_ventas d
                JOIN productos p ON d.producto_id = p.id
                WHERE d.venta_id = ?
            `, [venta.venta_id]);

            venta.detalle = detalles;
        }

        res.json(ventas);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener ventas" });
    }
});

/* ===========================
   POST /ventas/:id/anular
   Anular venta profesional
=========================== */
router.post('/:id/anular', auth, async (req, res) => {

  const connection = await db.getConnection();

  try {

    const { id } = req.params;

    //Iniciar transacción
    await connection.beginTransaction();

    //Verificar que la venta exista
    const [ventas] = await connection.query(
      'SELECT * FROM ventas WHERE id = ?',
      [id]
    );

    if (ventas.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    const venta = ventas[0];

    //Verificar que esté activa
    if (venta.estado === 'ANULADA') {
      await connection.rollback();
      return res.status(400).json({ message: 'La venta ya está anulada' });
    }

    //Obtener detalle de la venta
    const [detalles] = await connection.query(
      'SELECT * FROM detalle_ventas WHERE venta_id = ?',
      [id]
    );

    //Devolver stock producto por producto
    for (const item of detalles) {

      // Aumentar stock
      await connection.query(
        `UPDATE productos
         SET stock_actual = stock_actual + ?
         WHERE id = ?`,
        [item.cantidad, item.producto_id]
      );

      // Registrar movimiento
      await connection.query(
        `INSERT INTO movimientos_stock
         (producto_id, tipo, cantidad, motivo)
         VALUES (?, 'ENTRADA', ?, 'Anulación de venta')`,
        [item.producto_id, item.cantidad]
      );
    }

    //Cambiar estado de la venta
    await connection.query(
      `UPDATE ventas
       SET estado = 'ANULADA'
       WHERE id = ?`,
      [id]
    );

    //Confirmar todo
    await connection.commit();

    res.json({ message: 'Venta anulada correctamente' });

  } catch (error) {

    // Si algo falla, revertimos todo
    await connection.rollback();

    console.error(error);
    res.status(500).json({
      message: 'Error al anular la venta'
    });

  } finally {
    connection.release();
  }
});

module.exports = router;

