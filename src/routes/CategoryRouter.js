const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/CategoryController')
const { authMiddleWare } = require('../middleware/authMiddleware')

router.post('/create', authMiddleWare, CategoryController.addCategory)
router.put('/update/:id', authMiddleWare, CategoryController.updateCategory)
router.get('/get-details/:id', CategoryController.getCategory)
router.delete('/delete/:id', authMiddleWare, CategoryController.deleteCategory)
router.get('/get-all', CategoryController.getCategories)

module.exports = router
