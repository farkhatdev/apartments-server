const { Otps } = require("../model/schema.js");

async function sendOtp(phone) {
  try {
    const otp = 100000 + Math.floor(Math.random() * 900000);

    const chechUserOtp = await Otps.findOne({ phone });

    if (chechUserOtp) {
      if (chechUserOtp.expiredIn < Date.now()) {
        return await Otps.updateOne(
          { phone },
          {
            otp,
            createdAt: Date.now(),
            expiredIn: Date.now() + 120000,
          }
        );
      }
    } else {
      return await Otps.create({
        phone,
        otp,
        createdAt: Date.now(),
        expiredIn: Date.now() + 120000,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendOtp;
