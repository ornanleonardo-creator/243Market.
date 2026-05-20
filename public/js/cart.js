/* ══════════════════════════════════════════════════════
   243MARKET — cart.js  (Commande via WhatsApp)
   ══════════════════════════════════════════════════════ */

const WHATSAPP_NUMBER = '243860944864';

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

// ─── Rendu du panier ─────────────────────────────────────
function renderCart() {
  const items   = Cart.get();
  const wrapper = document.getElementById('cartWrapper');
  const summary = document.getElementById('cartSummary');

  if (!items.length) {
    wrapper.innerHTML = `
      <div style="text-align:center; padding:4rem; color:var(--muted);">
        <div style="font-size:4rem; margin-bottom:1rem;">🛒</div>
        <h3 style="font-family:'Orbitron',monospace; margin-bottom:0.75rem;">Panier vide</h3>
        <p>Vous n'avez aucun produit dans votre panier.</p>
        <a href="/products.html" class="btn btn-primary" style="margin-top:1.5rem;">
          Voir les produits
        </a>
      </div>`;
    summary.style.display = 'none';
    return;
  }

  summary.style.display = 'block';

  wrapper.innerHTML = `
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:1px solid var(--border); font-size:0.8rem; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase;">
          <th style="text-align:left; padding:0.75rem 0.5rem;">Produit</th>
          <th style="text-align:center; padding:0.75rem 0.5rem;">Qté</th>
          <th style="text-align:right; padding:0.75rem 0.5rem;">Prix</th>
          <th style="padding:0.75rem 0.5rem;"></th>
        </tr>
      </thead>
      <tbody>${items.map(cartRow).join('')}</tbody>
    </table>`;

  updateSummary(items);
}

function cartRow(item) {
  const img = item.image
    ? `<img src="${item.image}" style="width:55px;height:55px;object-fit:contain;border-radius:6px;" />`
    : `<span style="font-size:2rem;">🎮</span>`;

  return `
    <tr style="border-bottom:1px solid var(--border);">
      <td style="padding:1rem 0.5rem;">
        <div style="display:flex; align-items:center; gap:1rem;">
          ${img}
          <div>
            <div style="font-weight:700;">${item.name}</div>
            <div style="font-size:0.8rem; color:var(--muted); text-transform:uppercase;">${item.category}</div>
          </div>
        </div>
      </td>
      <td style="text-align:center; padding:1rem 0.5rem;">
        <div style="display:flex; align-items:center; justify-content:center; gap:0.5rem;">
          <button class="btn btn-outline btn-sm" onclick="changeQty('${item._id}', -1)">−</button>
          <span style="font-weight:700; min-width:24px; text-align:center;">${item.quantity}</span>
          <button class="btn btn-outline btn-sm" onclick="changeQty('${item._id}', 1)">+</button>
        </div>
      </td>
      <td style="text-align:right; padding:1rem 0.5rem; font-family:'Orbitron',monospace; color:var(--gold); font-size:1rem;">
        ${fmtPrice(item.price * item.quantity)}
      </td>
      <td style="text-align:center; padding:1rem 0.5rem;">
        <button class="btn btn-danger btn-sm" onclick="removeItem('${item._id}')">🗑</button>
      </td>
    </tr>`;
}

function changeQty(id, delta) {
  const items = Cart.get();
  const item  = items.find(i => i._id === id);
  if (!item) return;
  Cart.setQty(id, item.quantity + delta);
  renderCart();
}

function removeItem(id) {
  Cart.remove(id);
  renderCart();
  toast('Produit retiré du panier', 'info');
}

function updateSummary(items) {
  const subtotal = Cart.total();
  const delivery = subtotal > 200 ? 0 : 5;
  const total    = subtotal + delivery;
  document.getElementById('subtotalEl').textContent = fmtPrice(subtotal);
  document.getElementById('deliveryEl').textContent = delivery === 0 ? '✅ GRATUIT' : fmtPrice(delivery);
  document.getElementById('totalEl').textContent    = fmtPrice(total);
}

// ─── Commander via WhatsApp ───────────────────────────────
function commanderViaWhatsApp() {
  const items = Cart.get();
  if (!items.length) {
    toast('Votre panier est vide.', 'error');
    return;
  }

  const name     = document.getElementById('shipName').value.trim();
  const phone    = document.getElementById('shipPhone').value.trim();
  const quartier = document.getElementById('shipQuartier').value.trim();
  const commune  = document.getElementById('shipCommune').value.trim();
  const method   = document.getElementById('payMethod').value;
  const notes    = document.getElementById('orderNotes').value.trim();

  if (!name || !phone || !quartier || !commune) {
    toast('⚠️ Veuillez remplir tous les champs de livraison.', 'error');
    document.getElementById('checkoutForm').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const subtotal = Cart.total();
  const delivery = subtotal > 200 ? 0 : 5;
  const total    = subtotal + delivery;

  const lignesProduits = items.map(i =>
    `  • ${i.name} x${i.quantity} = ${fmtPrice(i.price * i.quantity)}`
  ).join('\n');

  const methodLabel = {
    cash:         '💵 Cash à la livraison',
    mobile_money: '📲 Mobile Money',
    whatsapp:     '💬 Paiement WhatsApp'
  }[method] || method;

  // ─── Message pré-rempli WhatsApp ─────────────────────
  const message =
`🛍️ *NOUVELLE COMMANDE — 243Market*
━━━━━━━━━━━━━━━━━━━━

📦 *PRODUITS COMMANDÉS :*
${lignesProduits}

💰 *RÉCAPITULATIF :*
  Sous-total : ${fmtPrice(subtotal)}
  Livraison  : ${delivery === 0 ? 'GRATUITE ✅' : fmtPrice(delivery)}
  *TOTAL     : ${fmtPrice(total)}*

📍 *LIVRAISON :*
  Nom       : ${name}
  Téléphone : ${phone}
  Quartier  : ${quartier}
  Commune   : ${commune}
  Ville     : Kinshasa 🇨🇩

💳 *PAIEMENT :* ${methodLabel}
${notes ? `\n📝 *Notes :* ${notes}` : ''}
━━━━━━━━━━━━━━━━━━━━
Merci de confirmer ma commande ! 🙏`;

  // ─── Ouvrir WhatsApp ─────────────────────────────────
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');

  // ─── Vider le panier + afficher confirmation ──────────
  Cart.clear();
  Cart.updateBadge();
  document.getElementById('checkoutForm').style.display    = 'none';
  document.getElementById('cartWrapper').style.display     = 'none';
  document.getElementById('cartSummary').style.display     = 'none';
  document.getElementById('successWhatsApp').style.display = 'block';
}
