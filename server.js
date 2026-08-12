const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')

const upload = require("./config/multer");
const cloudinary = require("./config/cloudinary.js");

const PORT = process.env.PORT ? process.env.PORT : "3000"

const authCtrl = require('./controllers/auth')
const vehicleCtrl = require('./controllers/vehicles')
const serviceCtrl = require('./controllers/serviceRecords')

const verifyToken = require('./middleware/verify-token')

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}. 🥭`)
})

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => { res.send("GearHead's Backend is ONLINE!") })
app.post('/auth/sign-up', authCtrl.signUp)
app.post('/auth/sign-in', authCtrl.signIn)

app.post('/vehicles', verifyToken, upload.single("image"), vehicleCtrl.create)
app.get('/vehicles', verifyToken, vehicleCtrl.index)
app.get('/vehicles/:vehicleId', verifyToken, vehicleCtrl.show)
app.put('/vehicles/:vehicleId', verifyToken, upload.single("image"), vehicleCtrl.update)
app.delete('/vehicles/:vehicleId', verifyToken, vehicleCtrl.deleteVehicle)

app.post('/vehicles/:vehicleId/service-records', verifyToken, serviceCtrl.create)
app.put('/vehicles/:vehicleId/service-records/:recordId', verifyToken, serviceCtrl.update)
app.delete('/vehicles/:vehicleId/service-records/:recordId', verifyToken, serviceCtrl.deleteRecord)

app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}! 😀`)
})
