const express = require('express')
const path  = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3500

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname,'Templates')))
app.use(cors())
app.use(cookieParser())

app.use('/getResearchGap', require('./Routes/GetResearchGap'))
app.use('/', require('./Routes/indexRouter'))
app.use('/auth', require('./Routes/Authentication'))
app.use('/files', require('./Routes/manageFiles'))
app.use('/dash', require('./Routes/dashboard'))
app.listen(PORT, ()=>{
})