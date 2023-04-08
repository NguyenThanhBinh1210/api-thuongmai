const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const paymentController = require('../controllers/PaymentController')

router.put('/:id', bodyParser.json(), paymentController.MomoControllerPayment)

module.exports = router
