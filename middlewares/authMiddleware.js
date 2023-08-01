const jwt = require("jsonwebtoken");

// Middleware to check if the user is authenticated
const requireSignIn = async (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = requireSignIn;
