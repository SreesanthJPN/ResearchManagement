const dashController = require('../controllers/dashboardController')
const {authenticateToken} = require('../controllers/authController')
const express = require('express')

const dashRouter = express.Router()

dashRouter.get('/getFileNames',authenticateToken,dashController.getObjectsList)
dashRouter.get('/getGap',authenticateToken,dashController.getResearchGap)
module.exports = dashRouter