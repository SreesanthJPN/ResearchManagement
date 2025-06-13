const express = require('express')
const llmController = require('../controllers/llmController')
const path = require('path')
const researchRouter = express.Router()

researchRouter.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'Templates', 'researchgap.html'))
})

researchRouter.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Templates', 'results.html'))
})

// researchRouter.get('/researchgap', llmController.researchGap)

module.exports = researchRouter