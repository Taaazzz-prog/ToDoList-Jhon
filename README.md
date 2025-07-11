# 📋 TodoList Angular

Une application moderne de gestion de tâches développée avec Angular 17, connectée à une API REST et utilisant Angular Material pour l'interface utilisateur.

## 🎯 Objectif de l'application

Cette application TodoList permet aux utilisateurs de gérer efficacement leurs tâches quotidiennes avec une interface intuitive et responsive. Elle offre toutes les fonctionnalités essentielles d'une application de gestion de tâches moderne.

## ✨ Fonctionnalités principales

### 🔐 Authentification
- **Connexion sécurisée** avec email et mot de passe
- **Inscription** de nouveaux utilisateurs
- **Gestion JWT** pour l'authentification persistante
- **Déconnexion automatique** en cas d'expiration du token

### 📝 Gestion des tâches
- **Création** de nouvelles tâches
- **Modification** du libellé des tâches existantes
- **Marquage** des tâches comme terminées/actives
- **Suppression individuelle** des tâches
- **Suppression en masse** des tâches terminées

### 🔍 Filtrage et organisation
- **Filtres intelligents** : Toutes, Actives, Terminées
- **Statistiques en temps réel** : compteurs dynamiques
- **Interface responsive** adaptée à tous les écrans

### 🎨 Interface utilisateur
- **Design moderne** avec Angular Material
- **Animations fluides** et transitions
- **Messages de feedback** (succès, erreurs, informations)
- **États de chargement** avec indicateurs visuels
- **Bouton flottant** pour l'ajout rapide de tâches

## 🛠️ Technologies utilisées

### Frontend
- **Angular 17** - Framework principal
- **TypeScript** - Langage de développement
- **Angular Material** - Composants UI
- **RxJS** - Programmation réactive
- **SCSS** - Styles avancés

### Backend & API
- **API REST** : `https://todof.woopear.fr/api/v1`
- **Authentification JWT**
- **Endpoints CRUD complets**

### Outils de développement
- **Angular CLI** - Outils de développement
- **Proxy CORS** - Configuration pour le développement local
- **Git** - Gestion de versions

## 🚀 Fonctionnalités avancées implémentées

### Suppression en masse optimisée
- **Stratégie hybride** : utilise l'endpoint officiel `POST /task/delete/user`
- **Fallback automatique** vers suppressions individuelles si nécessaire
- **Gestion d'erreurs robuste** avec continuité d'exécution
- **Logs détaillés** pour le debugging

### Gestion d'état réactive
- **Mise à jour en temps réel** de l'interface
- **Synchronisation automatique** avec l'API
- **Gestion des erreurs réseau** (CORS, timeouts)

### Interface utilisateur avancée
- **Bouton conditionnel** de suppression en masse
- **Messages contextuels** selon les actions
- **États vides** avec suggestions d'actions
- **Tooltips informatifs** sur les actions

## 📋 Endpoints API implémentés

| Endpoint | Méthode | Fonction | Statut |
|----------|---------|----------|---------|
| `GET /task` | ✅ | Récupération des tâches | Complet |
| `POST /task` | ✅ | Création de tâche | Complet |
| `PUT /task/{id}/done/user` | ✅ | Basculer statut terminé | Complet |
| `PUT /task/{id}/label/user` | ✅ | Modifier libellé | Complet |
| `DELETE /task/{id}/user` | ✅ | Suppression individuelle | Complet |
| `POST /task/delete/user` | ✅ | Suppression en masse | Complet |

## 🏃‍♂️ Démarrage rapide

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Angular CLI

### Installation et lancement
```bash
# Cloner le repository
git clone https://github.com/Taaazzz-prog/ToDoList-Jhon.git
cd ToDoList-Jhon

# Installer les dépendances
npm install

# Lancer en mode développement avec proxy CORS
npm run start

# Ou avec Angular CLI
ng serve --proxy-config proxy.conf.json
```

L'application sera accessible sur `http://localhost:4200`

### Comptes de test
Pour tester l'application, vous pouvez utiliser :
- **Email** : `popeye@suce.fr`
- **Mot de passe** : `147258`

## 📁 Structure du projet

