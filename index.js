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
app.use("/uploads", express.static("uploads"));
app.use("/auth/register", registerRoute);
app.use("/auth/login", loginRoute);
app.use("/auth/verify-code", verifyCodeRoute);
app.use("/apartment", apartmentRoute);
app.use("/my-profile", myProfileRoute);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting", error);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log("Server is running on", PORT);
    });
  } catch (error) {
    console.error("Error starting", error);
  }
};

startServer();
