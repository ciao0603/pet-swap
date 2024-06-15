const { expect } = require('chai')

const mongoose = require('mongoose')
require('../../config/mongoose')

describe('# Comment Model', () => {
  const CommentModel = require('../../models/comment')

  let Comment

  before(() => {
    Comment = CommentModel
  })

  after(() => {
    mongoose.connection.close()
  })

  // 檢查 model 的 CRUD
  context('# CRUD', () => {

    let data = null
    const commentData = {
      shopId: 1,
      productId: 1,
      userId: 1,
      score: 5
    }

    it('create', async () => {
      const comment = await Comment.create(commentData)
      data = comment
      expect(comment).to.exist
    })
    it('read', async () => {
      const comment = await Comment.findById(data.id)
      expect(data.id).to.be.equal(comment.id)
    })
    it('update', async () => {
      const comment = await Comment.findByIdAndUpdate(data.id, { score: 3 }, { new: true })
      expect(data.score).to.be.not.equal(comment.score)
    })
    it('delete', async () => {
      await Comment.findByIdAndDelete(data.id)
      const comment = await Comment.findById(data.id)
      expect(comment).to.be.equal(null)
    })
  })
})