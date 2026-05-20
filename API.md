# 📡 API Reference — 243Market

**Base URL (local):** `http://localhost:5000/api`  
**Base URL (prod):** `https://243market-api.onrender.com/api`

---

## 🔐 Authentification

Toutes les routes protégées nécessitent un header :
```
Authorization: Bearer <token>
```

---

## AUTH

### POST `/auth/register`
Créer un nouveau compte.

**Body:**
```json
{
  "name": "Jean Mukeba",
  "email": "jean@email.com",
  "password": "monpassword",
  "phone": "+243812345678"
}
```

**Réponse 201:**
```json
{
  "success": true,
  "message": "Compte créé avec succès !",
  "token": "eyJhbGciOiJIUzI1N...",
  "user": {
    "id": "64f...",
    "name": "Jean Mukeba",
    "email": "jean@email.com",
    "role": "user"
  }
}
```

---

### POST `/auth/login`
Se connecter.

**Body:**
```json
{
  "email": "jean@email.com",
  "password": "monpassword"
}
```

**Réponse 200:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1N...",
  "user": { "id": "...", "name": "...", "role": "user" }
}
```

---

### GET `/auth/profile` 🔒 User
Obtenir son profil.

---

### PUT `/auth/profile` 🔒 User
Modifier son profil.

**Body:**
```json
{
  "name": "Jean K. Mukeba",
  "phone": "+243812345678",
  "address": { "quartier": "Limete", "commune": "Limete" }
}
```

---

### GET `/auth/users` 🔒 Admin
Lister tous les utilisateurs.

---

## PRODUITS

### GET `/products`
Lister les produits (public).

**Query params:**
| Param | Type | Exemple | Description |
|---|---|---|---|
| `category` | string | `ps5` | Filtrer par catégorie |
| `search` | string | `fifa` | Recherche full-text |
| `sort` | string | `price-asc` | Tri |
| `page` | number | `1` | Page |
| `limit` | number | `20` | Produits par page |

**Valeurs `sort`:** `newest` `price-asc` `price-desc` `popular`

**Réponse 200:**
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "pages": 8,
  "currentPage": 1,
  "products": [ { ... } ]
}
```

---

### GET `/products/:id`
Un produit par ID (public).

---

### POST `/products` 🔒 Admin
Créer un produit (multipart/form-data).

**Form fields:**
```
name         string   requis
description  string   requis
price        number   requis
oldPrice     number   optionnel
category     string   requis  (ps5|ps4|ps3|iphone|nintendo|accessoires|autre)
stock        number   requis
badge        string   optionnel  (new|sale|popular)
images       file[]   optionnel  (max 5 fichiers, max 5MB chacun)
```

---

### PUT `/products/:id` 🔒 Admin
Modifier un produit (multipart/form-data). Mêmes champs que POST.

---

### DELETE `/products/:id` 🔒 Admin
Supprimer un produit (supprime aussi les images Cloudinary).

---

### DELETE `/products/:id/images/:publicId` 🔒 Admin
Supprimer une image spécifique d'un produit.

---

## COMMANDES

### POST `/orders` 🔒 User
Passer une commande.

**Body:**
```json
{
  "items": [
    { "product": "64f...", "quantity": 1 },
    { "product": "64f...", "quantity": 2 }
  ],
  "shippingAddress": {
    "name": "Jean Mukeba",
    "phone": "+243812345678",
    "quartier": "Limete",
    "commune": "Limete",
    "ville": "Kinshasa",
    "notes": "Appeler avant de venir"
  },
  "paymentMethod": "cash",
  "notes": "Livraison en après-midi svp"
}
```

**Valeurs `paymentMethod`:** `cash` `mobile_money` `whatsapp`

**Réponse 201:**
```json
{
  "success": true,
  "message": "Commande créée !",
  "order": {
    "_id": "64f...",
    "orderStatus": "pending",
    "totalAmount": 625,
    "deliveryFee": 0,
    ...
  }
}
```

---

### GET `/orders/my` 🔒 User
Mes commandes.

---

### GET `/orders/:id` 🔒 User/Admin
Détail d'une commande.

---

### GET `/orders` 🔒 Admin
Toutes les commandes.

**Query params:**
| Param | Valeurs |
|---|---|
| `status` | `pending` `confirmed` `processing` `shipped` `delivered` `cancelled` |
| `page` | number |
| `limit` | number |

---

### PUT `/orders/:id` 🔒 Admin
Modifier le statut d'une commande.

**Body:**
```json
{
  "orderStatus": "shipped",
  "paymentStatus": "paid"
}
```

**Valeurs `orderStatus`:** `pending` → `confirmed` → `processing` → `shipped` → `delivered` / `cancelled`

**Valeurs `paymentStatus`:** `pending` `paid` `failed`

---

### GET `/orders/stats` 🔒 Admin
Statistiques du dashboard.

**Réponse:**
```json
{
  "success": true,
  "stats": {
    "totalOrders": 124,
    "totalRevenue": 45820.50,
    "pendingOrders": 8,
    "revenueByMonth": [ ... ]
  }
}
```

---

## Codes d'erreur

| Code | Signification |
|---|---|
| `400` | Requête invalide (champ manquant, validation) |
| `401` | Non authentifié (token manquant ou expiré) |
| `403` | Accès refusé (pas admin) |
| `404` | Ressource introuvable |
| `500` | Erreur interne du serveur |

**Format d'erreur:**
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

---

## 🧪 Tester avec curl

```bash
# 1. S'inscrire
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# 2. Se connecter (récupérer le token)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 3. Voir les produits
curl http://localhost:5000/api/products

# 4. Voir son profil
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/profile
```
