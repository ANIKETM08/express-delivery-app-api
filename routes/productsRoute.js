const express = require("express");

// const Pizza = require("../models/pizzaModel");
const Products = require("../models/ProductModel");

const router = express.Router();

router.get("/getallproducts", async (req, res) => {
  try {
    const product = await Products.find({});
    res.send(product);
  } catch (err) {
    return res.status(400).json({message: err});
  }
});

module.exports = router;
