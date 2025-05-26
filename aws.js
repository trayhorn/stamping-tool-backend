const { S3, ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3({
	region: "eu-central-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const listFilesInBucket = async ({ bucketName }) => {
  const command = new ListObjectsCommand({ Bucket: bucketName });
  const arr = [];
	const { Contents } = await s3.send(command);
	for (const content of Contents) {
    const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: content.Key,
		});
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    arr.push(url);
  }

  return arr;
};

module.exports = { listFilesInBucket };