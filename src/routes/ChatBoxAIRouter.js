const express = require('express')
const ChatBoxAIController = require('../controllers/ChatBoxAIController')
const router = express.Router()

router.post('/question', ChatBoxAIController.question)

module.exports = router
