const express = require('express')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const fileManager = require('../controllers/s3Controller')
const {authenticateToken} = require('../controllers/authController')
const fileRouter = express.Router()
const path = require('path')

fileRouter.route('/')
.get((req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'test.html'))
})
fileRouter.post('/uploadFile', authenticateToken, upload.single('file'), fileManager.uploadLocalFiles)
fileRouter.post('/uploadLocalFiles', authenticateToken, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    for (const file of req.files) {
      if (file.originalname.split('.').pop() === 'pdf') {
        await fileManager.uploadLocalFiles({ ...req, file }, res, true);
      }
    }
    
    res.status(200).json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
})
fileRouter.post('/deleteFile',authenticateToken,fileManager.deleteFiles)

module.exports = fileRouter