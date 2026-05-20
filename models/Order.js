const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    name:     { type: String, required: true },
    phone:    { type: String, required: true },
    quartier: { type: String, required: true },
    commune:  { type: String, required: true },
    ville:    { type: String, default: 'Kinshasa' },
    notes:    { type: String, default: '' }
  },
  paymentMethod: {
    type: String,
    enum: ['mobile_money', 'cash', 'whatsapp'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal:     { type: Number, required: true },
  deliveryFee:  { type: Number, default: 0 },
  totalAmount:  { type: Number, required: true },
  notes:        { type: String, default: '' },
  deliveredAt:  { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
