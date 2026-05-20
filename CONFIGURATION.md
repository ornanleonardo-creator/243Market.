# ⚙️ Configuration — 243Market

---

## 1. Variables d'environnement (.env)

Copier le fichier `.env` et remplir chaque valeur :

```env
# ─── SERVEUR ───────────────────────────────────────────
PORT=5000
NODE_ENV=development        # changer en "production" sur Render

# ─── MONGODB ATLAS ────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/243market?retryWrites=true&w=majority

# ─── JWT ──────────────────────────────────────────────
JWT_SECRET=changez_cette_cle_par_une_longue_chaine_aleatoire_min_32_chars
JWT_EXPIRE=30d              # durée de vie du token (ex: 7d, 30d, 1y)

# ─── CLOUDINARY ───────────────────────────────────────
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

---

## 2. MongoDB Atlas — Configuration détaillée

### Créer le cluster
1. [cloud.mongodb.com](https://cloud.mongodb.com) → **New Project** → nommer `243market`
2. **Build a Database** → **M0 Free** → région `EU West` ou `US East`
3. Nom du cluster : `Cluster0`

### Créer l'utilisateur
```
Database Access → Add New Database User
  Authentication: Password
  Username: admin243market
  Password: (générer — ex: Mk$9xPq2@Kin243)
  Role: Atlas Admin
```

### Autoriser les connexions
```
Network Access → Add IP Address → 0.0.0.0/0 (Allow from Anywhere)
```
> Nécessaire pour que Render puisse se connecter.

### Obtenir l'URI
```
Clusters → Connect → Drivers → Node.js 4.1+
```
Exemple d'URI :
```
mongodb+srv://admin243market:Mk$9xPq2@Kin243@cluster0.ab1cd.mongodb.net/243market?retryWrites=true&w=majority
```

### Collections créées automatiquement
| Collection | Description |
|---|---|
| `users` | Comptes clients et admins |
| `products` | Catalogue produits |
| `orders` | Commandes clients |

---

## 3. Cloudinary — Configuration détaillée

### Compte et clés
1. [cloudinary.com](https://cloudinary.com) → **Sign Up Free**
2. Dashboard → copier :
   ```
   Cloud Name  : mon-cloud-243market
   API Key     : 123456789012345
   API Secret  : AbCdEfGhIjKlMnOpQrStUv
   ```

### Dossiers utilisés
```
243market/
└── products/    ← images produits uploadées automatiquement
```

### Paramètres d'upload (dans uploadMiddleware.js)
```js
{ folder: '243market/products', quality: 'auto', fetch_format: 'auto' }
```
- `quality: 'auto'` → Cloudinary optimise la qualité automatiquement
- `fetch_format: 'auto'` → Convertit en WebP si le navigateur le supporte
- Taille max par image : **5 MB**
- Formats acceptés : JPEG, PNG, WEBP, GIF
- Max images par produit : **5**

---

## 4. JWT — Configuration sécurité

### Générer une clé secrète forte
```bash
# Option 1 — Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2 — OpenSSL
openssl rand -hex 64
```

Exemple de clé générée :
```
a3f8c2d1e4b7a9f0c3d6e8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0
```

### Durées recommandées (JWT_EXPIRE)
| Contexte | Valeur |
|---|---|
| Développement | `7d` |
| Production standard | `30d` |
| Haute sécurité | `1d` |

---

## 5. Render — Configuration du service

### Paramètres Web Service
```
Name            : 243market-api
Region          : Frankfurt (EU) ou Oregon (US)
Branch          : main
Root Directory  : (laisser vide)
Runtime         : Node
Build Command   : npm install
Start Command   : node server.js
Auto-Deploy     : Yes
```

### Variables d'environnement sur Render
Aller dans : **Service → Environment → Add Environment Variable**

| Clé | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `votre_cle_secrete` |
| `JWT_EXPIRE` | `30d` |
| `CLOUDINARY_CLOUD_NAME` | `...` |
| `CLOUDINARY_API_KEY` | `...` |
| `CLOUDINARY_API_SECRET` | `...` |

---

## 6. CORS — Configuration par environnement

Dans `server.js`, le CORS est configuré ainsi :

```js
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://243market.com', 'https://votre-app.onrender.com']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

> En production, remplacer `'https://243market.com'` par votre vrai domaine.

---

## 7. Limites & Quotas (plans gratuits)

| Service | Limite gratuite |
|---|---|
| **MongoDB Atlas M0** | 512 MB stockage, 100 connexions simultanées |
| **Cloudinary Free** | 25 GB bande passante/mois, 25 crédits |
| **Render Free** | Mise en veille après 15 min d'inactivité |
| **Render Free** | 750 heures/mois de runtime |

### Conseils pour rester dans les limites gratuites
- Compresser les images avant upload (max 800px largeur)
- Utiliser `quality: 'auto'` Cloudinary (déjà configuré)
- Paginer les requêtes MongoDB (déjà configuré, `limit: 20`)
- Supprimer les images Cloudinary quand on supprime un produit (déjà configuré)

---

## 8. Sécurité — Checklist production

- [ ] `JWT_SECRET` est une chaîne aléatoire d'au moins 64 caractères
- [ ] `.env` est dans `.gitignore` (ne jamais committer)
- [ ] `NODE_ENV=production` sur Render
- [ ] CORS limité aux domaines autorisés
- [ ] Mot de passe MongoDB Atlas fort (majuscules + chiffres + symboles)
- [ ] IP Whitelist MongoDB vérifiée (`0.0.0.0/0` ou IP Render fixe)
- [ ] Taille max upload limitée à 5MB (déjà configuré)
- [ ] Compte admin créé avec un mot de passe fort

---

## 9. Configuration locale (développement)

```bash
# Installer les dépendances
npm install

# Lancer avec nodemon (rechargement auto)
npm run dev

# Lancer en mode production
npm start

# Vérifier que le serveur tourne
curl http://localhost:5000/api/health
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "store": "243Market",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## 10. Personnalisation du store

### Changer le nom du store
Rechercher et remplacer `243Market` dans tous les fichiers HTML.

### Changer les couleurs (public/css/style.css)
```css
:root {
  --neon:  #00e5ff;   /* Couleur principale (cyan) */
  --neon2: #ff3d6e;   /* Couleur secondaire (rose) */
  --gold:  #ffd700;   /* Prix (or) */
}
```

### Ajouter une catégorie
1. `models/Product.js` → ajouter dans `enum` du champ `category`
2. `public/products.html` → ajouter un item dans la sidebar
3. `public/index.html` → ajouter un lien dans les catégories
4. `public/admin.html` → ajouter une `<option>` dans le formulaire produit

### Changer la devise
Dans `public/js/app.js`, modifier la fonction `fmtPrice` :
```js
// Avant (dollars)
function fmtPrice(n) { return `$${Number(n).toFixed(2)}`; }

// Après (francs congolais)
function fmtPrice(n) { return `${Number(n).toLocaleString('fr-CD')} FC`; }
```

---

*243Market © 2025 — Kinshasa, RD Congo 🇨🇩*
