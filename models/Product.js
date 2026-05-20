const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  oldPrice: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['ps5', 'ps4', 'ps3', 'iphone', 'nintendo', 'accessoires', 'autre']
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Le stock ne peut pas être négatif']
  },
  images: [{
    url:       { type: String, required: true },
    publicId:  { type: String, required: true }
  }],
  badge: {
    type: String,
    enum: ['new', 'sale', 'popular', ''],
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ratings: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for search
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
