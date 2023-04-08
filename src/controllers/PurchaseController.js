const Product = require('../models/ProductModel')
const Purchase = require('../models/PurchaseModel')
const { STATUS_PURCHASE } = require('../constants/purchase')
const { PAYMENT_TYPE } = require('../constants/payment')
const { sendMail } = require('../utils/mailer')

const addToCart = async (req, res) => {
  const { product_id, buy_count } = req.body
  const userPurchase = req.params.id
  const product = await Product.findById(product_id).lean()
  if (product) {
    if (buy_count > product.countInStock) {
      return res.status(404).json({ message: 'Số lượng vượt quá số lượng sản phẩm' })
    }
    const purchaseInDb = await Purchase.findOne({
      user: userPurchase,
      status: STATUS_PURCHASE.IN_CART,
      product: {
        _id: product_id
      }
    })
      .populate({
        path: 'product',
        populate: {
          path: 'category'
        }
      })
      .populate({
        path: 'user'
      })

    let data
    if (purchaseInDb) {
      data = await Purchase.findOneAndUpdate(
        {
          user: userPurchase,
          status: STATUS_PURCHASE.IN_CART,
          product: {
            _id: product_id
          }
        },
        {
          buy_count: purchaseInDb.buy_count + buy_count
        },
        {
          new: true
        }
      )
        .populate({
          path: 'product',
          populate: {
            path: 'category'
          }
        })
        .populate({
          path: 'user'
        })
        .lean()
    } else {
      const purchase = {
        user: userPurchase,
        product: product._id,
        buy_count: buy_count,
        price: product.price,
        discount: product.discount,
        price_before_discount: product.price - (product.price * product.discount) / 100,
        status: STATUS_PURCHASE.IN_CART
      }
      const addedPurchase = await new Purchase(purchase).save()
      data = await Purchase.findById(addedPurchase._id)
        .populate({
          path: 'product',
          populate: {
            path: 'category'
          }
        })
        .populate({
          path: 'user'
        })
    }
    const response = {
      message: 'Thêm sản phẩm vào giỏ hàng thành công',
      data
    }
    // console.log(response)
    return res.status(200).json(response)
  } else {
    return res.status(400).json({ message: 'Không tìm thấy sản phẩm' })
  }
}
const getPurchasesPaymentOnline = async (req, res) => {
  const user_id = req.params.id
  let condition = {
    user: user_id,
    paymentMethods: PAYMENT_TYPE.ONLINE,
    isPaid: false
  }
  let purchases = await Purchase.find(condition)
    .populate({
      path: 'product',
      populate: {
        path: 'category'
      }
    })
    .populate({
      path: 'user'
    })
    .sort({
      createdAt: -1
    })
    .lean()
  const response = {
    message: 'Lấy đơn mua thành công',
    data: purchases
  }
  return res.status(200).json(response)
}
const getPurchases = async (req, res) => {
  const { status = STATUS_PURCHASE.ALL } = req.body
  const user_id = req.params.id
  let condition = {
    user: user_id,
    status: {
      $ne: STATUS_PURCHASE.IN_CART
    }
  }
  if (Number(status) !== STATUS_PURCHASE.ALL) {
    condition.status = status
  }

  let purchases = await Purchase.find(condition)
    .populate({
      path: 'product',
      populate: {
        path: 'category'
      }
    })
    .populate({
      path: 'user'
    })
    .sort({
      createdAt: -1
    })
    .lean()
  const response = {
    message: 'Lấy đơn mua thành công',
    data: purchases
  }
  return res.status(200).json(response)
}
const updatePurchase = async (req, res) => {
  const { product_id, buy_count } = req.body
  const userId = req.params.id
  const purchaseInDb = await Purchase.findOne({
    user: userId,
    status: STATUS_PURCHASE.IN_CART,
    product: {
      _id: product_id
    }
  })
    .populate({
      path: 'product',
      populate: {
        path: 'category'
      }
    })
    .populate({
      path: 'user'
    })
    .lean()
  if (purchaseInDb) {
    if (buy_count > purchaseInDb.product.countInStock) {
      return res.status(404).json({ message: 'Số lượng vượt quá số lượng sản phẩm' })
    }
    const data = await Purchase.findOneAndUpdate(
      {
        user: userId,
        status: STATUS_PURCHASE.IN_CART,
        product: {
          _id: product_id
        }
      },
      {
        buy_count
      },
      {
        new: true
      }
    )
      .populate({
        path: 'product',
        populate: {
          path: 'category'
        }
      })
      .populate({
        path: 'user'
      })
      .lean()
    const response = {
      message: 'Cập nhật đơn thành công',
      data
    }
    return res.status(200).json(response)
  } else {
    return res.status(404).json({ message: 'Không tìm thấy đơn' })
  }
}
const buyProducts = async (req, res) => {
  console.log(req.body)
  const purchases = []
  const userId = req.params.id
  const paymentMethodss = req.body.paymentMethods
  for (const item of req.body.body) {
    let product = await Product.findById(item.product_id).lean()
    if (product) {
      if (item.buy_count > product.countInStock) {
        return res.status(404).json({ message: 'Số lượng mua vượt quá số lượng sản phẩm' })
      } else {
        let dataProduct = await Product.findByIdAndUpdate(
          product._id,
          {
            countInStock: Number(product.countInStock) - Number(item.buy_count),
            selled: Number(product.selled) + Number(item.buy_count)
          },
          {
            new: true
          }
        )
          .populate({
            path: 'category'
          })

          .lean()
        let data = await Purchase.findOneAndUpdate(
          {
            user: userId,
            status: STATUS_PURCHASE.IN_CART,
            product: {
              _id: item.product_id
            }
          },
          {
            buy_count: item.buy_count,
            status: STATUS_PURCHASE.WAIT_FOR_CONFIRMATION,
            isPaid: paymentMethodss === 1 ? true : false
          },
          {
            new: true
          }
        )
          .populate({
            path: 'product',
            populate: {
              path: 'category'
            }
          })
          .populate({
            path: 'user'
          })
          .lean()
        if (!data) {
          const purchase = {
            user: userId,
            product: item.product_id,
            buy_count: item.buy_count,
            price: product.price,
            price_before_discount: product.price_before_discount,
            status: STATUS_PURCHASE.WAIT_FOR_CONFIRMATION,
            isPaid: paymentMethodss === 1 ? true : false
          }
          const addedPurchase = await new Purchase(purchase).save()
          data = await Purchase.findById(addedPurchase._id)
            .populate({
              path: 'product',
              populate: {
                path: 'category'
              }
            })
            .populate({
              path: 'user'
            })
        }
        purchases.push(data)
      }
    } else {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }
  }
  const response = {
    message: 'Mua thành công',
    data: purchases
  }
  return res.status(200).json(response)
}