```
src/
├── app/
│   ├── components/           # Composants Angular
│   │   ├── login/           # Connexion/Inscription
│   │   ├── task-list/       # Liste des tâches
│   │   ├── task-form/       # Formulaire de tâche
│   │   └── header/          # En-tête de navigation
│   ├── services/            # Services Angular
│   │   ├── auth.service.ts  # Authentification
│   │   └── task.service.ts  # Gestion des tâches
│   ├── models/              # Modèles TypeScript
│   │   ├── user.model.ts    # Modèle utilisateur
│   │   └── task.model.ts    # Modèle tâche
│   ├── guards/              # Guards de routage
│   │   └── auth.guard.ts    # Protection des routes
│   └── app-routing.module.ts # Configuration des routes
└── assets/                  # Ressources statiques
```

## 🎨 Captures d'écran

### Interface principale
- **Dashboard** avec statistiques en temps réel
- **Filtres par onglets** pour organiser les tâches
- **Actions contextuelles** sur chaque tâche

### Fonctionnalités clés
- **Suppression en masse** des tâches terminées
- **Messages de confirmation** pour toutes les actions
- **Interface responsive** pour mobile et desktop

## 🔧 Configuration

### Proxy CORS (développement local)
Le fichier `proxy.conf.json` configure le proxy pour éviter les problèmes CORS :
```json
{
  "/api/*": {
    "target": "https://todof.woopear.fr",
    "secure": true,
    "changeOrigin": true
  }
}
```

### Variables d'environnement
L'application détecte automatiquement l'environnement :
- **Développement** : utilise le proxy local
- **Production** : appelle directement l'API

## 📈 Évolutions futures possibles

### 🔮 Fonctionnalités utilisateur avancées
- **Notifications push** pour les rappels
- **Partage de tâches** entre utilisateurs
- **Catégories** et **étiquettes** pour organiser
- **Recherche avancée** dans les tâches
- **Export/Import** des données
- **Mode hors-ligne** avec synchronisation

### 👤 Endpoints utilisateur à implémenter

| Endpoint | Méthode | Fonction | Priorité |
|----------|---------|----------|----------|
| `DELETE /user` | 🔜 | Suppression du compte utilisateur | Haute |
| `POST /user/login` | 🔜 | Authentification (alternative) | Moyenne |
| `GET /user/profil` | 🔜 | Récupération du profil utilisateur | Haute |
| `POST /user/register` | 🔜 | Inscription (alternative) | Moyenne |

### 🛡️ Endpoints administrateur (futures)

| Endpoint | Méthode | Fonction | Complexité |
|----------|---------|----------|------------|
| `DELETE /task/delete/all` | 🔜 | Suppression de toutes les tâches (admin) | Élevée |
| `POST /task/delete/tasks` | 🔜 | Suppression de tâches spécifiques (admin) | Moyenne |
| `POST /user/users` | 🔜 | Suppression d'utilisateurs spécifiques (admin) | Élevée |
| `DELETE /user/users/all` | 🔜 | Suppression de tous les utilisateurs (admin) | Critique |

### 🎯 Prochaines étapes de développement

#### Phase 1 - Gestion du profil utilisateur
1. **Page profil** avec informations personnelles
2. **Modification** des données utilisateur
3. **Suppression de compte** avec confirmation
4. **Statistiques personnelles** d'utilisation

#### Phase 2 - Fonctionnalités avancées
1. **Système de rôles** (utilisateur/admin)
2. **Interface d'administration** pour la gestion
3. **Logs d'activité** et audit trail
4. **Sauvegarde/Restauration** des données

#### Phase 3 - Migration vers backend personnalisé 🚀

##### � **Stratégie de migration recommandée**

**🎯 Recommandation : Continuer avec l'API actuelle en priorité**

L'architecture Angular actuelle est **parfaitement conçue** pour une migration facile. Il est recommandé de :

1. **Perfectionner l'application frontend** avec l'API actuelle (2-3 mois)
2. **Implémenter toutes les fonctionnalités Angular** possibles
3. **Optimiser l'UX/UI** et les performances
4. **Puis migrer vers le backend personnalisé** quand tout sera parfait

##### 🔄 **Pourquoi cette approche est optimale :**

**Avantages à court terme :**
- ✅ **Focus sur Angular** et l'amélioration continue
- ✅ **Moins de complexité** - Une seule technologie à la fois
- ✅ **Résultats rapides** sur les fonctionnalités utilisateur
- ✅ **Apprentissage progressif** des bonnes pratiques

**Migration facilitée :**
- ✅ **Services Angular déjà structurés** - Seule l'URL change !
- ✅ **Modèles TypeScript compatibles** avec MongoDB
- ✅ **Architecture modulaire** prête pour la transition
- ✅ **Tests déjà en place** pour valider la migration

