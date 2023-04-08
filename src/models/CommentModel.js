const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema(
  {
    title: { type: String, require: true },
    image: { type: [String] },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    product: { type: mongoose.SchemaTypes.ObjectId, ref: 'Product' }
  },
  {
    timestamps: true
  }
)
const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment
