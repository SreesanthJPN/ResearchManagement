const download  = require('download');
const { fileURLToPath } = require('url');
const {appendFileSync, createReadStream, read} = require('fs')
const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, HeadObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const pdfparse = require('pdf-parse')
const {extractMethodology} = require('./apiController')
const multer = require('multer');
const authController = require('./authController');
const { type } = require('os');

require('dotenv').config();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3 = new S3Client({
  region: process.env.REGION, 
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY
  }
});

const uploadFileFromLinks = async function (paperLink, bucketName = process.env.BUCKET_NAME){
  const keyName = paperLink.split('/').pop()
  try {
    const fileStream = await download(`${paperLink}.pdf`);
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: keyName,
        Body: fileStream,
        ContentType: 'application/pdf'
      }
    });

  await upload.done()
  } catch (err) {
    console.error('Upload failed:', err);
  }
}

const listFiles = async function () {
  const Keys = []
  let continuationToken
  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME,
        ContinuationToken: continuationToken
      })
      const response = await s3.send(command)
      if (response.Contents) {
        response.Contents.forEach(x => {
          Keys.push(x.Key)
        })
      }

      continuationToken = response.NextContinuationToken

    } while (continuationToken)
    return Keys

  } catch (error) {
    console.error("Error listing files:", error)
    throw error
  }
}

const readFiles = async (username, Key) => {
  try {
    const res = await s3.send(new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key
    }));

    const chunks = [];
    for await (const chunk of res.Body) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Skip empty files
    if (!buffer || buffer.length === 0) {
      console.warn(`Skipping empty file: ${Key}`);
      return;
    }

    let data;
    try {
      data = await pdfparse(buffer);
    } catch (err) {
      console.error(`PDF parse failed for ${Key}:`, err.message);
      return;
    }

    const newText = `\n\n----- ${Key} -----\n${data.text}\n`;
    const extractedText = await extractMethodology(newText);

    const outKey = `${username}/Papers.txt`;
    let existingText = '';

    try {
      // Check if file exists
      await s3.send(new HeadObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: outKey
      }));

      // Read existing text
      const existingRes = await s3.send(new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: outKey
      }));

      const existingChunks = [];
      for await (const chunk of existingRes.Body) {
        existingChunks.push(chunk);
      }

      existingText = Buffer.concat(existingChunks).toString('utf-8');
    } catch (err) {
      if (err.name !== 'NotFound') {
        throw err;
      }
      // else: first time creation, leave existingText = ''
    }

    const combinedText = existingText + '\n\nNew Paper\n\n' + extractedText;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: outKey,
      Body: combinedText,
      ContentType: 'text/plain'
    }));

  } catch (err) {
    console.error(`Error in readFiles for ${Key}:`, err);
    throw err;
  }
};

const deleteObject = async (key)=>{
  params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key
  }
  try{
  s3.send(new DeleteObjectCommand(params))
}
catch(err){
  throw err
}
}

const createPapersText = async () => {
  const keys = await listFiles()
  for (const key of keys) {
    if (!key.endsWith('.txt')) {
      await readFiles(key)
      await deleteObject(key)
    }
  }}

const uploadLocalFiles = async (req, res)=>{
  const file = req.file
  if(file.originalname.split('.').pop() === 'pdf'){
  await s3.send(new PutObjectCommand({
    Bucket : process.env.BUCKET_NAME,
    Key : `${req.user.username}/${file.originalname}`,
    Body : file.buffer,
    ContentType : file.mimetype
  }))
  res.send(200).json({message: 'file uploaded'})
}
}


const deleteFiles = async (req, res) => {
  const fileName = req.body.fileName || req.query.fileName;

  if (!fileName) {
    return res.status(400).json({ message: "fileName is required" });
  }

  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `${req.user.username}/${fileName}`,
    }));
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete file", error: err.message });
  }
};

module.exports = {
  uploadFileFromLinks,
  createPapersText,
  s3,
  uploadLocalFiles,
  readFiles,
  deleteFiles
}