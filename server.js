const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const connectDB       = require('./config/db');
const productRoutes   = require('./routes/productRoutes');
const authRoutes      = require('./routes/authRoutes');
const orderRoutes     = require('./routes/orderRoutes');
const User            = require('./models/User');

connectDB();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ──────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/orders',   orderRoutes);

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', store: '243Market', timestamp: new Date().toISOString() });
});

// ══════════════════════════════════════════════════════════
//  SETUP ADMIN — Route unique pour créer le 1er admin
//  Protégée par SETUP_SECRET dans .env
//  Se désactive automatiquement après création du 1er admin
// ══════════════════════════════════════════════════════════
app.post('/api/setup-admin', async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;

    // Vérifier la clé secrète
    if (secret !== process.env.SETUP_SECRET) {
      return res.status(403).json({ success: false, message: '❌ Clé secrète incorrecte.' });
    }

    // Vérifier qu'il n'y a pas déjà un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: '❌ Un compte admin existe déjà. Cette page est désactivée.'
      });
    }

    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '❌ Email déjà utilisé.' });
    }

    // Créer l'admin
    const admin = await User.create({ name, email, password, role: 'admin' });

    res.status(201).json({
      success: true,
      message: `✅ Compte admin créé pour ${admin.email} ! Vous pouvez maintenant vous connecter sur /admin.html`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Serve Frontend ──────────────────────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// ─── Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 243Market Server on port ${PORT}`);
  console.log(`📦 Env: ${process.env.NODE_ENV}`);
  console.log(`🔗 http://localhost:${PORT}\n`);
});
