const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
require("./src/controllers/sendingOtp.js");

// Routes
const registerRoute = require("./src/routes/auth/register.js");
const loginRoute = require("./src/routes/auth/login.js");
const verifyCodeRoute = require("./src/routes/auth/verify-code.js");
const apartmentRoute = require("./src/routes/apartment/apartment.js");
const myProfileRoute = require("./src/routes/profile/myProfile.js");

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth/register", registerRoute);
app.use("/auth/login", loginRoute);
app.use("/auth/verify-code", verifyCodeRoute);
app.use("/apartment", apartmentRoute);
app.use("/my-profile", myProfileRoute);

app.listen(PORT, () => {
  try {
    console.log("Server is running on", PORT);
    mongoose
      .connect(MONGODB_URL)
      .then(() => console.log("Connected to MongoDB"));
  } catch (error) {
    console.log(error);
  }
});
