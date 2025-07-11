# ToDoList Angular - Jhon

Une application de gestion de tâches moderne et intuitive développée avec Angular et connectée à l'API https://todof.woopear.fr/

![ToDoList Preview](https://via.placeholder.com/600x400/4f46e5/ffffff?text=Angular+ToDoList)

## 🚀 Fonctionnalités

- 🔐 **Authentification utilisateur** - Connexion sécurisée avec JWT
- ✅ **Gestion des tâches** - Créer, modifier, supprimer des tâches
- � **Statut des tâches** - Marquer comme terminé/actif
- 🔍 **Filtrage avancé** - Voir toutes, actives ou terminées
- � **Statistiques en temps réel** - Compteurs de tâches
- 💾 **Persistance serveur** - Données stockées sur l'API
- 📱 **Design responsive** - Material Design adaptatif
- 🎨 **Interface moderne** - Angular Material UI

## 🛠️ Technologies utilisées

- **Angular 17** - Framework frontend moderne
- **TypeScript** - Typage statique et fonctionnalités ES6+
- **Angular Material** - Composants UI Material Design
- **RxJS** - Programmation réactive
- **HTTP Client** - Communication avec l'API REST
- **JWT** - Authentification par tokens

## 🎯 Comment utiliser

### 🔑 Authentification
1. **Se connecter** : Utilisez les identifiants fournis
   - Email : `string@gmail.com` 
   - Mot de passe : `string`

### 📝 Gestion des tâches
1. **Créer une tâche** : Cliquez sur le bouton `+` flottant ou utilisez le bouton "Créer votre première tâche"
2. **Modifier une tâche** : Cliquez sur l'icône crayon à côté de la tâche
3. **Marquer comme terminée** : Utilisez la case à cocher
4. **Supprimer une tâche** : Cliquez sur l'icône poubelle
5. **Filtrer les tâches** : Utilisez les onglets "Toutes", "Actives", "Terminées"
6. **Supprimer les terminées** : Utilisez le bouton "Supprimer les tâches terminées"

## 🚀 Installation et lancement

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation
```bash
# Clonez le repository
git clone https://github.com/Taaazzz-prog/ToDoList-Jhon.git

# Naviguez dans le dossier
cd ToDoList-Jhon

# Installez les dépendances
npm install

# Lancez l'application en mode développement
ng serve

# Ouvrez http://localhost:4200 dans votre navigateur
```

### Production
```bash
# Construire pour la production
ng build --prod

# Les fichiers seront dans le dossier dist/
```

## 📁 Structure du projet

```
todolist-exo/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/              # Composant de connexion
│   │   │   ├── header/             # En-tête avec menu utilisateur
│   │   │   ├── task-list/          # Liste et gestion des tâches
│   │   │   └── task-form/          # Formulaire de création/édition
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Service d'authentification
│   │   │   └── task.service.ts     # Service de gestion des tâches
│   │   ├── models/
│   │   │   ├── user.model.ts       # Modèles utilisateur
│   │   │   └── task.model.ts       # Modèles de tâches
│   │   ├── guards/
│   │   │   └── auth.guard.ts       # Protection des routes
│   │   ├── app-routing.module.ts   # Configuration des routes
│   │   ├── app.module.ts           # Module principal
│   │   └── app.component.ts        # Composant racine
│   ├── index.html                  # Page HTML principale
│   ├── main.ts                     # Point d'entrée Angular
│   └── styles.scss                 # Styles globaux
├── angular.json                    # Configuration Angular
├── package.json                    # Dépendances npm
├── tsconfig.json                   # Configuration TypeScript
└── README.md
```

## 🔧 API Integration

L'application utilise l'API REST : `https://todof.woopear.fr/`

### Endpoints utilisés :
- `POST /auth/login` - Authentification
- `GET /tasks` - Récupérer les tâches
- `POST /tasks` - Créer une tâche
- `PUT /tasks/{id}` - Modifier une tâche
- `DELETE /tasks/{id}` - Supprimer une tâche
- `DELETE /tasks/completed` - Supprimer les tâches terminées

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Taaazzz-prog** - [Taaazzz-prog](https://github.com/Taaazzz-prog)

---

⭐ N'hésitez pas à donner une étoile si ce projet vous a plu !
