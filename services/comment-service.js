const { User, Product } = require('../models')
const Comment = require('../models/comment')

const commentService = {
  // 創建評論
  postComment: async (req, cb) => {
    try {
      const { productId } = req.params
      const { score, comment } = req.body
      const product = await Product.findByPk(productId, { include: [User], nest: true })
      const data = product.dataValues

      // 若非買家的帳號不可評價
      if (req.user.id !== product.buyerUserId) throw new Error('您沒有評價此商品的權限!')

      // 紀錄評價
      await Comment.create({
        productId,
        userId: data.buyerUserId,
        shopId: data.shopId,
        userName: data.User.dataValues.name,
        score,
        comment
      })
      // 將商品更新為"已評價"
      await product.update({ isCommented: true })

      cb(null)
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = commentService
