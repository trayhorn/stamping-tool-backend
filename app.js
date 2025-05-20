const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");
const {Stamp} = require("./model");
require("dotenv").config();

const app = express();

const uploadDir = path.join(process.cwd(), "temp");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

app.use(express.static("public/stamps"));

app.get("/stamps", async (req, res, next) => {
  const result = await Stamp.find({}, "-createdAt -updatedAt");

  res.status(200).json(result);
})

app.post("/stamp/upload", upload.single('stamp'), async (req, res, next) => {
  const { path: tempPath, originalname } = req.file;

  const newPath = path.join(__dirname, "public", "stamps", originalname);

  await fs.rename(tempPath, newPath);

  await Stamp.create({ stamp: originalname });

  res.status(201).json({
    message: "success",
    originalname
  });
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = { app };