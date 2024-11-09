const express = require("express");
const route = express.Router();
const multer = require("multer");
const admin = require("firebase-admin");
const { verifyToken } = require("../../middlewares/authMiddleware");

const serviceAccount = require("../../utils/apartments-d014c-firebase-adminsdk-k88eo-e80f604b04.json");
const { Apartments } = require("../../model/schema");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
  storageBucket: process.env.STOREAGE_BUCKET,
});
const bucket = admin.storage().bucket();
const storage = multer.memoryStorage();
const upload = multer({ storage });

route.get("/", verifyToken, async (req, res) => {
  try {
    const allApartments = await Apartments.find({ isArchived: false }).sort({
      _id: -1,
    });
    return res
      .status(200)
      .json({ message: "All apartments there", data: allApartments });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
});

route.post("/", verifyToken, upload.array("images", 6), async (req, res) => {
  try {
    const uploadedFiles = [];
    const files = req.files;
    const apartmentInfo = JSON.parse(req.body.info);

    const ID = Date.now();

    let { phone, name } = req.user;

    phone = Number(phone);

    files.map(async (file) => {
      const blob = bucket.file(`${Number(phone)}/${ID}-${file.originalname}`);

      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
      blobStream.on("error", (error) => {
        console.log(error);
        res.status(500).json({ message: "Error during file uploading" });
      });
      blobStream.on("finish", () => {
        blob.makePublic();
        const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        uploadedFiles.push(publicURL);
        if (uploadedFiles.length === files.length) {
          const saveInfo = async () => {
            await Apartments.create({
              ...apartmentInfo,
              id: ID,
              owner: phone,
              name,
              isArchived: false,
              images: uploadedFiles,
            });
          };
          saveInfo();
          return res.status(200).json({ message: "All files is uploaded" });
        }
      });
      blobStream.end(file.buffer);
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

route.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    await Apartments.deleteOne({ id });
    return res.status(200).json({ message: "Apartment successful deleted" });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
});

// Archive and unarchive

route.put("/archive/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    const phone = String(req.user.phone);

    const action = req.body.action;

    await Apartments.findOneAndUpdate({ id }, { isArchived: action });
    const allApartments = await Apartments.find({ owner: phone });

    return res.status(200).json({
      message: "Apartment successful archived",
      data: allApartments,
    });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
});

// Update apartment

module.exports = route;
