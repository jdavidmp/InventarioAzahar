const express = require("express");
const PDFDocument = require("pdfkit");
const db = require("../config/db");

const router = express.Router();


// REPORTE DE VENTAS
router.get("/ventas", async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    const fechaDesde = desde || "2000-01-01";
    const fechaHasta = hasta || "2100-12-31";

    const [ventas] = await db.query(`
      SELECT 
        v.id,
        v.total,
        v.estado,
        v.created_at,
        c.nombre AS cliente
      FROM ventas v
      JOIN clientes c ON v.cliente_id = c.id
      WHERE DATE(v.created_at) BETWEEN ? AND ?
      ORDER BY v.created_at ASC
    `, [fechaDesde, fechaHasta]);

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_ventas.pdf");

    doc.pipe(res);

    // ===== TÍTULO =====
    doc.fontSize(18).text("REPORTE DE VENTAS", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Desde: ${fechaDesde}`);
    doc.text(`Hasta: ${fechaHasta}`);
    doc.moveDown(2);

    // ===== ENCABEZADOS =====
    let y = doc.y;

    doc.font("Helvetica-Bold");
    doc.text("N°", 40, y);
    doc.text("Cliente", 80, y);
    doc.text("Fecha", 250, y);
    doc.text("Estado", 350, y);
    doc.text("Total", 430, y);

    doc.moveDown();
    doc.font("Helvetica");

    let totalGeneral = 0;

    ventas.forEach((venta) => {
      y = doc.y;

      doc.text(venta.id.toString(), 40, y);
      doc.text(venta.cliente, 80, y);
      doc.text(new Date(venta.created_at).toLocaleDateString(), 250, y);
      doc.text(venta.estado, 350, y);
      doc.text(`$${Number(venta.total).toLocaleString()}`, 430, y);

      totalGeneral += Number(venta.total);

      doc.moveDown();
    });

    doc.moveDown(2);
    doc.font("Helvetica-Bold");
    doc.text(
      `TOTAL GENERAL: $${totalGeneral.toLocaleString()}`,
      { align: "right" }
    );

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generando reporte de ventas" });
  }
});


// REPORTE DE COMPRAS
router.get("/compras", async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    const fechaDesde = desde || "2000-01-01";
    const fechaHasta = hasta || "2100-12-31";

    const [compras] = await db.query(`
      SELECT 
        c.id,
        c.total,
        c.estado,
        c.created_at,
        p.nombre AS proveedor
      FROM compras c
      JOIN proveedores p ON c.proveedor_id = p.id
      WHERE DATE(c.created_at) BETWEEN ? AND ?
      ORDER BY c.created_at ASC
    `, [fechaDesde, fechaHasta]);

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_compras.pdf");

    doc.pipe(res);

    // ===== TÍTULO =====
    doc.fontSize(18).text("REPORTE DE COMPRAS", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Desde: ${fechaDesde}`);
    doc.text(`Hasta: ${fechaHasta}`);
    doc.moveDown(2);

    // ===== ENCABEZADOS =====
    let y = doc.y;

    doc.font("Helvetica-Bold");
    doc.text("N°", 40, y);
    doc.text("Proveedor", 80, y);
    doc.text("Fecha", 250, y);
    doc.text("Estado", 350, y);
    doc.text("Total", 430, y);

    doc.moveDown();
    doc.font("Helvetica");

    let totalGeneral = 0;

    compras.forEach((compra) => {
      y = doc.y;

      doc.text(compra.id.toString(), 40, y);
      doc.text(compra.proveedor, 80, y);
      doc.text(new Date(compra.created_at).toLocaleDateString(), 250, y);
      doc.text(compra.estado, 350, y);
      doc.text(`$${Number(compra.total).toLocaleString()}`, 430, y);

      totalGeneral += Number(compra.total);

      doc.moveDown();
    });

    doc.moveDown(2);
    doc.font("Helvetica-Bold");
    doc.text(
      `TOTAL GENERAL: $${totalGeneral.toLocaleString()}`,
      { align: "right" }
    );

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generando reporte de compras" });
  }
});

module.exports = router;
