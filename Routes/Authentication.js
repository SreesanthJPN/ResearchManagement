const express = require('express')
const authController = require('../controllers/authController')
const authRouter = express.Router()

authRouter.post('/signUp', authController.handleSignUp)
authRouter.post('/logIn', authController.handleLogin)
authRouter.post('/logOut', authController.handleLogout)
authRouter.post('/handleRefresh', authController.handleRefresh)

module.exports = authRouter