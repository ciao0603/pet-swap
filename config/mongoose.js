const mongoose = require('mongoose')
require('dotenv').config()

const uri = process.env.NODE_ENV ? process.env.MONGODB_URI : process.env.MONGODB_URI_TEST

mongoose.connect(uri)
const db = mongoose.connection

db.on('error', err => {
  console.log('MongoDB connect error !', err)
})

db.once('open', () => {
  console.log('MongoDB connected !')
})

module.exports = db
