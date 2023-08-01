const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/userRegister");
const orderModel = require("../models/orderModel");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const requireSignIn = require("../middlewares/authMiddleware");
const {error} = require("console");
const product_model = require("../models/ProductModel");

const router = express.Router();
router.use(cookieParser());

require("dotenv").config();

router.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: password,
      cpassword: cpassword,
      answer: req.body.answer,
      address: req.body.address,
    });

    // Check if user already exists
    const existingUser = await User.findOne({email: req.body.email});

    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User already registered",
      });
    }

    // Register the user
    const registeredUser = await newUser.save();

    return res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      registeredUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in registration",
      error: err.message,
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email: email});
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No user Found",
      });
    }
    //check if password is match
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign(
        {email: user.email, id: user._id, name: user.name},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
      );
      res.status(200).send({
        success: true,
        message: "login Successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
        token,
      });
    }
    if (!match) {
      res.status(200).send({
        success: false,
        message: "pasword does not match",
      });
    }
  } catch (error) {
    res.status(400).send("invalid details");
  }
});

//protected route

router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ok: true});
});

//forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const {email, answer, newPassword} = req.body;

    if (!email) {
      res.status(400).send({
        message: "Email is required",
      });
    }
    if (!answer) {
      res.status(400).send({
        message: "answer is required",
      });
    }
    if (!newPassword) {
      res.status(400).send({
        message: "New Password is required",
      });
    }

    //check email and answer
    const user = await User.findOne({email: email, answer: answer});
    //validate
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong email or answer",
      });
    }

    const hashPassword = async (newPassword) => {
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        return hashedPassword;
      } catch (err) {
        console.log(err);
      }
    };

    const hash = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, {password: hash});
    res.status(200).send({
      success: true,
      message: "password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
});

//update profile

router.put("/profile", requireSignIn, async (req, res) => {
  try {
    const {name, email, phone, password, address} = req.body;

    //check email and answer
    const user = await User.findOne({email: email});

    const hashedPassword = async (password) => {
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
      } catch (err) {
        console.log(err);
      }
    };

    const hash = await hashedPassword(password);
    await User.findByIdAndUpdate(user._id, {
      name: name,
      phone: phone,
      password: hash,
      address: address,
    });
    res.status(200).send({
      success: true,
      message: "details updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while updating",
    });
  }
});

//orders

router.get("/orders", requireSignIn, async (req, res) => {
  try {
    const orders = await orderModel
      .find({buyer: req.user._id})
      .populate("products")
      .populate("buyer");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting orders",
    });
  }
});

//search controller

router.get("/search/:keyword", async (req, res) => {
  try {
    const {keyword} = req.params;
    const result = await product_model
      .find({
        $or: [
          {name: {$regex: keyword, $options: "i"}},
          {description: {$regex: keyword, $options: "i"}},
        ],
      })
      .select("-photo");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in search product API",
    });
  }
});

module.exports = router;
