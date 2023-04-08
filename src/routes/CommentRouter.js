const CommentController = require('../controllers/CommentController')
const express = require('express')
const router = express.Router()

router.post('/:id', CommentController.createComment)
router.get('/get-comment/:id', CommentController.getCommentProduct)
router.put('/update-comment/:id', CommentController.updateComment)
router.delete('/:id', CommentController.deleteComment)

module.exports = router
