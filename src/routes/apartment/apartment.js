const express = require("express");
const route = express.Router();
const multer = require("multer");
const admin = require("firebase-admin");
const { verifyToken } = require("../../middlewares/authMiddleware");

const serviceAccount = require("../../utils/serviceAccount.json");
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
    const files = req.files;
    const owner = req.user.phone;
    const ownerName = req.user.name;
    const apartmentInfo = JSON.parse(req.body.info);
    const apartmentId = Date.now();
    const uploadedFiles = [];

    for (const file of files) {
      const blob = bucket.file(`${owner}/${apartmentId}-${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on("finish", () => {
        blob.makePublic();
        const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        uploadedFiles.push(publicURL);
        if (uploadedFiles.length === files.length) {
          const saveInfo = async () => {
            await Apartments.create({
              ...apartmentInfo,
              id: apartmentId,
              owner,
              name: ownerName,
              isArchived: false,
              images: uploadedFiles,
            });
          };
          saveInfo();
          return res.status(200).json({ message: "All files is uploaded" });
        }
      });
      blobStream.end(file.buffer);
    }
  } catch (error) {
    return res.status(500).json({ message: "Error during file uploading" });
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
