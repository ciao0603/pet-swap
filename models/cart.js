'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Cart.belongsTo(models.Product, { foreignKey: 'productId' })
      Cart.belongsTo(models.User, { foreignKey: 'userId' })
    }
  }
  Cart.init({
    productId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    productName: DataTypes.STRING,
    productImage: DataTypes.STRING,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Carts',
    underscored: true
  })
  return Cart
}
