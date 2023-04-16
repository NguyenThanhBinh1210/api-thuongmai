const { STATUS } = require('../constants/status')
const Category = require('../models/CategoryModel')

const addCategory = async (req, res) => {
  const { name, parent_category_id } = req.body
  const checkCategory = await Category.findOne({ name: name })
  if (checkCategory) {
    return res.status(STATUS.BAD_REQUEST).json({ message: 'Tên này trùng rồi' })
  }
  const checkParentId = await Category.findOne({ _id: parent_category_id })
  if (parent_category_id && checkParentId !== null) {
    const categoryAdd = await new Category({ name, parentCategory: parent_category_id }).save()
    const response = {
      message: 'Tạo danh mục thành công!',
      data: categoryAdd.toObject({
        transform: (doc, ret, option) => {
          delete ret.__v
          return ret
        }
      })
    }
    return res.status(STATUS.OK).json(response)
  }
  const categoryAdd = await new Category({ name }).save()
  const response = {
    message: 'Tạo danh mục thành công!',
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
  const categories = await Category.find(condition)
    .populate({
      path: 'parentCategory'
    })
    .select({ __v: 0 })
    .lean()
  const response = {
    message: 'Lấy danh sách danh mục thành công!',
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
    return res.status(404).json({ message: 'Không tìm thấy Category' })
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
    return res.status(404).json({ message: 'Không tìm thấy Category' })
  }
}

const deleteCategory = async (req, res) => {
  const categoryDB = await Category.findByIdAndDelete(req.params.id).lean()
  if (categoryDB) {
    return res.status(STATUS.OK).json({ message: 'Xóa thành công' })
  } else {
    return res.status(404).json({ message: 'Không tìm thấy Category' })
  }
}

module.exports = {
  addCategory,
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory
}
