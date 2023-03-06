const { STATUS } = require('../constants/status')
const Category = require('../models/CategoryModel')

const addCategory = async (req, res) => {
  const name = req.body.name
  const categoryAdd = await new Category({ name }).save()
  const response = {
    message: 'Tạo Category thành công',
    data: categoryAdd.toObject({
      transform: (doc, ret, option) => {
        delete ret.__v
        return ret
      }
    })
  }
  return res.status(STATUS.OK).json(response)
}

const getCategories = async (req, res) => {
  const { exclude } = req.query
  let condition = exclude ? { _id: { $ne: exclude } } : {}
  const categories = await Category.find(condition).select({ __v: 0 }).lean()
  const response = {
    message: 'Lấy categories thành công',
    data: categories
  }
  return res.status(STATUS.OK).json(response)
}

const getCategory = async (req, res) => {
  const categoryDB = await Category.findById(req.params.id).select({ __v: 0 }).lean()
  if (categoryDB) {
    const response = {
      message: 'Lấy category thành công',
      data: categoryDB
    }
    return res.status(STATUS.OK).json(response)
  } else {
    console.log('Không tìm thấy Category')
  }
}

const updateCategory = async (req, res) => {
  const { name } = req.body
  const categoryDB = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true }).select({ __v: 0 }).lean()
  if (categoryDB) {
    const response = {
      message: 'Cập nhật category thành công',
      data: categoryDB
    }
    return res.status(STATUS.OK).json(response)
  } else {
    console.log('Không tìm thấy Category')
  }
}

const deleteCategory = async (req, res) => {
  const categoryDB = await Category.findByIdAndDelete(req.params.id).lean()
  if (categoryDB) {
    return res.status(STATUS.OK).json({ message: 'Xóa thành công' })
  } else {
    console.log('Không tìm thấy Category')
  }
}

module.exports = {
  addCategory,
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory
}
