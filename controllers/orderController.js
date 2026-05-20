const Order = require('../models/Order');
const Product = require('../models/Product');

// ─── CREATE Order ────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'Le panier est vide.' });
    }

    // Validate stock & compute total
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Produit introuvable: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}`
        });
      }
      subtotal += product.price * item.quantity;
      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity
      });
    }

    const deliveryFee = subtotal > 200 ? 0 : 5; // Free delivery over $200
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      totalAmount,
      notes
    });

    // Deduct stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const populated = await order.populate('items.product', 'name images');

    res.status(201).json({ success: true, message: 'Commande créée !', order: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET My Orders ────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images category');
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET Single Order ─────────────────────────────────────
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    // Only admin or owner can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET All Orders (Admin) ───────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user', 'name email phone')
      .populate('items.product', 'name');

    const total = await Order.countDocuments(query);

    res.json({ success: true, count: orders.length, total, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE Order Status (Admin) ─────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const update = {};
    if (orderStatus)  update.orderStatus  = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (orderStatus === 'delivered') update.deliveredAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    res.json({ success: true, message: 'Commande mise à jour.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Dashboard Stats (Admin) ──────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, pendingOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ orderStatus: 'pending' })
    ]);

    const revenueByMonth = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders:  { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        revenueByMonth
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
