'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class SubCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      SubCategory.belongsTo(models.Category, { foreignKey: 'categoryId' })
      SubCategory.hasMany(models.ProductCategory, { foreignKey: 'subCategoryId' })
    }
  }
  SubCategory.init({
    name: DataTypes.STRING,
    categoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SubCategory',
    tableName: 'Sub_categories',
    underscored: true
  })
  return SubCategory
}
