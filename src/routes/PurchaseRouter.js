const express = require('express')
const router = express.Router()
const PurchaseController = require('../controllers/PurchaseController')
const { authMiddleWare, authUserMiddleWare } = require('../middleware/authMiddleware')

router.post('/add-to-cart/:id', authUserMiddleWare, PurchaseController.addToCart)
router.post('/get-purchase/:id', PurchaseController.getPurchases)
router.put('/update-purchase/:id', PurchaseController.updatePurchase)
router.put('/confirm-purchase/:id', authUserMiddleWare, PurchaseController.changeStatusPurchase)
router.put('/buy-products/:id', authUserMiddleWare, PurchaseController.buyProducts)
router.delete('/delete-purchase/:id', authUserMiddleWare, PurchaseController.deletePurchases)
router.get('/get-all', authMiddleWare, PurchaseController.getAllPurchases)
router.get('/get-purchase-online/:id', PurchaseController.getPurchasesPaymentOnline)

module.exports = router
