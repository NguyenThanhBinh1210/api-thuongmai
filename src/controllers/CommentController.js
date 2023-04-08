const { STATUS } = require('../constants/status')
const Comment = require('../models/CommentModel')

const createComment = async (req, res) => {
  const { title, image, product_id } = req.body
  const user_id = req.params.id
  const comment = await new Comment({ title, image, product: product_id, user: user_id }).save()
  const response = {
    message: 'Tạo bình luận thành công',
    data: comment.toObject({
      transform: (doc, ret, option) => {
        delete ret.__v
        return ret
      }
    })
  }
  return res.status(STATUS.OK).json(response)
}

const getCommentProduct = async (req, res) => {
  const product_id = req.params.id
  let comments = await Comment.find({ product: product_id })
    .populate({
      path: 'user'
    })
    .sort({
      createdAt: -1
    })
    .lean()
  const response = {
    message: 'Lấy bình luận thành công',
    data: comments
  }
  return res.status(200).json(response)
}

const updateComment = async (req, res) => {
  const user_id = req.params.id
  const { product_id, title } = req.body
  let commentDb = await Comment.findOne({
    user: user_id,
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
  if (commentDb) {
    const data = await Comment.findOneAndUpdate(
      {
        user: user_id,
        product: {
          _id: product_id
        }
      },
      {
        title
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
      message: 'Sửa bình luận thành công!',
      data
    }
    return res.status(200).json(response)
  } else {
    return res.status(404).json({ message: 'Không tìm thấy bình luận!' })
  }
}

const deleteComment = async (req, res) => {
  const comment_id = req.params.id
  const comment = await Comment.findByIdAndDelete(comment_id).lean()
  if (comment) {
    return res.status(STATUS.OK).json({ message: 'Xóa thành công' })
  } else {
    return res.status(404).json({ message: 'Không tìm thấy bình luận' })
  }
}

module.exports = {
  createComment,
  getCommentProduct,
  updateComment,
  deleteComment
}
