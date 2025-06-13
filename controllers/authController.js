const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {PutObjectCommand, GetObjectCommand, S3Client} = require('@aws-sdk/client-s3')
const dbController = require('./databaseController')
require('dotenv').config()

const s3 = new S3Client({
  region: process.env.REGION, 
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY
  }
});

const authenticateToken = async (req, res, next)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token) return res.status(401).json({ message: 'Access token missing' })
    jwt.verify(token, process.env.JWT_KEY,(err, user)=>{
        if (err) return res.status(403).json({ message: 'Token is invalid or expired', user :   `${user}` })
        req.user = user
        next()
    })
}

const handleSignUp = async (req, res)=>{
    const username = req.body.username
    const password = req.body.password
    const emailid = req.body.emailid
    
    try {
        if(await dbController.checkUsers(username)){
            return res.status(403).json({message: "User already exists"})
        }

        // Create S3 bucket folder for user
        await s3.send(new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: `${username}/`
        }))

        // Hash password and create user
        const passHash = await bcrypt.hash(password, 3)
        await dbController.createNewUser(username, emailid, passHash)
        
        res.status(200).json({message: "User created successfully"})
    }
    catch(err){
        console.error('Signup error:', err)
        res.status(500).json({message: "Error creating user"})
    }
}

const handleLogin = async (req, res)=>{
    const username = req.body.username
    const password = req.body.password
    console.log(username, password)
    if(await dbController.checkUsers(username)){
       const record = await dbController.model.findOne({username : username}, {password : 1, _id : 0})
       console.log(record)
       const passHash = record?.password
       const isMatch = await bcrypt.compare(password, passHash)
       if(isMatch){
        const payLoad = {
            username : username
        }
        const accessToken = jwt.sign(payLoad, process.env.JWT_KEY, {expiresIn : '12h'})
        const refreshToken = jwt.sign(payLoad, process.env.REFRESH_KEY, {expiresIn : '1d'})
        await dbController.updateRefreshToken(username, refreshToken)
        res.status(200).json({accessToken, refreshToken})
       }
       else{
        res.status(401).json({ message: 'Invalid password' });
       }
    }
    else{
        res.status(409).json({message : 'Invalid Creds'})
    }
}

const handleRefresh = async (req, res)=>{
    const refreshToken = req.body.refreshToken
    if(!refreshToken) return res.status(401).json({message : 'Refresh token is missing'});
    
    try{
        const verify = jwt.verify(refreshToken, process.env.REFRESH_KEY);
        const username = verify.username;

        const usersToken = await dbController.getRefreshToken(username);
        if(usersToken != refreshToken){
            return res.status(403).json({message : 'Token revoked'});
        }

        const newAccessToken = jwt.sign({username}, process.env.JWT_KEY, {expiresIn : '12h'});
        const newRefreshToken = jwt.sign({username}, process.env.REFRESH_KEY, {expiresIn : '1d'});

        await dbController.updateRefreshToken(username, newRefreshToken);

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
    catch(err){
        if(err.name==='TokenExpiredError'){
            return res.status(401).json({message : 'Token Expired'});
        }
        res.status(403).json({message : 'Invalid Token'});
    }
}

const handleLogout = async (req, res) => {
    // Clear the cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
    handleSignUp,
    handleLogin,
    authenticateToken,
    handleRefresh,
    handleLogout
}