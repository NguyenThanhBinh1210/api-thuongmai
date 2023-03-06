const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      // Kế thừa sản phẩm
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        }
      }
    ],
    shippingAddress: {
      // Địa chỉ giao hàng
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: number, required: true }
    },
    paymentMethod: { type: String, required: true }, // Phương thức thanh toán
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true }, // Phí vận chuyển
    taxPrice: { type: Number, required: true }, // Phí thuế
    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kế thừa người dùng
    isPaid: { type: Boolean, default: false }, // Trạng thái thanh toán
    paidAt: { type: Date }, // Thời gian thanh toán
    isDelivered: { type: Boolean, default: false }, // Trạng thái giao hàng
    deliveredAt: { type: Date } // Thời gian giao hàng
  },
  {
    timestamps: true
  }
)
const Order = mongoose.model('Order', orderSchema)
module.exports = Order
