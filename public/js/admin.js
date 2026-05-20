/* ══════════════════════════════════════════════════════
   243MARKET — admin.js
   ══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    toast('Accès réservé aux administrateurs.', 'error');
    setTimeout(() => { window.location.href = '/index.html'; }, 1500);
    return;
  }
  loadStats();
  loadProducts();
  loadOrders();
});

// ─── TABS ────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`panel-${tab}`).classList.remove('hidden');
}

// ─── STATS ───────────────────────────────────────────────
async function loadStats() {
  const { ok, data } = await apiRequest('/orders/stats');
  if (!ok) return;
  const s = data.stats;
  document.getElementById('statOrders').textContent  = s.totalOrders;
  document.getElementById('statRevenue').textContent = fmtPrice(s.totalRevenue);
  document.getElementById('statPending').textContent = s.pendingOrders;
}

// ─── PRODUCTS ────────────────────────────────────────────
let editingProductId = null;

async function loadProducts(page = 1) {
  const { ok, data } = await apiRequest(`/products?limit=50&page=${page}`);
  if (!ok) return;

  const tbody = document.getElementById('productsTable');
  tbody.innerHTML = data.products.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          ${p.images?.[0]?.url
            ? `<img src="${p.images[0].url}" style="width:45px;height:45px;object-fit:cover;border-radius:6px;"/>`
            : `<span style="font-size:1.8rem;">🎮</span>`}
          <div>
            <div style="font-weight:700;">${p.name}</div>
            <div style="font-size:0.75rem;color:var(--muted);">${p.category.toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td style="font-family:'Orbitron',monospace;color:var(--gold);">${fmtPrice(p.price)}</td>
      <td style="color:${p.stock < 5 ? 'var(--neon2)' : 'var(--success)'};">${p.stock}</td>
      <td><span class="badge ${p.isActive ? 'badge-done' : 'badge-pending'}">${p.isActive ? 'Actif' : 'Inactif'}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openEditProduct('${p._id}')">✏️ Éditer</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p._id}')">🗑</button>
      </td>
    </tr>
  `).join('');
}

function openAddProduct() {
  editingProductId = null;
  document.getElementById('productModalTitle').textContent = 'Ajouter un produit';
  document.getElementById('productForm').reset();
  document.getElementById('productModal').classList.add('open');
}

async function openEditProduct(id) {
  editingProductId = id;
  document.getElementById('productModalTitle').textContent = 'Modifier le produit';
  const { ok, data } = await apiRequest(`/products/${id}`);
  if (!ok) return;
  const p = data.product;
  document.getElementById('pName').value        = p.name;
  document.getElementById('pDescription').value = p.description;
  document.getElementById('pPrice').value       = p.price;
  document.getElementById('pOldPrice').value    = p.oldPrice || '';
  document.getElementById('pCategory').value    = p.category;
  document.getElementById('pStock').value       = p.stock;
  document.getElementById('pBadge').value       = p.badge || '';
  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

async function saveProduct() {
  const form = document.getElementById('productForm');
  const fd   = new FormData(form);

  const files = document.getElementById('pImages').files;
  for (const f of files) fd.append('images', f);

  const method = editingProductId ? 'PUT' : 'POST';
  const path   = editingProductId ? `/products/${editingProductId}` : '/products';

  const btn = document.getElementById('saveProductBtn');
  btn.disabled = true; btn.textContent = 'Enregistrement…';

  const { ok, data } = await apiRequest(path, { method, body: fd });
  btn.disabled = false; btn.textContent = 'Enregistrer';

  if (ok) {
    toast(data.message, 'success');
    closeProductModal();
    loadProducts();
  } else {
    toast(data.message || 'Erreur.', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Supprimer ce produit ?')) return;
  const { ok, data } = await apiRequest(`/products/${id}`, { method: 'DELETE' });
  if (ok) { toast(data.message, 'success'); loadProducts(); }
  else toast(data.message, 'error');
}

// ─── ORDERS ──────────────────────────────────────────────
async function loadOrders(status = '') {
  const qs = status ? `?status=${status}` : '';
  const { ok, data } = await apiRequest(`/orders${qs}`);
  if (!ok) return;

  const tbody = document.getElementById('ordersTable');
  const statusColors = {
    pending: 'badge-pending', confirmed: 'badge-done',
    processing: 'badge-pending', shipped: 'badge-done',
    delivered: 'badge-done', cancelled: 'badge-sale'
  };

  tbody.innerHTML = data.orders.map(o => `
    <tr>
      <td style="font-size:0.8rem;color:var(--muted);">#${o._id.slice(-6).toUpperCase()}</td>
      <td>${o.user?.name || '—'}<br/><span style="font-size:0.75rem;color:var(--muted);">${o.user?.phone || ''}</span></td>
      <td>${o.items.length} article(s)</td>
      <td style="font-family:'Orbitron',monospace;color:var(--gold);">${fmtPrice(o.totalAmount)}</td>
      <td><span class="badge ${statusColors[o.orderStatus]}">${o.orderStatus}</span></td>
      <td>
        <select class="form-control" style="width:auto;padding:0.3rem;" onchange="updateOrder('${o._id}', this.value)">
          <option value="">Changer statut…</option>
          <option value="confirmed">Confirmé</option>
          <option value="processing">En traitement</option>
          <option value="shipped">Expédié</option>
          <option value="delivered">Livré</option>
          <option value="cancelled">Annulé</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateOrder(id, status) {
  if (!status) return;
  const { ok, data } = await apiRequest(`/orders/${id}`, {
    method: 'PUT', body: { orderStatus: status }
  });
  if (ok) { toast('Commande mise à jour.', 'success'); loadOrders(); }
  else toast(data.message, 'error');
}
