const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Token is not found" });

    const accessToken = token.split(" ")[1];
    const decoded = jwt.verify(accessToken, SECRET_KEY);

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token expired" });
  }
};

module.exports = { verifyToken };
