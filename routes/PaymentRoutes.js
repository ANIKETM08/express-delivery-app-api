const express = require("express");
const requireSignIn = require("../middlewares/authMiddleware");
const orderModel = require("../models/orderModel");
const productModel = require("../models/ProductModel");
var braintree = require("braintree");
require("dotenv").config();

const router = express.Router();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.Merchant_ID,
  publicKey: process.env.Public_Key,
  privateKey: process.env.Private_Key,
});

//payment route
//payment gateway api
//token
router.get("/braintree/token", async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error); // Send the error as the response
  }
});

//payments
router.post("/braintree/payment", requireSignIn, async (req, res) => {
  try {
    const {nonce, cart} = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ok: true});
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
