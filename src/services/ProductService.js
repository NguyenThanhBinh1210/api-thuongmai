const Product = require('../models/ProductModel')
const { SORT_BY, ORDER } = require('../constants/product')

const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    const { name, image, type, countInStock, price, rating, description, discount, selled, category } = newProduct
    try {
      const checkProduct = await Product.findOne({
        name: name
      })
      if (checkProduct !== null) {
        resolve({
          status: 'ERR',
          message: 'The name of product is already'
        })
      }
      const newProduct = await Product.create({
        name,
        image,
        type,
        countInStock,
        price,
        rating,
        description,
        discount,
        selled,
        category
      })
      if (newProduct) {
        resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: newProduct
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id
      })
      if (checkProduct === null) {
        resolve({
          status: 'ERR',
          message: 'The product is not defined'
        })
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true })
      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: updatedProduct
      })
    } catch (e) {
      reject(e)
    }
  })
}

const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id
      })
      if (checkProduct === null) {
        resolve({
          status: 'ERR',
          message: 'The product is not defined'
        })
      }

      await Product.findByIdAndDelete(id)
      resolve({
        status: 'OK',
        message: 'Delete product success'
      })
    } catch (e) {
      reject(e)
    }
  })
}

const deleteManyProduct = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Product.deleteMany({ _id: ids })
      resolve({
        status: 'OK',
        message: 'Delete product success'
      })
    } catch (e) {
      reject(e)
    }
  })
}

const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findOne({
        _id: id
      })
      console.log(product)
      if (product === null) {
        resolve({
          status: 'ERR',
          message: 'The product is not defined'
        })
      }

      resolve({
        status: 'OK',
        message: 'SUCESS',
        data: product
      })
    } catch (e) {
      reject(e)
    }
  })
}

const getAllProduct = (limit, page, category, sort_by, order, rating_filter, name, price_max, price_min) => {
  return new Promise(async (resolve, reject) => {
    try {
      let condition = {}
      if (category) {
        condition.category = category
      }
      if (rating_filter) {
        condition.rating = { $gte: rating_filter }
      }
      if (price_max) {
        condition.price = {
          $lte: price_max
        }
      }
      if (price_min) {
        condition.price = condition.price ? { ...condition.price, $gte: price_min } : { $gte: price_min }
      }
      if (!ORDER.includes(order)) {
        order = ORDER[0]
      }
      if (!SORT_BY.includes(sort_by)) {
        sort_by = SORT_BY[0]
      }

      if (name) {
        condition.name = {
          $regex: name,
          $options: 'i'
        }
      }
      const totalProduct = await Product.count()
      let [products, totalProducts] = await Promise.all([
        Product.find(condition)
          .populate({ path: 'category' })
          .skip(page * limit - limit)
          .limit(limit)
          .sort({ [sort_by]: order === 'desc' ? -1 : 1 })
          .select({ __v: 0, description: 0 })
          .lean(),
        Product.find(condition).countDocuments().lean()
      ])
      const totalPage = Math.ceil(totalProducts / limit) || 1
      resolve({
        status: 'OK',
        message: 'Success',
        data: products,
        total: totalProduct,
        pageCurrent: page,
        totalPage: totalPage
      })
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  createProduct,
  updateProduct,
  getDetailsProduct,
  deleteProduct,
  getAllProduct,
  deleteManyProduct
}
