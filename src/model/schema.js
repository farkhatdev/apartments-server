const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  acivate: { type: Boolean, required: true },
});

const tempUserSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  acivate: { type: Boolean, required: true },
});

const apartmentSchema = new Schema({
  id: { type: Number, required: true },
  owner: { type: String, required: true },
  name: { type: String, required: true },
  shortAddress: { type: String, required: true },
  fullAddress: { type: String, required: true },
  forWhom: { type: String, required: true },
  price: { type: String, required: true },
  rooms: { type: String, required: true },
  duration: { type: String, required: true },
  phone1: { type: String, required: true },
  phone2: { type: String, required: true },
  condition: { type: String, required: true },
  images: { type: Array, required: true },
  place: { type: Array, required: true },
  isArchived: { type: Boolean, required: true },
});

const otpSchema = new Schema({
  phone: { type: String, required: true },
  otp: { type: Number, required: true },
  createdAt: { type: Number, required: true },
  expiredIn: { type: Number, required: true },
});

const Users = model("users", userSchema);
const TempUsers = model("tempusers", tempUserSchema);
const Otps = model("otps", otpSchema);
const Apartments = model("apartments", apartmentSchema);

module.exports = { Users, TempUsers, Otps, Apartments };
