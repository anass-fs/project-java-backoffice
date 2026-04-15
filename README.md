# 🏢 TECHSTORE Back-Office - Dashboard E-commerce

**Tableau de bord d'administration complet pour gestion e-commerce - Vanilla JavaScript (HTML/CSS/JS pur)**

[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow.svg)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

---

## 🎯 Aperçu du Projet

**TECHSTORE Back-Office** est une application web **100% JavaScript vanilla** (sans framework) permettant de gérer complètement une boutique e-commerce :

- 📊 Dashboard avec statistiques en temps réel
- 📦 Gestion des produits (CRUD)
- 👥 Gestion des clients
- 📋 Gestion des commandes
- 💰 Gestion des factures
- 🏷️ Gestion des catégories
- 👨‍💼 Gestion des utilisateurs
- 🔐 Système d'authentification avec rôles (Admin/User)

### ✨ Technologies

- **Frontend** : HTML5, CSS3 (Responsive), JavaScript Vanilla
- **UI** : Bootstrap 5.3 + FontAwesome Icons
- **Graphiques** : Chart.js pour visualisations
- **Stockage** : LocalStorage/SessionStorage (pas de backend requis)
- **Thème** : Mode clair/sombre

---

## 🚀 Fonctionnalités Principales

### ✅ Dashboard Intelligent
- KPI Cards (Utilisateurs, Commandes, Revenus, Commandes en attente)
- Graphiques interactifs (Doughnut, Line, Bar charts)
- Statistiques en temps réel

### ✅ Gestion Complète des Entités
- **Produits** : Ajouter, modifier, supprimer avec images
- **Clients** : Gestion des informations client
- **Commandes** : Suivi des commandes (statuts multiples)
- **Factures** : Génération et suivi
- **Catégories** : Organisation des produits
- **Utilisateurs** : Gérer les comptes admins (Admin only)

### ✅ Fonctionnalités Avancées
- 🔍 Recherche rapide et filtrage
- 📄 Export CSV pour tous les modules
- 📱 Design Responsive (Desktop, Tablet, Mobile)
- 🌓 Mode sombre/clair (Ctrl+D)
- 🎨 UI/UX moderne et intuitive
- ⌨️ Raccourcis clavier (Ctrl+/, etc.)

### ✅ Système d'Authentification
- ✨ **Nouveau** : Boutons de connexion démo (Admin/User)
- 🔐 Gestion des rôles (Admin = accès complet, User = consultation)
- 👤 Badge de rôle affiché dans topbar
- 🛡️ Restriction des droits basée sur le rôle
- 💾 Persistence avec localStorage

### ✅ Accès Démo Rapide
```
Admin   : admin@app.com / admin123
User    : user@app.com / user123
```
Cliquez simplement sur "Démo - Mode Admin" ou "Démo - Mode User" ! 🎯

---

## 📦 Installation & Utilisation

### 1. **Clone ou télécharge le projet**
```bash
git clone https://github.com/anasazari000/Projet-java-backend.git
cd Projet-java-backend
```

### 2. **Ouvre le projet**
```bash
# Option 1 : Ouvre simplement index.html
open index.html

# Option 2 : Avec un serveur local (recommandé)
python -m http.server 8000
# Puis va à http://localhost:8000
```

### 3. **Accède avec les comptes démo**
- Clique sur **"Démo - Mode Admin"** pour accès complet
- Clique sur **"Démo - Mode User"** pour accès consultation

---

## 📁 Structure du Projet

```
Projet java backend/
├── index.html                          # Page de connexion
├── dashboard.html                      # Dashboard principal
├── products.html                       # Gestion des produits
├── clients.html                        # Gestion des clients
├── orders.html                         # Gestion des commandes
├── invoices.html                       # Gestion des factures
├── categories.html                     # Gestion des catégories
├── users.html                          # Gestion des utilisateurs (Admin only)
│
├── js/                                 # Scripts JavaScript
│   ├── config.js                       # Configuration (utilisateurs, données par défaut)
│   ├── auth.js                         # Authentification + Connexion démo ✨
│   ├── main.js                         # Logique principale + Sidebar
│   ├── utils.js                        # Fonctions utilitaires + Gestion des rôles ✨
│   ├── dashboard.js                    # Logique du dashboard
│   ├── products.js                     # Gestion des produits
│   ├── clients.js                      # Gestion des clients
│   ├── orders.js                       # Gestion des commandes
│   ├── invoices.js                     # Gestion des factures
│   ├── categories.js                   # Gestion des catégories
│   ├── users.js                        # Gestion des utilisateurs
│   ├── shortcuts.js                    # Raccourcis clavier
│   ├── theme.js                        # Gestion mode sombre/clair
│   └── main.js                         # Comportement général
│
├── css/
│   └── style.css                       # Styles globaux (mode clair/sombre)
│
├── assets/
│   └── images/                         # Images et logos
│
└── Documentation/
    ├── README.md                       # Ce fichier
    ├── LISEZ_MOI_DABORD.txt           # Guide ultra-rapide
    ├── INSTALLATION_DEMO_LOGIN.md     # Setup de la connexion démo
    ├── VERIFICATION_CHECKLIST.md      # Checklist de vérification
    └── CODE_AJOUTE.md                 # Détail du code ajouté
```

---

## 🎨 Interface Utilisateur

### Page de Connexion
```
🔐 Formulaire classique (email + mot de passe + rôle)
OU
🚀 Boutons démo ultra-rapides (Admin / User)
```

### Dashboard
```
📊 KPI Cards (Utilisateurs, Commandes, Revenus)
📈 Graphiques interactifs en temps réel
📋 Données actualisées instantanément
```

