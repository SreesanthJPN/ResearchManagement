const express = require('express')
const path = require('path')
const rootRouter = express.Router()

rootRouter.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'Templates', 'index.html'))
})

rootRouter.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname, '..', 'Templates', 'login.html'))
})

rootRouter.get('/signup', (req,res)=>{
    res.sendFile(path.join(__dirname, '..', 'Templates', 'signup.html'))
})

rootRouter.get('/dashboard', (req,res)=>{
    res.sendFile(path.join(__dirname, '..', 'Templates', 'dashboard.html'))
})

rootRouter.get('/test', (req,res)=>{
    res.sendFile(path.join(__dirname, '..', 'Templates', 'test.html'))
})

module.exports = rootRouter