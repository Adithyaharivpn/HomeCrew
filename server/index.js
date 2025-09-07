const express = require('express')
const cors = require('cors')
var dotenv = require('dotenv')
require('./database')
dotenv.config()

const authRoutes = require('./routes/auth')

const port = process.env.port || 8080

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.send('College Project API Server - Running!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
