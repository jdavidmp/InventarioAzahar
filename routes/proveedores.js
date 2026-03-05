const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middlewares/authMiddleware");

// 🔹 Obtener todos
router.get("/", auth, async (req, res) => {
  const [proveedores] = await db.query(
    "SELECT * FROM proveedores ORDER BY created_at DESC"
  );
  res.json(proveedores);
});

// 🔹 Crear proveedor
router.post("/", auth, async (req, res) => {
  const { nombre, telefono, email } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "Nombre obligatorio" });
  }

  await db.query(
    "INSERT INTO proveedores (nombre, telefono, email) VALUES (?, ?, ?)",
    [nombre, telefono, email]
  );

  res.json({ message: "Proveedor creado correctamente" });
});

// 🔹 Editar proveedor
router.put("/:id", auth, async (req, res) => {
  const { nombre, telefono, email } = req.body;
  const { id } = req.params;

  await db.query(
    `UPDATE proveedores 
     SET nombre = ?, telefono = ?, email = ?
     WHERE id = ?`,
    [nombre, telefono, email, id]
  );

  res.json({ message: "Proveedor actualizado" });
});

// 🔹 Eliminar proveedor
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM proveedores WHERE id = ?", [id]);
    res.json({ message: "Proveedor eliminado" });
  } catch (error) {
    res.status(400).json({
      message: "No se puede eliminar proveedor con compras registradas"
    });
  }
});

module.exports = router;