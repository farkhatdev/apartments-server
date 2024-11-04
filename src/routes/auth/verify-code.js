const express = require("express");
const { Otps, TempUsers, Users } = require("../../model/schema");
const jwt = require("jsonwebtoken");
const route = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

route.post("/", async (req, res) => {
  try {
    let { phone, verifyCode } = req.body;

    phone = Number(phone);

    const user = await Otps.findOne({ phone });
    if (!user) return res.status(404).json({ message: "OTP not found" });

    const { otp, expiredIn } = user;

    const OTP = String(otp);

    if (OTP !== verifyCode)
      return res.status(400).json({ message: "OTP is incorect" });

    if (expiredIn < Date.now())
      return res.status(410).json({ message: "OTP has expired" });

    const tempusers = await TempUsers.findOneAndDelete({ phone });

    const { name, password } = tempusers;

    const accessToken = jwt.sign({ phone, name }, SECRET_KEY, {
      expiresIn: "7d",
    });

    await Users.create({
      name,
      phone: tempusers.phone,
      password,
      acivate: true,
    });
    res
      .status(200)
      .json({ message: "You are successful registered", token: accessToken });

    await Otps.deleteOne({ phone });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = route;
