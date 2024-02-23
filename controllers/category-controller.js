const { Category, SubCategory, ProductCategory } = require('../models')

const categoryController = {
  // 取得主類別及各自的子類別
  getCategories: async (req, res, next) => {
    try {
      let categories = await Category.findAll({
        raw: true
      })
      categories = await Promise.all(categories.map(async category => {
        const subCategories = await SubCategory.findAll({ where: { categoryId: category.id }, raw: true })
        return {
          ...category,
          subCategories: subCategories.map(subCategory => ({ ...subCategory }))
        }
      }))

      res.render('admin/categories', { categories })
    } catch (err) {
      next(err)
    }
  },
  // 新增主類別
  createCategory: async (req, res, next) => {
    try {
      const { categoryName, subCategoryName } = req.body
      if (!(categoryName && subCategoryName)) throw new Error('所有空格皆須填寫!')
      const newCategory = await Category.create({ name: categoryName })
      const newSubCategory = await SubCategory.create({ name: subCategoryName, categoryId: newCategory.id })

      req.flash('success_msg', `類別"${newCategory.name}-${newSubCategory.name}"新增成功!`)
      res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  // 編輯主類別
  editCategory: async (req, res, next) => {
    try {
      const { categoryId } = req.params
      const { categoryName } = req.body
      const category = await Category.findByPk(categoryId)
      await category.update({ name: categoryName })

      req.flash('success_msg', '編輯成功!')
      res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  // 刪除主類別
  deleteCategory: async (req, res, next) => {
    try {
      const { categoryId } = req.params
      // 找到底下的子類別
      const subCategories = await SubCategory.findAll({ where: { categoryId } })
      // 刪除子類別與相關的商品紀錄
      await Promise.all(subCategories.map(async subcategory => {
        await ProductCategory.destroy({ where: { subCategoryId: subcategory.id } })
        await subcategory.destroy()
      }))
      // 刪除主類別
      await Category.destroy({ where: { id: categoryId } })

      req.flash('success_msg', '刪除成功!')
      res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  // 新增子類別
  createSubCategory: async (req, res, next) => {
    try {
      const { categoryId, subCategoryName } = req.body
      if (!subCategoryName) throw new Error('請正確填寫類別名稱!')
      const newSubCategory = await SubCategory.create({ name: subCategoryName, categoryId })

      req.flash('success_msg', `子類別"${newSubCategory.name}"新增成功!`)
      res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  // 編輯子類別
  editSubCategory: async (req, res, next) => {
    try {
      const { subCategoryId } = req.params
      const { subCategoryName } = req.body
      const subCategory = await SubCategory.findByPk(subCategoryId)
      await subCategory.update({ name: subCategoryName })

      req.flash('success_msg', '編輯成功!')
      res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  // 刪除子類別
  deleteSubCategory: async (req, res, next) => {
    try {
      const { subCategoryId } = req.params
      const { categoryId } = req.body
      // 刪除相關商品的紀錄
      await ProductCategory.destroy({ where: { subCategoryId } })
      // 刪除子類別
      await SubCategory.destroy({ where: { id: subCategoryId } })
      // 檢查所屬主類別底下是否還有其他子類別，若沒有則同時刪除主類別
      const SubCategories = await SubCategory.findAll({ where: { categoryId } })
      if (SubCategories.length === 0) {
        await Category.destroy({ where: { id: categoryId } })
      }

      req.flash('success_msg', '刪除成功!')
      res.redirect('back')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = categoryController
