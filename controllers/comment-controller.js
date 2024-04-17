const commentService = require('../services/comment-service')

const commentController = {
  // 創建評論
  postComment: (req, res, next) => {
    commentService.postComment(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '評價成功! 可至歷史訂單查看')
      res.redirect('back')
    })
  }
}

module.exports = commentController
