const express = require("express");
const jwt = require("jsonwebtoken");
const { Users } = require("../../model/schema");
const route = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

route.post("/", async (req, res) => {
  try {
    let { phone, password } = req.body;
    phone = Number(phone);
    if (!phone || !password)
      return res.status(400).json({ message: "Complete all inputs" });

    if (String(phone).length !== 12 || isNaN(Number(phone)))
      return res.status(400).json({ message: "Phone number is incorrect" });

    const user = await Users.findOne({ phone });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.password !== password)
      return res.status(400).json({ message: "Password in incorrect" });

    const accessToken = jwt.sign({ phone, name: user.name }, SECRET_KEY, {
      expiresIn: "7d",
    });

    res
      .status(200)
      .json({ message: "Successful logged in", token: accessToken });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = route;
