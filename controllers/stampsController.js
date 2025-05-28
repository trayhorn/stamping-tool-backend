const { listFilesInBucket, uploadFileIntoBucket } = require("../aws");
const { Stamp } = require("../model");
const fs = require("fs/promises");
const { HttpError, ctrlWrapper } = require("../helpers");

const getAllStamps = async (req, res) => {
  const result = await Stamp.find({}, "-createdAt -updatedAt");

  const urls = await listFilesInBucket();

  const withUrls = result.map((el, i) => {
    const obj = el.toObject();
    obj.url = urls[i];
    return obj;
  });

  res.status(200).json(withUrls);
}

const uploadStamp = async (req, res) => {
  const { path, originalname } = req.file;

  const duplicate = await Stamp.find({ stamp: originalname });
  if (duplicate) {
    throw HttpError(409, "Stamp with this name already exists");
  }

  await Stamp.create({ stamp: originalname });

  const url = await uploadFileIntoBucket({
    key: originalname,
    filePath: path,
  });

  await fs.unlink(path);

  res.status(201).json({
    message: "success",
    originalname,
    url,
  });
}

const ctrl = {
	getAllStamps: ctrlWrapper(getAllStamps),
	uploadStamp: ctrlWrapper(uploadStamp),
}

module.exports = ctrl;
