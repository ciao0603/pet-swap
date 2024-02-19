const { User, Product } = require('../models')
const Comment = require('../models/comment')

const commentController = {
  postComment: async (req, res, next) => {
    try {
      const { productId } = req.params
      const { score, comment } = req.body
      const product = await Product.findByPk(productId, { include: [User], nest: true })
      const data = product.dataValues
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

      req.flash('success_msg', '評價成功! 可至歷史訂單查看')
      res.redirect('back')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = commentController
