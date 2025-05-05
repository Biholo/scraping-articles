#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script principal pour le scraping des articles du Blog du Modérateur.
"""

import logging
import sys
import os
from dotenv import load_dotenv

from article_scraper import ArticleScraper

# Chargement des variables d'environnement depuis .env
load_dotenv()

# Configuration du logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("scraping_bdm.log")
    ]
)

# Désactiver les logs de debug trop verbeux pour certains modules
logging.getLogger("urllib3").setLevel(logging.INFO)
logging.getLogger("requests").setLevel(logging.INFO)
logging.getLogger("chardet").setLevel(logging.INFO)

logger = logging.getLogger(__name__)

# URLs des catégories à scraper
CATEGORIES = [
   {
        "url": "https://www.blogdumoderateur.com/tech/",
        "nom": "Tech"
    },
    {
        "url": "https://www.blogdumoderateur.com/web/",
        "nom": "Web"
    },
    {
        "url": "https://www.blogdumoderateur.com/social/",
        "nom": "Social"
    },
     {
        "url": "https://www.blogdumoderateur.com/marketing/",
        "nom": "Marketing"
    }
]

def main() -> int:
    """
    Point d'entrée principal du script.
    
    Returns:
        Code de retour (0 en cas de succès, 1 en cas d'erreur)
    """
    # Paramètres pour le scraping
    max_pages = int(os.getenv('MAX_PAGES', '500'))  # Nombre de pages à scraper par catégorie
    
    try:
        # Statistiques globales
        stats_globales = {
            "pages_visitees": 0,
            "articles_trouves": 0,
            "articles_inseres": 0,
            "articles_mis_a_jour": 0
        }
        
        # Création d'une seule collection pour tous les articles
        collection_name = os.getenv('COLLECTION_NAME', 'articles')
        
        # Scraper chaque catégorie
        for categorie in CATEGORIES:
            logger.info(f"=== Début du scraping de la catégorie {categorie['nom']} ===")
            
            # Création du scraper avec une collection unique
            scraper = ArticleScraper(
                collection_name=collection_name,
                timeout=int(os.getenv('TIMEOUT', '30')),
                max_workers=int(os.getenv('MAX_WORKERS', '5'))
            )
            
            # Exécution du scraping
            stats = scraper.executer(
                url_depart=categorie['url'],
                max_pages=max_pages,
                categorie_forcee=categorie['nom']  # Passer la catégorie au scraper
            )
            
            # Mise à jour des statistiques globales
            stats_globales["pages_visitees"] += stats["pages_visitees"]
            stats_globales["articles_trouves"] += stats["articles_trouves"]
            stats_globales["articles_inseres"] += stats["articles_inseres"]
            stats_globales["articles_mis_a_jour"] += stats["articles_mis_a_jour"]
            
            # Affichage des statistiques pour cette catégorie
            logger.info(f"=== Fin du scraping de la catégorie {categorie['nom']} ===")
            logger.info(f"Pages visitées: {stats['pages_visitees']}")
            logger.info(f"Articles trouvés: {stats['articles_trouves']}")
            logger.info(f"Articles insérés: {stats['articles_inseres']}")
            logger.info(f"Articles mis à jour: {stats['articles_mis_a_jour']}")
        
        # Affichage des statistiques globales
        logger.info("=== Statistiques globales ===")
        logger.info(f"Total des pages visitées: {stats_globales['pages_visitees']}")
        logger.info(f"Total des articles trouvés: {stats_globales['articles_trouves']}")
        logger.info(f"Total des articles insérés: {stats_globales['articles_inseres']}")
        logger.info(f"Total des articles mis à jour: {stats_globales['articles_mis_a_jour']}")
        
        return 0
    
    except Exception as e:
        logger.error(f"Erreur lors de l'exécution du script: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 