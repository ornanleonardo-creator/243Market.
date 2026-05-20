/* ══════════════════════════════════════════════════════
   243MARKET — app.js  (shared helpers + API layer)
   ══════════════════════════════════════════════════════ */

const API_BASE = '/api';

// ─── Token helpers ────────────────────────────────────────
const Auth = {
  getToken  : ()       => localStorage.getItem('token'),
  getUser   : ()       => JSON.parse(localStorage.getItem('user') || 'null'),
  setSession: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  clear     : ()       => { localStorage.removeItem('token'); localStorage.removeItem('user'); },
  isAdmin   : ()       => Auth.getUser()?.role === 'admin',
  isLoggedIn: ()       => !!Auth.getToken(),
};

// ─── API helper ───────────────────────────────────────────
async function apiRequest(path, options = {}) {
  const token = Auth.getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!data.success && res.status === 401) {
    Auth.clear();
    window.location.href = '/index.html';
  }
  return { ok: res.ok, status: res.status, data };
}

// ─── Cart (localStorage) ─────────────────────────────────
const Cart = {
  _key: 'cart_243',
  get   : ()        => JSON.parse(localStorage.getItem(Cart._key) || '[]'),
  save  : (items)   => localStorage.setItem(Cart._key, JSON.stringify(items)),
  count : ()        => Cart.get().reduce((s, i) => s + i.quantity, 0),
  total : ()        => Cart.get().reduce((s, i) => s + i.price * i.quantity, 0),

  add(product, quantity = 1) {
    const items = Cart.get();
    const idx   = items.findIndex(i => i._id === product._id);
    if (idx > -1) {
      items[idx].quantity += quantity;
    } else {
      items.push({
        _id:      product._id,
        name:     product.name,
        price:    product.price,
        image:    product.images?.[0]?.url || '',
        category: product.category,
        quantity
      });
    }
    Cart.save(items);
    Cart.updateBadge();
    return items;
  },

  remove(_id) {
    Cart.save(Cart.get().filter(i => i._id !== _id));
    Cart.updateBadge();
  },

  setQty(_id, quantity) {
    const items = Cart.get().map(i => i._id === _id ? { ...i, quantity } : i).filter(i => i.quantity > 0);
    Cart.save(items);
    Cart.updateBadge();
    return items;
  },

  clear() { Cart.save([]); Cart.updateBadge(); },

  updateBadge() {
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = Cart.count();
    });
  }
};

// ─── Toast ────────────────────────────────────────────────
function toast(msg, type = 'success') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.className = `show ${type}`;
  el.textContent = msg;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3200);
}

// ─── Format price ─────────────────────────────────────────
function fmtPrice(n) { return `$${Number(n).toFixed(2)}`; }

// ─── Render star rating ───────────────────────────────────
function renderStars(rating) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

// ─── Navbar active link ───────────────────────────────────
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

// ─── Build product card HTML ──────────────────────────────
function buildProductCard(p) {
  const img = p.images?.[0]?.url
    ? `<img src="${p.images[0].url}" alt="${p.name}" loading="lazy"/>`
    : `<span class="emoji">🎮</span>`;

  const badge = p.badge
    ? `<span class="badge badge-${p.badge} product-badge">${p.badge === 'new' ? '✨ Nouveau' : '🔥 Promo'}</span>`
    : '';

  const oldPrice = p.oldPrice ? `<span class="product-price-old">${fmtPrice(p.oldPrice)}</span>` : '';
  const stockCls = p.stock < 5 ? 'low' : '';
  const stockTxt = p.stock === 0 ? 'Rupture de stock' : p.stock < 5 ? `Plus que ${p.stock} !` : `En stock`;

  return `
    <div class="card product-card" data-id="${p._id}">
      ${badge}
      <div class="product-thumb">${img}</div>
      <div class="product-body">
        <div class="product-cat">${p.category.toUpperCase()}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <div>
            <span class="product-price">${fmtPrice(p.price)}</span>${oldPrice}
          </div>
          <button
            class="btn btn-primary btn-sm add-to-cart-btn"
            data-product='${JSON.stringify(p).replace(/'/g, "&apos;")}'
            ${p.stock === 0 ? 'disabled' : ''}
          >+ Ajouter</button>
        </div>
        <div class="product-stock ${stockCls}">${stockTxt}</div>
      </div>
    </div>`;
}

// ─── Delegate add-to-cart ──────────────────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('.add-to-cart-btn');
  if (!btn) return;
  const product = JSON.parse(btn.dataset.product.replace(/&apos;/g, "'"));
  Cart.add(product);
  toast(`✅ ${product.name} ajouté au panier`);
  Cart.updateBadge();
});

// ─── Init navbar ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
  setActiveNav();

  // Toggle user/login button
  const userEl = document.getElementById('navUser');
  if (userEl) {
    const user = Auth.getUser();
    if (user) {
      userEl.textContent = `👤 ${user.name.split(' ')[0]}`;
      userEl.href = '/cart.html';
    }
  }
});
