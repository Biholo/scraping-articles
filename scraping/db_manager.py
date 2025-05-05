#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Module simplifié pour la gestion de la base de données MongoDB.
"""

import os
import logging
from typing import Dict, Any, Optional
import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

logger = logging.getLogger(__name__)

class DatabaseManager:
    """
    Gestionnaire simplifié de base de données MongoDB pour vérifier et stocker des articles.
    """
    
    def __init__(self, mongo_uri: Optional[str] = None, db_name: Optional[str] = None, collection_name: Optional[str] = None):
        """
        Initialise le gestionnaire de base de données MongoDB.
        
        Args:
            mongo_uri: URI de connexion à MongoDB (si None, utilise la variable d'environnement MONGO_URI)
            db_name: Nom de la base de données (si None, utilise la variable d'environnement DB_NAME)
            collection_name: Nom de la collection (si None, utilise la variable d'environnement COLLECTION_NAME)
        """
        self.mongo_uri = mongo_uri or os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        self.db_name = db_name or os.getenv('DB_NAME', 'scraping_db')
        self.collection_name = collection_name or os.getenv('COLLECTION_NAME', 'articles')
        
        logger.info(f"Connexion à MongoDB: {self.mongo_uri}, DB: {self.db_name}, Collection: {self.collection_name}")
        
        self.client = None
        self.db = None
        self.collection = None
    
    def init_db(self) -> bool:
        """
        Initialise la connexion à la base de données MongoDB.
        
        Returns:
            True si la connexion est établie avec succès
        """
        try:
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
            # Vérification de la connexion
            self.client.admin.command('ping')
            logger.info("Connexion à MongoDB établie avec succès")
            
            self.db = self.client[self.db_name]
            self.collection = self.db[self.collection_name]
            
            # Création d'index sur l'URL pour éviter les doublons
            self.collection.create_index([("url", 1)], unique=True, sparse=True)
            
            return True
        
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Impossible de se connecter à MongoDB: {str(e)}")
            raise
    
    def close_connection(self) -> None:
        """
        Ferme la connexion à MongoDB.
        """
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            self.collection = None
            logger.info("Connexion à MongoDB fermée")
    
    def article_exists(self, url: str) -> bool:
        """
        Vérifie si un article existe déjà dans la base de données.
        
        Args:
            url: URL de l'article à vérifier
            
        Returns:
            True si l'article existe déjà, False sinon
        """
        if self.collection is None:
            logger.warning("La connexion à la base de données n'est pas initialisée")
            self.init_db()
        
        try:
            count = self.collection.count_documents({'url': url})
            return count > 0
        
        except Exception as e:
            logger.error(f"Erreur lors de la vérification de l'article {url}: {str(e)}")
            return False
    
    def save_article(self, article_data: Dict[str, Any]) -> Dict[str, int]:
        """
        Sauvegarde un article dans MongoDB s'il n'existe pas déjà.
        
        Args:
            article_data: Dictionnaire contenant les données de l'article
            
        Returns:
            Dict indiquant si l'article a été inséré ou mis à jour
        """
        if not article_data:
            logger.warning("Aucune donnée d'article à sauvegarder")
            return {"inserted": 0, "updated": 0}
        
        if self.collection is None:
            logger.warning("La connexion à la base de données n'est pas initialisée")
            self.init_db()
        
        try:
            # Ajout d'un horodatage
            article_data['created_at'] = datetime.datetime.utcnow()
            
            # Si l'article a une URL, on l'utilise comme clé unique
            if 'url' in article_data and article_data['url']:
                result = self.collection.update_one(
                    {'url': article_data['url']},
                    {'$set': article_data},
                    upsert=True
                )
                
                if result.upserted_id:
                    logger.info(f"Article inséré: {article_data.get('titre', 'Sans titre')}")
                    return {"inserted": 1, "updated": 0}
                else:
                    logger.info(f"Article mis à jour: {article_data.get('titre', 'Sans titre')}")
                    return {"inserted": 0, "updated": 1}
            else:
                # Pas d'URL, on insère simplement
                self.collection.insert_one(article_data)
                logger.info(f"Article inséré sans URL: {article_data.get('titre', 'Sans titre')}")
                return {"inserted": 1, "updated": 0}
        
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde de l'article: {str(e)}")
            return {"inserted": 0, "updated": 0} 