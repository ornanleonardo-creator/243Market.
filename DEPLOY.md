# 🚀 Guide de Déploiement — 243Market

## Architecture

```
Frontend (HTML/JS) ──► Backend API (Render) ──► MongoDB Atlas
                                │
                                └──► Cloudinary (images)
```

---

## Étape 1 — MongoDB Atlas

1. Aller sur [mongodb.com/atlas](https://cloud.mongodb.com)
2. Créer un compte gratuit
3. Cliquer **"Build a Database"** → choisir **M0 Free**
4. Choisir la région la plus proche (ex: `EU West`)
5. Créer un **utilisateur** Database :
   - Username: `admin243`
   - Password: (générer un mot de passe fort, le noter)
6. **Network Access** → Add IP Address → `0.0.0.0/0` (autoriser tout)
7. **Connect** → **"Connect your application"**
8. Copier l'URI :
   ```
   mongodb+srv://admin243:<password>@cluster0.xxxxx.mongodb.net/243market
   ```
9. Remplacer `<password>` par votre mot de passe

---

## Étape 2 — Cloudinary

1. Aller sur [cloudinary.com](https://cloudinary.com)
2. Créer un compte gratuit
3. Sur le Dashboard, noter :
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Étape 3 — GitHub

1. Créer un repo sur [github.com](https://github.com)
2. Dans votre dossier projet :
   ```bash
   git init
   git add .
   git commit -m "Initial commit — 243Market"
   git remote add origin https://github.com/votre-user/243market.git
   git push -u origin main
   ```
   > ⚠️ Le fichier `.env` est dans `.gitignore` — il ne sera PAS envoyé sur GitHub. C'est normal.

---

## Étape 4 — Render (Backend + Frontend)

1. Aller sur [render.com](https://render.com) → créer un compte
2. **New** → **Web Service**
3. Connecter votre repo GitHub
4. Configurer le service :

| Paramètre | Valeur |
|---|---|
| **Name** | `243market-api` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | Free |

5. Onglet **Environment** → ajouter les variables :

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://admin243:...@cluster0.../243market
JWT_SECRET=une_cle_tres_secrete_longue_et_aleatoire
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

6. Cliquer **"Create Web Service"**
7. Attendre le déploiement (3-5 min)
8. Votre URL sera : `https://243market-api.onrender.com`

---

## Étape 5 — Créer le compte Admin

Après déploiement, exécuter cette requête (avec curl, Postman, ou Insomnia) :

```bash
curl -X POST https://243market-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin 243Market",
    "email": "admin@243market.com",
    "password": "VotreMotDePasseAdmin"
  }'
```

Ensuite, dans **MongoDB Atlas** → Collections → Users → modifier le champ `role` de `"user"` à `"admin"`.

---

## Étape 6 — Test de l'API

```bash
# Health check
curl https://243market-api.onrender.com/api/health

# Réponse attendue:
# {"status":"OK","store":"243Market","timestamp":"..."}
```

---

## Étape 7 — Accès aux pages

| Page | URL |
|---|---|
| Accueil | `https://243market-api.onrender.com/` |
| Produits | `https://243market-api.onrender.com/products.html` |
| Panier | `https://243market-api.onrender.com/cart.html` |
| Admin | `https://243market-api.onrender.com/admin.html` |

---

## ⚠️ Notes importantes

- Le plan **gratuit Render** met le serveur en veille après 15 min d'inactivité (premier chargement = ~30s)
- Pour éviter la veille : upgrader vers le plan **Starter ($7/mois)**
- MongoDB Atlas M0 = 512MB de stockage (suffisant pour commencer)
- Cloudinary plan gratuit = 25GB/mois de bande passante

---

## 🔧 Commandes utiles

```bash
# Développement local
npm run dev

# Production
npm start

# Voir les logs sur Render
# → Dashboard Render → votre service → "Logs"
```

---

## 🆘 Problèmes courants

| Problème | Solution |
|---|---|
| `MongoServerError: bad auth` | Vérifier le mot de passe dans MONGO_URI |
| `Cannot connect to MongoDB` | Vérifier que l'IP `0.0.0.0/0` est whitelistée |
| Images ne s'uploadent pas | Vérifier les clés Cloudinary |
| `JWT malformed` | Vérifier JWT_SECRET dans les variables Render |
| Site lent au premier chargement | Normal sur le plan gratuit (cold start) |
