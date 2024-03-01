const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin/admin-controller')
const categoryController = require('../../controllers/admin/category-controller')

// * 使用者管理
router.get('/users', adminController.getUsers)
// * 商店管理
router.get('/shops', adminController.getShops)
// * 類別管理
// 取得所有分類
router.get('/categories', categoryController.getCategories)
// 新增主類別
router.post('/categories', categoryController.createCategory)
// 編輯 & 刪除主類別
router.route('/categories/:categoryId')
  .put(categoryController.editCategory)
  .delete(categoryController.deleteCategory)
// 新增主類別
router.post('/subCategories', categoryController.createSubCategory)
// 編輯 & 刪除主類別
router.route('/subCategories/:subCategoryId')
  .put(categoryController.editSubCategory)
  .delete(categoryController.deleteSubCategory)

router.use('/', (req, res) => {
  res.redirect('/admin/users')
})

module.exports = router
