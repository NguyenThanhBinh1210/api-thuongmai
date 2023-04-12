const { STATUS } = require('../constants/status')
const { slugVietnamese } = require('../utils/utils')
const Product = require('../models/ProductModel')

const question = async (req, res) => {
  const question = slugVietnamese(req.body.question)
  let response
  if (question.includes('dang hot') || question.includes('hot nhat')) {
    const limit = 3
    const sort_by = 'selled'
    const order = 'desc'
    let [products] = await Promise.all([
      Product.find({})
        .populate({ path: 'category' })
        .limit(limit)
        .sort({ [sort_by]: order === 'desc' ? -1 : 1 })
        .select({ __v: 0, description: 0 })
        .lean(),
      Product.find({}).countDocuments().lean()
    ])
    response = {
      message: 'Hiện tại đây là 3 sản phẩm bán chạy nhất trong shop:',
      dataProduct: products
    }
  } else if (question.includes('chao shop') || question.includes('chao ban')) {
    response = { message: 'Shop xin chào bạn, bạn cần hỗ trợ gì?' }
  } else if (question.includes('cach') || question.includes('lam sao') || question.includes('nhu the nao')) {
    if (question.includes('mua hang')) {
      if (question.includes('onl')) {
        response = {
          message: 'Để mình chỉ cho cách mua hàng online nhé:',
          dataText: [
            '1. Đầu tiên phải có sản phẩm trong giỏ hàng.',
            '2. Tiếp đến bấm chọn mua sản phẩm bạn muốn.',
            '3. Nhấn thanh toán.',
            '4. Ở phần thanh toán online lựa chọn phương thức bạn muốn, thanh toán xong như vậy là đã thành công rồi.',
            '5. Lưu ý hãy điền địa chỉ trước khi thanh toán nhé.'
          ]
        }
      } else {
        response = { message: 'để mình chỉ cho cách mua hàng nhé?' }
      }
    }
    if (question.includes('them hang')) {
      response = { message: 'Để mình chỉ cho cách thêm vào giỏ nhé?' }
    }
  } else if (question.includes('tra gop')) {
    response = { message: 'Hiện tại shop chưa hỗ trợ trả góp ạ!' }
  } else if (question.includes('cam on')) {
    response = { message: 'Không có gì đâu, đây là trách nhiệm của mình mà!' }
  } else {
    response = { message: 'Hiện tại mình chưa được lập trình để trả lời câu hỏi này!' }
  }
  return res.status(STATUS.OK).json(response)
}

module.exports = {
  question
}
