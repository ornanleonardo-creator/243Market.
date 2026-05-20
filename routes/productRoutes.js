const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct,
  createProduct, updateProduct,
  deleteProduct, deleteProductImage
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/',    getProducts);
router.get('/:id', getProduct);

// Admin routes
router.post(  '/',                     protect, adminOnly, upload.array('images', 5), createProduct);
router.put(   '/:id',                  protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id',                  protect, adminOnly, deleteProduct);
router.delete('/:id/images/:publicId', protect, adminOnly, deleteProductImage);

module.exports = router;
