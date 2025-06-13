const {s3} = require('./s3Controller')
const {ListObjectsV2Command, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3')
const {extractMethodology} = require('./apiController')
const {readFiles} = require('./s3Controller')
const {getLLMResponse} = require('./llmController')
require('dotenv').config()

const getObjectsList = async (req, res)=>{
    const list = await s3.send(new ListObjectsV2Command({
    Bucket : process.env.BUCKET_NAME,
    Prefix : req.user.username.endsWith('/')
    ? req.user.username
    : req.user.username + '/'    }))
      console.log(req.user.username)
    const fileNames = list.Contents?.map(x => x.Key) ?? []
    res.json({files : fileNames})
    return fileNames
}

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

const getResearchGap = async (req, res) => {
  const folderPrefix = req.user.username.endsWith('/')
    ? req.user.username
    : req.user.username + '/';

  try {
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: folderPrefix,
    }));

    await s3.send(new PutObjectCommand({
      Bucket : process.env.BUCKET_NAME,
      Key : `${req.user.username}/Papers.txt`,
      Body : '',
      ContentType : 'text/plain'
    }))

    const fileKeys = list.Contents?.map(x => x.Key) ?? [];

    if (fileKeys.length === 0) {
      return res.status(404).json({ message: 'No files found.' });
    }

    // Process each PDF and extract content
    for (const key of fileKeys) {
      if (!key.endsWith('Papers.txt')) {
        await readFiles(req.user.username, key);
      }
    }

    // Read the final Papers.txt content
    const finalRes = await s3.send(new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `${req.user.username}/Papers.txt`
    }));

    const finalChunks = [];
    for await (const chunk of finalRes.Body) {
      finalChunks.push(chunk);
    }

    const fullText = Buffer.concat(finalChunks).toString('utf-8');

    if (!fullText.trim()) {
      return res.status(400).json({ message: 'No extractable text found in uploaded papers.' });
    }

    const llmResponse = await getLLMResponse(fullText);

    res.status(200).json({
      message: 'Processed all files and retrieved research gap.',
      researchGap: llmResponse
    });

  } catch (err) {
    console.error('Error in getResearchGap:', err);
    res.status(500).json({ error: 'Failed to process research papers.' });
  }
};



module.exports = {
    getObjectsList,
    getResearchGap
}