##### 🛠️ **Facilité de la migration technique**

**Changements minimes requis :**
```typescript
// AVANT (API actuelle)
private readonly API_URL = 'https://todof.woopear.fr/api/v1';

// APRÈS (Backend personnel)
private readonly API_URL = 'http://localhost:3000/api/v1';
```

**Services Angular inchangés :**
- ✅ `AuthService` - Même logique JWT
- ✅ `TaskService` - Mêmes méthodes HTTP
- ✅ Composants - Aucune modification nécessaire
- ✅ Models - Compatible avec MongoDB/MySQL

##### �🔄 Transition technologique
À terme, l'application migrera vers un **backend personnalisé** pour une autonomie complète :

**Stack technique envisagée :**
- **Backend** : Node.js + Express.js
- **Base de données** : MongoDB ou MySQL (choix basé sur les besoins)
- **Authentification** : JWT + bcrypt pour le hachage
- **API** : REST API complète personnalisée

##### 📊 Comparaison des options de base de données

| Critère | MongoDB | MySQL | Recommandation |
|---------|---------|-------|----------------|
| **Flexibilité des données** | ✅ NoSQL, schéma flexible | ⚠️ Schéma rigide | MongoDB pour prototypage rapide |
| **Performance lecture** | ✅ Très rapide | ✅ Rapide | Équivalent |
| **Intégrité des données** | ⚠️ Moins stricte | ✅ ACID complet | MySQL pour données critiques |
| **Simplicité d'usage** | ✅ JSON natif | ⚠️ Relations complexes | MongoDB pour ce projet |
| **Écosystème Node.js** | ✅ Mongoose excellent | ✅ Sequelize/Prisma | MongoDB légèrement avantagé |

**Choix recommandé : MongoDB** 
- ✅ Parfait pour les tâches (documents JSON)
- ✅ Développement plus rapide
- ✅ Pas de migrations complexes
- ✅ Excellente intégration avec Node.js

##### 🏗️ Architecture du futur backend

```
Backend Personnel/
├── src/
│   ├── controllers/          # Logique métier
│   │   ├── auth.controller.js    # Authentification
│   │   ├── user.controller.js    # Gestion utilisateurs
│   │   ├── task.controller.js    # Gestion tâches
│   │   └── admin.controller.js   # Fonctions admin
│   ├── models/               # Modèles de données
│   │   ├── User.js              # Schéma utilisateur
│   │   ├── Task.js              # Schéma tâche
│   │   └── index.js             # Export des modèles
│   ├── routes/               # Routes API
│   │   ├── auth.routes.js       # Routes authentification
│   │   ├── user.routes.js       # Routes utilisateur
│   │   ├── task.routes.js       # Routes tâches
│   │   └── admin.routes.js      # Routes administration
│   ├── middleware/           # Middlewares
│   │   ├── auth.middleware.js   # Vérification JWT
│   │   ├── admin.middleware.js  # Vérification admin
│   │   └── validation.middleware.js # Validation données
│   ├── config/               # Configuration
│   │   ├── database.js          # Connexion DB
│   │   └── jwt.config.js        # Configuration JWT
│   └── app.js                # Point d'entrée Express
├── package.json              # Dépendances Node.js
└── README.md                 # Documentation backend
```

##### 🎯 Avantages de la migration

**Autonomie complète :**
- ✅ **Contrôle total** sur l'API et les données
- ✅ **Personnalisation** selon les besoins exacts
- ✅ **Performance optimisée** pour nos cas d'usage
- ✅ **Sécurité renforcée** avec nos propres règles

**Fonctionnalités avancées possibles :**
- ✅ **Système de rôles** complet (user/admin/moderator)
- ✅ **API analytics** pour les statistiques
- ✅ **Webhooks** pour les intégrations
- ✅ **Rate limiting** personnalisé
- ✅ **Logs détaillés** et monitoring
- ✅ **Backup automatique** des données

**Évolutivité :**
- ✅ **Microservices** si nécessaire
- ✅ **Cache Redis** pour les performances
- ✅ **API GraphQL** en complément
- ✅ **WebSockets** pour le temps réel

## 👨‍💻 Développeur

**Taaazzz-prog** - Développeur principal

---

*Application développée avec ❤️ en utilisant Angular et les meilleures pratiques de développement moderne.*
