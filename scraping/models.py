#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Module simplifié contenant le modèle d'article pour le blog du modérateur.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import datetime

@dataclass
class Article:
    """
    Représente un article du Blog du Modérateur avec ses informations essentielles.
    """
    titre: str
    url: str
    date_publication: Optional[str] = None
    auteur: Optional[str] = None
    resume: Optional[str] = None
    image_principale: Optional[str] = None
    categorie: Optional[str] = None
    sous_categorie: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    images: List[Dict[str, str]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """
        Convertit l'objet Article en dictionnaire pour le stockage dans MongoDB.
        
        Returns:
            Dictionnaire contenant les attributs de l'article
        """
        return {
            "titre": self.titre,
            "url": self.url,
            "date_publication": self.date_publication,
            "auteur": self.auteur,
            "resume": self.resume,
            "image_principale": self.image_principale,
            "categorie": self.categorie,
            "sous_categorie": self.sous_categorie,
            "tags": self.tags,
            "images": self.images,
            "extracted_at": datetime.datetime.utcnow().isoformat()
        } 