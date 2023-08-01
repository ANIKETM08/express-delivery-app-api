const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
require("./db/db");
const user_register = require("./models/userRegister");
const product_model = require("./models/ProductModel");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config();
const PORT = process.env.PORT || 8000;

const productsRoute = require("./routes/productsRoute");
const userRoute = require("./routes/userRoute");
const PaymentRoute = require("./routes/PaymentRoutes");

app.use(
  cors({
    origin: [process.env.FE_URL],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);

//middleware
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({extended: false}));
app.use("/api/product/", productsRoute);
app.use("/api/user/", userRoute);
app.use("/api/products/", PaymentRoute);

app.use(express.static(path.join(__dirname, "./client/public")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
