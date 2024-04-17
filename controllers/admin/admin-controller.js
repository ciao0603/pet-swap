const adminService = require('../../services/admin/admin-service')

const adminController = {
  // 取得使用者清單
  getUsers: (req, res, next) => {
    adminService.getUsers(req, (err, data) => err ? next(err) : res.render('admin/users', data))
  },
  // 取得商店清單
  getShops: (req, res, next) => {
    adminService.getShops(req, (err, data) => err ? next(err) : res.render('admin/shops', data))
  }
}

module.exports = adminController
