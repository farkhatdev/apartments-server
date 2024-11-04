const express = require("express");
const { verifyToken } = require("../../middlewares/authMiddleware");
const { Apartments } = require("../../model/schema");

const route = express.Router();

route.get("/", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const { phone } = user;
    const allApartments = await Apartments.find({ owner: phone });

    return res
      .status(200)
      .json({ message: "Your apartments", apartments: allApartments });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = route;
