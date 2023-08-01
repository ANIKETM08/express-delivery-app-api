const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.db_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("connection sucessful"))
  .catch((error) => console.log(error));
