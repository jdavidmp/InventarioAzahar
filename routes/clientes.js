const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middlewares/authMiddleware');

/* ===========================
   POST /clientes
   Crear cliente
=========================== */
router.post('/', auth, async (req, res) => {
  try {
    const { nombre, tipo, telefono, email } = req.body;

    if (!nombre || !tipo) {
      return res.status(400).json({ message: 'Nombre y tipo son obligatorios' });
    }

    const [result] = await db.query(
      `INSERT INTO clientes (nombre, tipo, telefono, email)
       VALUES (?, ?, ?, ?)`,
      [nombre, tipo, telefono || null, email || null]
    );

    res.status(201).json({
      message: 'Cliente creado correctamente',
      cliente_id: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
});

/* ===========================
   GET /clientes
   Listar clientes
=========================== */
router.get('/', auth, async (req, res) => {
  try {
    const [clientes] = await db.query('SELECT * FROM clientes');
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
});

/* ===========================
   PUT /clientes/:id
   Editar cliente
=========================== */
router.put('/:id', auth, async (req, res) => {
  try {
    const { nombre, tipo, telefono, email } = req.body;
    const { id } = req.params;

    if (!nombre || !tipo) {
      return res.status(400).json({ message: 'Nombre y tipo son obligatorios' });
    }

    await db.query(
      `UPDATE clientes 
       SET nombre = ?, tipo = ?, telefono = ?, email = ?
       WHERE id = ?`,
      [nombre, tipo, telefono || null, email || null, id]
    );

    res.json({ message: 'Cliente actualizado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
});

/* ===========================
   DELETE /clientes/:id
   Eliminar cliente
=========================== */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      'DELETE FROM clientes WHERE id = ?',
      [id]
    );

    res.json({ message: 'Cliente eliminado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
});

module.exports = router;