'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ProductCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      ProductCategory.belongsTo(models.Product, { foreignKey: 'productId' })
      ProductCategory.belongsTo(models.SubCategory, { foreignKey: 'subCategoryId' })
    }
  }
  ProductCategory.init({
    productId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
    subCategoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ProductCategory',
    tableName: 'ProductCategories',
    underscored: true
  })
  return ProductCategory
}
