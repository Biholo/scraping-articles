# Scraping d'Articles - Blog du Modérateur

Ce projet permet de scraper, stocker et visualiser les articles du Blog du Modérateur. Il est composé de trois parties principales :
- Un scraper Python pour récupérer les articles
- Une API REST en Python pour servir les données
- Une interface web en React/TypeScript pour visualiser les articles

## Fonctionnalités

### Scraping
- Récupération automatique des articles par catégorie
- Extraction des métadonnées (titre, auteur, date, etc.)
- Gestion des images et des tags
- Stockage dans MongoDB
- Logging détaillé des opérations

### API
- Endpoints REST pour accéder aux articles
- Filtrage par catégorie, sous-catégorie, auteur, etc.
- Pagination et tri des résultats
- Gestion des erreurs et CORS

### Interface Web
- Affichage des articles en grille
- Filtrage par catégorie et sous-catégorie
- Recherche par titre
- Pagination
- Design responsive avec Tailwind CSS

## Prérequis

- Python 3.8+
- Node.js 16+
- MongoDB
- npm ou yarn

## Installation

### Backend (Scraping et API)

1. Installer les dépendances Python :
```bash
cd scraping
pip install -r requirements.txt

cd ../server
pip install -r requirements.txt
```

2. Configurer MongoDB :
- Créer un fichier `.env` dans le dossier `scraping` et `server` avec :
```
MONGO_URI=mongodb://localhost:27017/
DB_NAME=scraping_db
COLLECTION_NAME=articles
```

### Frontend

1. Installer les dépendances :
```bash
cd frontend
npm install
```

2. Configurer l'API :
- Créer un fichier `.env` dans le dossier `frontend` avec :
```
VITE_API_URL=http://localhost:5000
```

## Utilisation

### Scraping

Pour lancer le scraper :
```bash
cd scraping
python main.py
```

### API

Pour démarrer le serveur API :
```bash
cd server
python app.py
```

### Frontend

Pour démarrer l'interface web :
```bash
cd frontend
npm run dev
```

## Structure du Projet

```
.
├── scraping/                 # Module de scraping
│   ├── article_scraper.py    # Logique de scraping
│   ├── db_manager.py         # Gestion de MongoDB
│   ├── models.py             # Modèles de données
│   └── main.py              # Point d'entrée du scraper
│
├── server/                   # API REST
│   ├── app.py               # Application Flask
│   └── config.py            # Configuration
│
└── frontend/                # Interface web
    ├── src/                 # Code source
    │   ├── api/            # Services API
    │   ├── features/       # Composants principaux
    │   └── components/     # Composants réutilisables
    └── public/             # Assets statiques
```

## Technologies Utilisées

- **Backend**:
  - Python
  - Flask
  - MongoDB
  - BeautifulSoup
  - Requests

- **Frontend**:
  - React
  - TypeScript
  - Tailwind CSS
  - React Query
  - Vite