### Pages de Gestion
```
🔍 Recherche + Filtres avancés
📄 Export CSV un-clic
📱 Responsive et fluide
```

---

## 🔐 Système de Rôles

### 👑 Role Admin
- ✅ Vue d'accès complet
- ✅ Ajouter des éléments
- ✅ Modifier les éléments
- ✅ Supprimer les éléments
- ✅ Gérer les utilisateurs
- ✅ Export des données

### 👤 Role User
- ✅ Vue des données (consultation)
- ❌ Pas d'ajout/modification/suppression (boutons masqués)
- ❌ Pas d'accès à la gestion des utilisateurs
- ✅ Peut exporter (lecture seule)

---

## 💾 Stockage des Données

### Pas de Backend Requis ! 🎉
- Toutes les données sont stockées en **localStorage**
- Persistance automatique entre les sessions
- Structure JSON simple et efficace

### Données Initiales
Le projet inclut des données de démonstration :
- 2 utilisateurs (Admin + User)
- 20 produits variés
- 4 catégories
- 2 clients d'exemple
- 10 commandes d'exemple
- Factures associées

---

## 🛠️ Fonctionnalités Techniques

### Recherche Rapide Globale (Ctrl+K)
- Recherche dans tous les modules
- Résultats instantanés
- Navigation au clavier

### Raccourcis Clavier
```
Ctrl+D      Mode sombre/clair
Ctrl+/      Afficher les raccourcis
Ctrl+K      Recherche rapide
```

### Export CSV
- Tous les modules supportent l'export
- Formatage automatique
- Téléchargement direct

### Pagination
- Configurable (10, 25, 50 lignes)
- Navigation facile
- Filtre et tri persistants

---

## 📈 Performance

✅ **Chargement rapide** : < 2 secondes
✅ **Pas de serveur backend** : Fonctionnement autonome
✅ **Poids léger** : ~200 KB de données initiales
✅ **Responsive** : Optimisé pour tous les écrans

---

## 🌐 Compatibilité Navigateur

| Navigateur | Support |
|-----------|---------|
| Chrome | ✅ 100% |
| Firefox | ✅ 100% |
| Safari | ✅ 100% |
| Edge | ✅ 100% |
| Opera | ✅ 100% |

---

## 📸 Screenshots

### Dashboard Admin
```
[Dashboard avec KPI, graphiques, et statistiques]
Admin badge en haut à droite
Toutes les fonctionnalités visibles
```

### Dashboard User (Mode Lecture)
```
[Dashboard similaire mais sans boutons d'action]
User badge bleu en haut à droite
Interface consultation seulement
```

### Page Produits (Admin)
```
Bouton "Ajouter un produit" visible
Boutons "Modifier" et "Supprimer" visibles
Export CSV disponible
```

### Page Produits (User)
```
Bouton "Ajouter" MASQUÉ
Boutons "Modifier/Supprimer" MASQUÉS
Export CSV disponible (consultation)
```

---

## 🚀 Deploiement

### Option 1 : Hébergement Statique (Recommandé)
```bash
# Netlify
netlify deploy --prod --dir=.

# Vercel
vercel

# GitHub Pages
git push origin main

# Hostinger / OVH / autre hébergement
# Télécharge les fichiers via FTP
```

### Option 2 : Serveur Local
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npm install -g http-server
http-server

# PHP
php -S localhost:8000
```

### Option 3 : Docker (Si vous avez Docker)
```dockerfile
FROM nginx:latest
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔄 Mise à Jour & Maintenance

### Ajouter un Nouveau Module
1. Crée une nouvelle page HTML (ex: `notifications.html`)
2. Ajoute le lien dans `main.js` (sidebar)
3. Crée un fichier JS dédié
4. Appelle `Utils.displayUserRole()` et `Utils.applyRoleBasedRestrictions()`

### Modifier les Données
- Éditez `js/config.js` pour les données par défaut
- Les modifications sont persistantes en localStorage

### Ajouter dans Sidebar
Modifiez dans `dashboard.html` (et autres pages) la section `<ul class="sidebar-menu">`

---

## 🐛 Dépannage

### Problème : Les données ne persistent pas
**Solution** : Vérifiez que localStorage est activé dans les paramètres navigateur

### Problème : Les boutons User restent visibles
**Solution** : Videz le cache (Ctrl+Maj+Suppr) et rafraîchissez (F5)

### Problème : Pas d'accès à /users.html en tant que User
**Solution** : C'est normal ! 👑 Seuls les Admins peuvent y accéder

---

## 📝 Licence

MIT License - Libre d'utilisation, modification et distribution

---

## 👨‍💻 Auteur

**Anas Zaari**  
E-commerce Developer | JavaScript Specialist
- 📧 Contact : anass@gmail.com
- 💼 LinkedIn : [linkedin.com/in/anaszaari](https://linkedin.com/in/anaszaari)
- 🌐 Portfolio : [anaszaari.com](https://anaszaari.com)

---

## 🎓 Point Clé

**Ce projet démontre** :
✅ Expertise en JavaScript vanilla (aucun framework)
✅ UI/UX design moderne et responsive
✅ Gestion d'état complexe sans Redux/Context
✅ Architecture modulaire et maintenable
✅ Système d'authentification et autorisation
✅ Exportation de données et rapports
✅ Intégration de graphiques et d'analytics
✅ Best practices en développement frontend

---

## 🙏 Remerciements

- Bootstrap 5.3 pour le design
- Chart.js pour les graphiques
- FontAwesome pour les icônes
- Adobe pour l'inspiration design

---

**Merci de visiter ce projet ! ⭐ N'hésitez pas à le forker et à y contribuer !**

Pour plus d'information, consultez les fichiers de documentation détaillée.


