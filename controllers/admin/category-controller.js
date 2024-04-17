const categoryService = require('../../services/admin/category-service')

const categoryController = {
  // 取得主類別及各自的子類別
  getCategories: (req, res, next) => {
    categoryService.getCategories(req, (err, data) => err ? next(err) : res.render('admin/categories', data))
  },
  // 新增主類別
  createCategory: (req, res, next) => {
    categoryService.createCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', `類別"${data.categoryName}-${data.subCategoryName}"新增成功!`)
      res.redirect('back')
    })
  },
  // 編輯主類別
  editCategory: (req, res, next) => {
    categoryService.editCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '編輯成功!')
      res.redirect('back')
    })
  },
  // 刪除主類別
  deleteCategory: (req, res, next) => {
    categoryService.deleteCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '刪除成功!')
      res.redirect('back')
    })
  },
  // 新增子類別
  createSubCategory: (req, res, next) => {
    categoryService.createSubCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', `子類別"${data.subCategoryName}"新增成功!`)
      res.redirect('back')
    })
  },
  // 編輯子類別
  editSubCategory: (req, res, next) => {
    categoryService.editSubCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '編輯成功!')
      res.redirect('back')
    })
  },
  // 刪除子類別
  deleteSubCategory: (req, res, next) => {
    categoryService.deleteSubCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', '刪除成功!')
      res.redirect('back')
    })
  }
}

module.exports = categoryController
