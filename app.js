const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");
const {Stamp} = require("./model");
require("dotenv").config();

const { listFilesInBucket } = require("./aws");

const app = express();

const uploadDir = path.join(process.cwd(), "temp");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });



app.use(cors());
app.use(express.json());

app.use(express.static("public/stamps"));

app.get("/stamps", async (req, res, next) => {
  const result = await Stamp.find({}, "-createdAt -updatedAt");

  const urls = await listFilesInBucket({ bucketName: "stamps-bucket-1715875501" });
  console.log(urls);

  const withUrls = result.map((el, i) => {
		const obj = el.toObject();
		obj.url = urls[i];
		return obj;
	});

  res.status(200).json(withUrls);
})

app.post("/stamp/upload", upload.single('stamp'), async (req, res, next) => {
  console.log(req.file);
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