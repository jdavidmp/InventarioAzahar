const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middlewares/authMiddleware');

/* ===========================
   GET /productos
   Listar inventario
=========================== */
router.get('/', auth, async (req, res) => {
  try {
    const [productos] = await db.query(
      'SELECT * FROM productos'
    );

    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al obtener productos'
    });
  }
});

/* ===========================
   POST /productos
   Crear producto
=========================== */
router.post('/', auth, async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      precio_compra,
      precio_venta,
      stock_actual,
      fecha_vencimiento
    } = req.body;

    if (!nombre || !categoria || !precio_compra || !precio_venta) {
      return res.status(400).json({
        message: 'Todos los campos obligatorios deben ser enviados'
      });
    }

    const [result] = await db.query(
      `INSERT INTO productos
      (nombre, categoria, precio_compra, precio_venta, stock_actual, fecha_vencimiento)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        categoria,
        precio_compra,
        precio_venta,
        stock_actual || 0,
        fecha_vencimiento || null
      ]
    );

    res.status(201).json({
      message: 'Producto creado correctamente',
      producto_id: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al crear producto'
    });
  }
});

/* ===========================
   POST /productos/entrada
   Compra / ingreso de stock
=========================== */
router.post('/entrada', auth, async (req, res) => {
  try {
    const { producto_id, cantidad, motivo } = req.body;

    if (!producto_id || !cantidad || cantidad <= 0) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    await db.query(
      `INSERT INTO movimientos_stock (producto_id, tipo, cantidad, motivo)
       VALUES (?, 'ENTRADA', ?, ?)`,
      [producto_id, cantidad, motivo || 'Compra']
    );

    await db.query(
      `UPDATE productos
       SET stock_actual = stock_actual + ?
       WHERE id = ?`,
      [cantidad, producto_id]
    );

    res.json({ message: 'Stock agregado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en entrada de stock' });
  }
});

/* ===========================
   POST /productos/salida
   Venta / salida de stock
=========================== */
router.post('/salida', auth, async (req, res) => {
  try {
    const { producto_id, cantidad, motivo } = req.body;

    if (!producto_id || !cantidad || cantidad <= 0) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    const [productos] = await db.query(
      'SELECT stock_actual FROM productos WHERE id = ?',
      [producto_id]
    );

    if (productos.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const stockActual = productos[0].stock_actual;

    if (stockActual < cantidad) {
      return res.status(400).json({
        message: 'Stock insuficiente para realizar la venta'
      });
    }

    await db.query(
      `INSERT INTO movimientos_stock (producto_id, tipo, cantidad, motivo)
       VALUES (?, 'SALIDA', ?, ?)`,
      [producto_id, cantidad, motivo || 'Venta']
    );

    await db.query(
      `UPDATE productos
       SET stock_actual = stock_actual - ?
       WHERE id = ?`,
      [cantidad, producto_id]
    );

    res.json({ message: 'Venta registrada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar la venta' });
  }
});

/* ===========================
   PUT /productos/:id
   Editar producto
=========================== */
router.put('/:id', auth, async (req, res) => {
  try {

    //Obtenemos el ID desde la URL
    const { id } = req.params;

    //Obtenemos los datos nuevos desde el body
    const {
      nombre,
      categoria,
      precio_compra,
      precio_venta,
      stock_actual,
      fecha_vencimiento
    } = req.body;

    //Validamos campos obligatorios
    if (!nombre || !categoria || !precio_compra || !precio_venta) {
      return res.status(400).json({
        message: 'Campos obligatorios faltantes'
      });
    }

    //Ejecutamos el UPDATE en la base de datos
    const [result] = await db.query(
      `UPDATE productos
      SET nombre = ?,
          categoria = ?,
          precio_compra = ?,
          precio_venta = ?,
          stock_actual = ?,
          fecha_vencimiento = ?
      WHERE id = ?`,
      [
        nombre,
        categoria,
        precio_compra,
        precio_venta,
        stock_actual,
        fecha_vencimiento || null,
        id
      ]
    );

    //Verificamos si el producto existía
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    //Respondemos éxito
    res.json({
      message: 'Producto actualizado correctamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al actualizar producto'
    });
  }
});

/* ===========================
   DELETE /productos/:id
   Eliminar producto
=========================== */
router.delete('/:id', auth, async (req, res) => {
  try {

    const { id } = req.params;

    //Verificamos si el producto existe
    const [producto] = await db.query(
      'SELECT * FROM productos WHERE id = ?',
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    //Eliminamos el producto
    await db.query(
      'DELETE FROM productos WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Producto eliminado correctamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al eliminar producto'
    });
  }
});

module.exports = router;
