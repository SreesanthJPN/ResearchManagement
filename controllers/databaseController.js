const mongoose = require('mongoose')

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'Users',                      
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    }
}

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true },
  email:        { type: String, required: true },
  password:     { type: String, required: true },
  refreshToken: { type: String }
}, { collection: 'User_details' })

const model = mongoose.model('User', userSchema);


const createNewUser = async (username, email, password)=>{
    await ConnectDB()
    const newUserInstance = new model({
        username: username,
        email: email,
        password: password 
    })
    await newUserInstance.save()
}

const updateRefreshToken = async (username, refreshToken)=>{
  await ConnectDB()
  const record = await model.findOne({username : username})
  record.refreshToken = refreshToken
  await record.save()
}

const checkUsers = async (username) => {

  await ConnectDB()

  const user = await model.findOne({ username: username })

  if (user) {
    return true
  } else {
    return false
  }

}

const getRefreshToken = async (username)=>{
  const user = await model.findOne({username : username}, {refreshToken : 1, _id : 0})
  return user?.refreshToken
}

module.exports = {
    createNewUser,
    checkUsers,
    model, 
    updateRefreshToken,
    getRefreshToken
}