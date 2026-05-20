# 🎮 243Market — E-commerce Full Stack

> Boutique gaming & tech pour Kinshasa, RD Congo 🇨🇩

![Stack](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![Cloudinary](https://img.shields.io/badge/Images-Cloudinary-blue) ![Deploy](https://img.shields.io/badge/Deploy-Render-purple)

---

## 📁 Structure du projet

```
ecommerce-project/
├── server.js               # Point d'entrée Express
├── package.json
├── .env                    # Variables d'environnement (ne pas committer)
├── .gitignore
│
├── config/
│   ├── db.js               # Connexion MongoDB Atlas
│   └── cloudinary.js       # Config Cloudinary
│
├── models/
│   ├── Product.js          # Schéma produit
│   ├── User.js             # Schéma utilisateur + bcrypt
│   └── Order.js            # Schéma commande
│
├── routes/
│   ├── productRoutes.js
│   ├── authRoutes.js
│   └── orderRoutes.js
│
├── controllers/
│   ├── productController.js
│   ├── authController.js
│   └── orderController.js
│
├── middleware/
│   ├── authMiddleware.js   # JWT protect + adminOnly
│   └── uploadMiddleware.js # Multer + Cloudinary stream
│
└── public/
    ├── index.html          # Page d'accueil
    ├── products.html       # Catalogue produits
    ├── cart.html           # Panier + checkout
    ├── admin.html          # Dashboard admin
    ├── css/style.css
    └── js/
        ├── app.js          # API layer + Cart + utilitaires
        ├── cart.js         # Logique panier/commande
        └── admin.js        # CRUD admin
```

---

## 🚀 Installation locale

### 1. Cloner / extraire le projet
```bash
cd 243market
npm install
```

### 2. Configurer les variables d'environnement
```bash
cp .env .env.local
# Éditer .env avec vos vraies clés
```

### 3. Lancer en développement
```bash
npm run dev
# → http://localhost:5000
```

---

## ⚙️ Variables d'environnement (.env)

| Variable | Description |
|---|---|
| `PORT` | Port du serveur (défaut: 5000) |
| `MONGO_URI` | URI de connexion MongoDB Atlas |
| `JWT_SECRET` | Clé secrète JWT (choisir une longue chaîne) |
| `JWT_EXPIRE` | Durée du token (ex: `30d`) |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary |

---

## 🌐 API Endpoints

### 🔐 Auth
| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Inscription | Public |
| POST | `/api/auth/login` | Connexion | Public |
| GET | `/api/auth/profile` | Mon profil | User |
| PUT | `/api/auth/profile` | Modifier profil | User |
| GET | `/api/auth/users` | Tous les users | Admin |

### 📦 Produits
| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/products` | Liste produits | Public |
| GET | `/api/products/:id` | Un produit | Public |
| POST | `/api/products` | Créer produit | Admin |
| PUT | `/api/products/:id` | Modifier produit | Admin |
| DELETE | `/api/products/:id` | Supprimer produit | Admin |

**Query params GET /products:**
- `?category=ps5` — Filtrer par catégorie
- `?search=fifa` — Recherche full-text
- `?sort=price-asc` — Trier (newest, price-asc, price-desc, popular)
- `?page=1&limit=20` — Pagination

### 🧾 Commandes
| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/orders` | Créer commande | User |
| GET | `/api/orders/my` | Mes commandes | User |
| GET | `/api/orders/:id` | Une commande | User/Admin |
| GET | `/api/orders` | Toutes commandes | Admin |
| PUT | `/api/orders/:id` | Modifier statut | Admin |
| GET | `/api/orders/stats` | Statistiques | Admin |

---

## ☁️ Déploiement sur Render

1. Pousser le code sur GitHub
2. Créer un **Web Service** sur [render.com](https://render.com)
3. Connecter le repo GitHub
4. Configurer :
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Ajouter toutes les variables `.env` dans l'onglet **Environment**
6. Déployer ✅

---

## 🗄️ MongoDB Atlas

1. Créer un compte sur [mongodb.com/atlas](https://mongodb.com/atlas)
2. Créer un cluster gratuit (M0)
3. Créer un utilisateur DB
4. Whitelist l'IP `0.0.0.0/0` (pour Render)
5. Copier l'URI de connexion dans `.env`

---

## 🖼️ Cloudinary

1. Créer un compte sur [cloudinary.com](https://cloudinary.com)
2. Copier `Cloud Name`, `API Key`, `API Secret`
3. Les images sont uploadées dans le dossier `243market/products`

---

## 👤 Compte Admin

Après le premier déploiement, créer le compte admin via l'API :
```bash
curl -X POST https://votre-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@243market.com","password":"VotreMotDePasse","role":"admin"}'
```
> Ou modifier directement le rôle dans MongoDB Atlas.

---

## 📱 Catégories disponibles

| Code | Label |
|---|---|
| `ps5` | PlayStation 5 |
| `ps4` | PlayStation 4 |
| `ps3` | PlayStation 3 |
| `iphone` | iPhone |
| `nintendo` | Nintendo |
| `accessoires` | Accessoires |
| `autre` | Autre |

---

## 📞 Support

- WhatsApp : +243 XXX XXX XXX
- Email : contact@243market.com
- Kinshasa, RD Congo 🇨🇩

---

*243Market © 2025 — Tous droits réservés*
