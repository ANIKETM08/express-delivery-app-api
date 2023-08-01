const mongoose = require("mongoose");

const order_schema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "products",
      },
    ],
    payment: {}, // Renamed from Payment to payment
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
    },
  },
  {timestamps: true}
);

const order_model = mongoose.model("order", order_schema);
module.exports = order_model;
