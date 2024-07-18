const EcpayPayment = require('ecpay_aio_nodejs')
const { MERCHANTID, HASHKEY, HASHIV, HOST } = process.env

const { Order } = require('../../models')
const orderService = require('../../services/order-service')

const options = {
  OperationMode: 'Test',
  MercProfile: {
    MerchantID: MERCHANTID,
    HashKey: HASHKEY,
    HashIV: HASHIV
  },
  IgnorePayment: [],
  IsProjectContractor: false
}

const EcpayController = {
  // 轉至綠界科技進行結帳
  payOrder: async (req, res, next) => {
    try {
      const { orderId } = req.params
      const order = await Order.findByPk(orderId)

      if (!order) throw new Error('查無訂單，請重新結帳!')

      const MerchantTradeDate = new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      })
      const TradeNo = 'test' + new Date().getTime()
      await order.update({ tradeNo: TradeNo })

      const baseParam = {
        MerchantTradeNo: TradeNo,
        MerchantTradeDate,
        TotalAmount: order.dataValues.totalPrice,
        TradeDesc: '寵物二手用品交易',
        ItemName: 'Pet Swap',
        ReturnURL: `${HOST}/ecpay/return`
      }

      const create = new EcpayPayment(options)
      const html = create.payment_client.aio_check_out_all(baseParam)
      res.send(html)
    } catch (err) {
      next(err)
    }
  },
  // 核對綠界回傳結果
  paymentReturn: async (req, res, next) => {
    try {
      console.log('綠界回傳:', req.body)
      const { MerchantTradeNo, RtnCode, CheckMacValue } = req.body
      const data = { MerchantTradeNo, RtnCode }
      const order = await Order.findOne({ where: { tradeNo: MerchantTradeNo }, raw: true })
      console.log('交易後order:', order)

      if (!order) throw new Error('查無訂單，請重新結帳!')

      const create = new EcpayPayment(options)
      const checkValue = create.payment_client.helper.gen_chk_mac_value(data)
      console.log(`核對回傳值,CheckMacValue= ${CheckMacValue}, checkValue = ${checkValue}`)

      // 確認交易正確性
      if (CheckMacValue === checkValue) {
        console.log('核對成功，交易結果RtnCode :', RtnCode)
        // 交易成功
        if (RtnCode === '1') {
          await orderService.updateOrderStatus(order.id, 'paid')
          console.log(`訂單 ${order.id} 支付成功`)
        }
      } else {
        await orderService.updateOrderStatus(order.id, 'failed')
        console.log(`訂單 ${order.id} 支付失敗，CheckMacValue 不匹配`)
      }
      // 告知綠界已成功接收回傳結果
      res.send('1|OK')
      console.log('結束，路由重新導向~~')
      res.redirect('/products')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = EcpayController
