const { S3, ListObjectsCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs/promises");

const s3client = new S3({
	region: "eu-central-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const bucketName = "stamps-bucket-1715875501";

const listFilesInBucket = async () => {
  const command = new ListObjectsCommand({ Bucket: bucketName });
  const arr = [];
	const { Contents } = await s3client.send(command);
	for (const content of Contents) {
    const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: content.Key,
		});
    const url = await getSignedUrl(s3client, command, { expiresIn: 3600 });
    arr.push(url);
  }

  return arr;
};

const uploadFileIntoBucket = async ({ key, filePath }) => {
	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: key,
		Body: await fs.readFile(filePath),
		ContentType: "image/png",
	});

	await s3client.send(command);

	const getImageCommand = new GetObjectCommand({
		Bucket: bucketName,
		Key: key,
	});

	const url = await getSignedUrl(s3client, getImageCommand, {
		expiresIn: 3600,
	});
	return url;
};

const deleteObjectFromBucket = async (imageKey) => {
	const input = {
		Bucket: bucketName,
		Key: imageKey,
	};
	const command = new DeleteObjectCommand(input);
	const response = await s3client.send(command);
	return response;
}

module.exports = {
	listFilesInBucket,
	uploadFileIntoBucket,
	deleteObjectFromBucket,
};