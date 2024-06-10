const mongoose = require('mongoose')
require('dotenv').config()

const uri = process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI

mongoose.connect(uri)
const db = mongoose.connection

if (process.env.NODE_ENV !== 'test') {
  db.on('error', () => {
    console.log('MongoDB connect error !')
  })

  db.once('open', () => {
    console.log('MongoDB connected !')
  })
}

module.exports = db