const changeStatusPurchase = async (req, res) => {
  const { product_id, purchase_id, status } = req.body
  const purchaseInDb = await Purchase.findOne({
    purchase_id: purchase_id,
    product: {
      _id: product_id
    }
  })
    .populate({
      path: 'product',
      populate: {
        path: 'category'
      }
    })
    .populate({
      path: 'user'
    })
    .lean()
  if (purchaseInDb) {
    const updatedProduct = await Purchase.findByIdAndUpdate(
      purchase_id,
      {
        status: status
      },
      { new: true }
    )
      .populate({
        path: 'product',
        populate: {
          path: 'category'
        }
      })
      .populate({
        path: 'user'
      })
      .lean()
    if (status === STATUS_PURCHASE.WAIT_FOR_GETTING) {
      const description = `${purchaseInDb.buy_count} chiếc ${purchaseInDb.product.name}, tổng số tiền là ${
        purchaseInDb.product.price_after_discount * purchaseInDb.buy_count
      }đ.`
      const text = 'Đã gửi đơn hàng:'
      const subject = 'Thông báo gửi hàng'
      const email = purchaseInDb.user.email
      sendMail(description, email, subject, text)
    }
    const response = {
      data: updatedProduct
    }
    return res.status(200).json(response)
  } else {
    return res.status(404).json({ message: 'Không tìm thấy đơn' })
  }
}
const deletePurchases = async (req, res) => {
  const purchase_ids = req.body
  const user_id = req.params.id
  const deletedData = await Purchase.deleteMany({
    user: user_id,
    status: STATUS_PURCHASE.IN_CART,
    _id: { $in: purchase_ids }
  })
  const response = {
    message: `Xoá ${deletedData.deletedCount} đơn thành công`,
    data: { deleted_count: deletedData.deletedCount }
  }
  return res.status(200).json(response)
}

const getAllPurchases = async (req, res) => {
  const allPurchase = await Purchase.find({})
    .populate({
      path: 'product',
      populate: {
        path: 'category'
      }
    })
    .populate({
      path: 'user'
    })
  const response = {
    message: 'Lấy tất cả đơn thành công!',
    data: allPurchase
  }
  return res.status(200).json(response)
}

module.exports = {
  addToCart,
  getPurchases,
  updatePurchase,
  buyProducts,
  changeStatusPurchase,
  deletePurchases,
  getAllPurchases,
  getPurchasesPaymentOnline
}
