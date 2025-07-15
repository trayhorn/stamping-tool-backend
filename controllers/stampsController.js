const { listFilesInBucket, uploadFileIntoBucket, deleteObjectFromBucket } = require("../aws");
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

  if (duplicate.length !== 0) {
    throw HttpError(409, "Stamp with this name already exists");
  }

  const { _id } = await Stamp.create({ stamp: originalname });

  const url = await uploadFileIntoBucket({
    key: originalname,
    filePath: path,
  });

  await fs.unlink(path);

  res.status(201).json({
    message: "success",
    _id,
    originalname,
    url,
  });
}

const deleteStamp = async (req, res) => {
  const { id } = req.params;

  const stampImage = await Stamp.findById(id);
  if (!stampImage) throw HttpError(400, "No such stamp");

  await Stamp.findByIdAndDelete(id);
  await deleteObjectFromBucket(stampImage.stamp);

  res.status(200).json({
    message: "success",
  });
}

const ctrl = {
	getAllStamps: ctrlWrapper(getAllStamps),
	uploadStamp: ctrlWrapper(uploadStamp),
	deleteStamp: ctrlWrapper(deleteStamp),
};

module.exports = ctrl;
