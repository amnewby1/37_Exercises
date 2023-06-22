/** Routes for invoices*/

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { id, name, description } = req.body;
    const results = await db.query(
      "INSERT INTO invoices (id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description",
      [id, name, description]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;

    // Check if the invoice exists before updating
    const checkinvoice = await db.query("SELECT * FROM invoices WHERE id=$1", [
      id,
    ]);
    if (checkinvoice.rows.length === 0) {
      throw new ExpressError(`Can't update invoice with id of ${id}`, 404);
    }

    const results = await db.query(
      "UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, amt",
      [amt, id]
    );

    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const results = db.query("DELETE FROM invoices WHERE id = $1", [
      req.params.id,
    ]);
    return res.send({ msg: "DELETED!" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
