const { Schema, model } = require("mongoose");
const Joi = require("joi");

const stampsSchema = new Schema({
  stamp: {
    type: String,
    required: [true, "Stamp field is required"],
  }
}, { versionKey: false, timestamps: true });

const uploadStampSchema = Joi.object({
  stamp: Joi.string().required(),
})

const Stamp = model("stamps-image", stampsSchema);

module.exports = {
	Stamp,
	uploadStampSchema,
};