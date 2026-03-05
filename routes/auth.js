const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const router = express.Router();


// =========================
// REGISTRO
// =========================
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hashedPassword]
    );

    res.json({ message: 'Usuario registrado correctamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});


// =========================
// LOGIN
// =========================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;