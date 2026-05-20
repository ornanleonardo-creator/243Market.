const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder,
  getAllOrders, updateOrderStatus, getDashboardStats
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',         protect, createOrder);
router.get ('/my',       protect, getMyOrders);
router.get ('/stats',    protect, adminOnly, getDashboardStats);
router.get ('/',         protect, adminOnly, getAllOrders);
router.get ('/:id',      protect, getOrder);
router.put ('/:id',      protect, adminOnly, updateOrderStatus);

module.exports = router;
