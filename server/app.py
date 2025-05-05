from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import traceback
from config import MONGO_URI, DB_NAME, COLLECTION_NAME

app = Flask(__name__)
CORS(app)  # Activation de CORS pour toutes les routes

# Connexion MongoDB
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    # Vérifier que la connexion est établie
    client.admin.command('ping')
    print("MongoDB connecté avec succès!")
except Exception as e:
    print(f"Erreur de connexion à MongoDB: {e}")
    traceback.print_exc()

@app.route("/articles", methods=["GET"])
def get_articles():
    try:
        # Paramètres de base pour filtrer les articles
        query = {}

        # Récupération des paramètres de filtrage
        auteur = request.args.get("auteur")
        categorie = request.args.get("categorie")
        sous_categorie = request.args.get("sous_categorie")
        titre = request.args.get("titre")
        contenu = request.args.get("contenu")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        # Paramètres de pagination
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        
        # Paramètres de tri
        sort_by = request.args.get("sort_by", "date_publication")
        sort_order = -1 if request.args.get("sort_order", "desc").lower() == "desc" else 1

        # Construction de la requête
        if auteur:
            query["auteur"] = {"$regex": auteur, "$options": "i"}
        if categorie:
            # Correspondance exacte pour la catégorie (cas sensible)
            query["categorie"] = categorie
        if sous_categorie:
            # Correspondance exacte pour la sous-catégorie (cas sensible)
            query["sous_categorie"] = sous_categorie
        if titre:
            query["titre"] = {"$regex": titre, "$options": "i"}
        if contenu:
            query["contenu"] = {"$regex": contenu, "$options": "i"}
            
        # Gestion des dates
        if start_date or end_date:
            query["date_publication"] = {}
            if start_date:
                try:
                    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
                    query["date_publication"]["$gte"] = start_date_obj
                except ValueError:
                    return jsonify({"error": "Format de date invalide pour start_date. Utilisez YYYY-MM-DD"}), 400
            if end_date:
                try:
                    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
                    # Ajouter un jour pour inclure toute la journée
                    query["date_publication"]["$lte"] = end_date_obj
                except ValueError:
                    return jsonify({"error": "Format de date invalide pour end_date. Utilisez YYYY-MM-DD"}), 400

        # Calcul du skip pour la pagination
        skip = (page - 1) * limit
        
        # Exécution de la requête avec pagination et tri
        total = collection.count_documents(query)
        results = list(collection.find(query, {"_id": 0})
                       .sort(sort_by, sort_order)
                       .skip(skip)
                       .limit(limit))
        
        # Construction de la réponse
        response = {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
            "articles": results
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Erreur lors de la récupération des articles: {e}")
        traceback.print_exc()
        return jsonify({"error": "Une erreur est survenue lors de la récupération des articles"}), 500

@app.route("/health", methods=["GET"])
def health():
    try:
        # Vérifier que la connexion MongoDB est active
        client.admin.command('ping')
        return jsonify({"status": "ok", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "error", "database": "disconnected", "error": str(e)}), 500

@app.route("/categories", methods=["GET"])
def get_categories():
    try:
        # Catégories prédéfinies basées sur le script de scraping
        categories = ["Marketing", "Web", "Social", "Tech"]
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/sous-categories", methods=["GET"])
def get_sous_categories():
    try:
        # On peut filtrer les sous-catégories par catégorie
        categorie = request.args.get("categorie")
        
        query = {}
        if categorie:
            query["categorie"] = categorie
            
        # Récupérer les sous-catégories distinctes
        sous_categories = collection.distinct("sous_categorie", query)
        
        # Filtrer les valeurs None ou vides
        sous_categories = [sc for sc in sous_categories if sc]
        
        return jsonify(sous_categories), 200
    except Exception as e:
        print(f"Erreur lors de la récupération des sous-catégories: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
