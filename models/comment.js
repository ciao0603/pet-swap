const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
  shopId: {
    type: Number,
    required: true
  },
  productId: {
    type: Number,
    required: true
  },
  userId: {
    type: Number,
    required: true
  },
  userName: {
    type: String
  },
  score: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Comment', commentSchema)
