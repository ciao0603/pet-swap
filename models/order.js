'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId' })
      Order.belongsTo(models.User, { foreignKey: 'userId' })
    }
  }
  Order.init({
    userId: DataTypes.INTEGER,
    receiverName: DataTypes.STRING,
    receiverPhone: DataTypes.STRING,
    receiverAddress: DataTypes.STRING,
    totalPrice: DataTypes.INTEGER,
    status: DataTypes.STRING,
    tradeNo: DataTypes.STRING,
    productIds: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    underscored: true
  })
  return Order
}
