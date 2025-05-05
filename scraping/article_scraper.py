#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Module pour le scraping des articles du Blog du Modérateur.
"""

import logging
import time
import random
import os
from typing import Dict, Any, List, Optional
import requests
from bs4 import BeautifulSoup
import concurrent.futures
from threading import Lock

from models import Article
from db_manager import DatabaseManager

logger = logging.getLogger(__name__)

class ArticleScraper:
    def __init__(self, collection_name: str = "articles", timeout: int = 30, max_workers: int = 5):
        # Chargement des variables d'environnement
        
        self.timeout = timeout
        self.max_workers = max_workers
        self.results_lock = Lock()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

        # Récupération des paramètres de connexion MongoDB depuis les variables d'environnement
        mongo_uri = "mongodb://localhost:27017/"
        db_name = "scraping_db"
        
        self.db_manager = DatabaseManager(
            mongo_uri=mongo_uri,
            db_name=db_name,
            collection_name=collection_name
        )
        self.db_manager.init_db()
        logger.info(f"Connexion à MongoDB établie (collection: {collection_name})")

    def pause_aleatoire(self, min_secs: float = 1.0, max_secs: float = 3.0) -> None:
        delay = random.uniform(min_secs, max_secs)
        logger.debug(f"Pause de {delay:.2f} secondes")
        time.sleep(delay)

    def extraire_article(self, url_article: str, categorie_forcee: str = None) -> Optional[Dict[str, Any]]:
        if self.db_manager.article_exists(url_article):
            logger.info(f"Article déjà existant: {url_article}")
            return None

        try:
            logger.info(f"Extraction de l'article: {url_article}")
            response = self.session.get(url_article, timeout=self.timeout)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'lxml')

            titre = soup.select_one('h1.entry-title')
            titre = titre.text.strip() if titre else "Sans titre"

            sous_categorie = soup.select_one('.favtag')
            sous_categorie = sous_categorie.text.strip() if sous_categorie else None

            # Utiliser la catégorie forcée si fournie
            categorie = categorie_forcee
            
            # Sinon, déterminer la catégorie à partir de l'URL
            if not categorie:
                if 'marketing' in url_article:
                    categorie = "Marketing"
                elif 'web' in url_article:
                    categorie = "Web"
                elif 'social' in url_article:
                    categorie = "Social"
                elif 'tech' in url_article:
                    categorie = "Tech"
                
                # Si on n'a pas réussi à déterminer depuis l'URL, essayer d'autres méthodes
                if not categorie:
                    # Essayer de trouver la catégorie via les breadcrumbs ou la navigation
                    breadcrumbs = soup.select('.breadcrumbs a, .breadcrumb a, .nav-breadcrumb a')
                    for crumb in breadcrumbs:
                        crumb_text = crumb.text.strip()
                        if crumb_text in ["Marketing", "Web", "Social", "Tech"]:
                            categorie = crumb_text
                            break

                # Méthode de secours
                if not categorie:
                    logger.warning(f"Impossible de déterminer la catégorie pour {url_article}, utilisation des métadonnées")
                    # Essayer de trouver la catégorie dans les métadonnées
                    meta_category = soup.select_one('meta[property="article:section"]')
                    if meta_category and meta_category.get('content'):
                        categorie = meta_category.get('content')

            image_principale = soup.select_one('.article-hat-img img')
            image_principale = image_principale['src'] if image_principale and 'src' in image_principale.attrs else None

            date_element = soup.select_one('.posted-on time.entry-date')
            date_publication = date_element['datetime'] if date_element and 'datetime' in date_element.attrs else date_element.text.strip() if date_element else None

            auteur_element = soup.select_one('.meta-info .byline a')
            auteur = auteur_element.text.strip() if auteur_element else None

            resume_element = soup.select_one('.article-hat p')
            resume = resume_element.text.strip() if resume_element else ""

            tags = [tag.text.strip() for tag in soup.select('.tags-list a')]

            images_dict = []
            for img in soup.select('article img'):
                src = img.get('src')
                alt = img.get('alt', '')
                if src:
                    images_dict.append({'url': src, 'alt': alt})

            article = Article(
                titre=titre,
                url=url_article,
                date_publication=date_publication,
                auteur=auteur,
                resume=resume,
                image_principale=image_principale,
                categorie=categorie,
                tags=tags,
                images=images_dict
            )
            return article.to_dict()

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction de l'article {url_article}: {str(e)}")
            return None

    def extraire_liens_page(self, url_page: str) -> List[str]:
        try:
            logger.info(f"Scraping de la page: {url_page}")
            response = self.session.get(url_page, timeout=self.timeout)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'lxml')
            articles_elements = soup.select('article')

            urls_articles = []
            for article_element in articles_elements:
                lien = article_element.select_one('h3.entry-title a') or article_element.select_one('a[href]')
                if lien and 'href' in lien.attrs:
                    urls_articles.append(lien['href'])

            logger.info(f"Trouvé {len(urls_articles)} articles sur la page")
            return urls_articles

        except Exception as e:
            logger.error(f"Erreur lors du scraping de la page {url_page}: {str(e)}")
            return []

    def trouver_page_suivante(self, url_actuelle: str) -> Optional[str]:
        try:
            logger.info(f"Recherche de la page suivante à partir de: {url_actuelle}")
            response = self.session.get(url_actuelle, timeout=self.timeout)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'lxml')
            
            # Essayer plusieurs sélecteurs potentiels pour le lien "page suivante"

            next_link = soup.select_one('.nextpostslink')
            
            # Recherche plus générique
            pagination_elements = soup.select('.pagination, .nav-links, .wp-pagenavi')
            if pagination_elements:
                logger.info(f"Élément(s) de pagination trouvé(s): {len(pagination_elements)}")
                
                for pagination in pagination_elements:
                    # Examiner la structure et chercher le dernier lien qui pourrait être "suivant"
                    links = pagination.select('a')
                    if links:
                        current_page_found = False
                        
                        # Afficher tous les liens de pagination pour déboguer
                        for link in links:
                            logger.debug(f"Lien de pagination: {link.get_text(strip=True)} - {link.get('href', '')}")
                            
                            # Chercher le lien actif actuel
                            if 'current' in link.get('class', []) or 'active' in link.get('class', []):
                                current_page_found = True
                            # Si on a trouvé la page active, le prochain lien est "suivant"
                            elif current_page_found and 'href' in link.attrs:
                                logger.info(f"Page suivante trouvée après la page active: {link['href']}")
                                return link['href']
                        
                        # Si on n'a pas trouvé via la méthode précédente, prendre le dernier lien
                        last_link = links[-1]
                        if 'href' in last_link.attrs:
                            logger.info(f"Utilisation du dernier lien de pagination comme page suivante: {last_link['href']}")
                            return last_link['href']
            
            # Recherche par texte du lien
            next_text_patterns = ['suivant', 'next', 'suiv', '>']
            for pattern in next_text_patterns:
                for link in soup.select('a'):
                    link_text = link.get_text(strip=True).lower()
                    if pattern in link_text and 'href' in link.attrs:
                        logger.info(f"Page suivante trouvée par texte '{pattern}': {link['href']}")
                        return link['href']
            
            # Essai avec une approche par URL
            # Si l'URL actuelle se termine par un nombre, on peut essayer d'incrémenter ce nombre
            import re
            page_match = re.search(r'/page/(\d+)/?$', url_actuelle)
            if page_match:
                current_page = int(page_match.group(1))
                next_page = current_page + 1
                next_url = re.sub(r'/page/\d+/?$', f'/page/{next_page}/', url_actuelle)
                logger.info(f"Construction de l'URL de la page suivante par incrémentation: {next_url}")
                return next_url
            elif not '/page/' in url_actuelle:
                # Si pas de numéro de page dans l'URL, essayer d'ajouter /page/2/
                next_url = url_actuelle.rstrip('/') + '/page/2/'
                logger.info(f"Construction de l'URL de la page suivante par ajout de /page/2/: {next_url}")
                return next_url
                
            logger.info("Aucune page suivante trouvée - fin de la navigation")
            return None

        except Exception as e:
            logger.error(f"Erreur lors de la recherche de la page suivante: {str(e)}")
            return None

    def executer(self, url_depart: str, max_pages: int = 3, categorie_forcee: str = None) -> Dict[str, int]:
        total_articles = 0
        total_inseres = 0
        total_mis_a_jour = 0

        url_actuelle = url_depart
        page_count = 0

        logger.info(f"Début du scraping avec URL de départ: {url_depart}, max pages: {max_pages}, catégorie: {categorie_forcee or 'Auto-détection'}")

        while url_actuelle and page_count < max_pages:
            page_count += 1
            logger.info(f"Traitement de la page {page_count}/{max_pages}: {url_actuelle}")

            urls_articles = self.extraire_liens_page(url_actuelle)
            total_articles += len(urls_articles)
            
            logger.info(f"Page {page_count}: Traitement de {len(urls_articles)} articles en parallèle avec {self.max_workers} workers")
            
            # Traitement en parallèle des articles
            with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                # Créer les futures pour chaque URL d'article
                futures = {executor.submit(self.traiter_article, url_article, categorie_forcee): url_article for url_article in urls_articles}
                
                # Traitement des résultats au fur et à mesure qu'ils sont terminés
                for future in concurrent.futures.as_completed(futures):
                    url_article = futures[future]
                    try:
                        result = future.result()
                        if result:
                            with self.results_lock:
                                total_inseres += result['inserted']
                                total_mis_a_jour += result['updated']
                                logger.info(f"Article {'inséré' if result['inserted'] > 0 else 'mis à jour'}: {result['titre']} (Catégorie: {result['categorie']})")
                    except Exception as e:
                        logger.error(f"Exception lors du traitement de {url_article}: {str(e)}")
            
            # self.pause_aleatoire(2.0, 4.0)
            
            if page_count < max_pages:
                logger.info(f"Recherche de la page suivante après page {page_count}/{max_pages}")
                url_actuelle = self.trouver_page_suivante(url_actuelle)
                if not url_actuelle:
                    logger.info(f"Plus de pages à traiter - arrêt après {page_count} pages")
            else:
                logger.info(f"Limite de {max_pages} pages atteinte - fin du scraping")
                url_actuelle = None

        logger.info(f"Scraping terminé: {page_count} pages visitées, {total_articles} articles trouvés, {total_inseres} insérés, {total_mis_a_jour} mis à jour")
        self.db_manager.close_connection()

        return {
            "pages_visitees": page_count,
            "articles_trouves": total_articles,
            "articles_inseres": total_inseres,
            "articles_mis_a_jour": total_mis_a_jour
        }
        
    def traiter_article(self, url_article: str, categorie_forcee: str = None) -> Dict[str, Any]:
        """
        Traite un article en l'extrayant et en le sauvegardant dans la base de données.
        Retourne les résultats de l'opération.
        """
        article_data = self.extraire_article(url_article, categorie_forcee)
        if article_data:
            result = self.db_manager.save_article(article_data)
            return {
                'inserted': result['inserted'],
                'updated': result['updated'],
                'titre': article_data.get('titre', 'Sans titre'),
                'categorie': article_data.get('categorie', 'Inconnue')
            }
        return None
