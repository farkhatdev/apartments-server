const express = require("express");
const { TempUsers, Users, Otps } = require("../../model/schema");
const sendOtp = require("../../controllers/sendingOtp");
const route = express.Router();

route.post("/", async (req, res) => {
  try {
    let { name, phone, password, confirmPasword } = req.body;

    phone = Number(phone);

    if (!name || !phone || !password || !confirmPasword)
      return res.status(400).json({ message: "Complete all inputs" });

    if (String(phone).length !== 12 || isNaN(Number(phone)))
      return res.status(400).json({ message: "Phone number is incorrect" });

    if (password !== confirmPasword)
      return res.status(400).json({ message: "Passwords aren't the same" });

    const checkPhoneNumber = await Users.findOne({ phone });
    await TempUsers.deleteOne({ phone });

    if (checkPhoneNumber)
      return res
        .status(400)
        .json({ message: "This phone number alrady exist" });

    await TempUsers.create({
      name,
      phone,
      password,
      acivate: false,
    });
    await sendOtp(phone);
    const otpData = await Otps.findOne({ phone });

    res.status(201).json({
      message: "We sent otp code",
      phone,
      expiredIn: otpData.expiredIn,
      otp: otpData.otp,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = route;
