const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

// ─── GET All Products ────────────────────────────────────
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.$text = { $search: search };

    const sortOptions = {
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      'newest':     { createdAt: -1 },
      'popular':    { numReviews: -1 }
    };

    const products = await Product.find(query)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET Single Product ──────────────────────────────────
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CREATE Product (Admin) ──────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, oldPrice, category, stock, badge } = req.body;

    let images = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        images.push({ url: result.secure_url, publicId: result.public_id });
      }
    }

    const product = await Product.create({
      name, description, price, oldPrice, category, stock, badge, images
    });

    res.status(201).json({ success: true, message: 'Produit créé avec succès !', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE Product (Admin) ──────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    // Upload new images if provided
    if (req.files?.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        newImages.push({ url: result.secure_url, publicId: result.public_id });
      }
      product.images = [...product.images, ...newImages];
    }

    const { name, description, price, oldPrice, category, stock, badge, isActive } = req.body;
    if (name)        product.name        = name;
    if (description) product.description = description;
    if (price)       product.price       = price;
    if (oldPrice !== undefined) product.oldPrice = oldPrice;
    if (category)    product.category    = category;
    if (stock !== undefined)    product.stock    = stock;
    if (badge !== undefined)    product.badge    = badge;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    res.json({ success: true, message: 'Produit mis à jour.', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE Product (Admin) ──────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    // Delete images from Cloudinary
    for (const img of product.images) {
      await deleteFromCloudinary(img.publicId);
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Produit supprimé.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE One Image from Product ───────────────────────
exports.deleteProductImage = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }
    await deleteFromCloudinary(decodeURIComponent(publicId));
    product.images = product.images.filter(img => img.publicId !== decodeURIComponent(publicId));
    await product.save();
    res.json({ success: true, message: 'Image supprimée.', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
