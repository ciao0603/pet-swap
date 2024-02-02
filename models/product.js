'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Product.belongsTo(models.User, { foreignKey: 'buyerUserId' })
      Product.belongsTo(models.Shop, { foreignKey: 'shopId' })
      Product.hasMany(models.ProductCategory, { foreignKey: 'productId' })
    }
  }
  Product.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    status: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    buyerUserId: DataTypes.INTEGER,
    isCommented: DataTypes.BOOLEAN,
    shopId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'Products',
    underscored: true
  })
  return Product
}
