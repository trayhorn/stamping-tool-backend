const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const ctrl = require('./controllers/stampsController');

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

app.get("/stamps", ctrl.getAllStamps);

app.post("/stamp/upload", upload.single("stamp"), ctrl.uploadStamp);

app.delete("/stamp/delete/:id", ctrl.deleteStamp);

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json(message);
});

module.exports = { app };