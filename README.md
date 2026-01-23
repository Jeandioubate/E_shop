# JohnStore - Boutique en ligne
## Description
Boutique en ligne SPA (Single Page Application) de vêtements développée avec HTML, CSS (Bootstrap) et JavaScript. Application complète avec gestion des articles, panier et administration.

## Fonctionnalités principales
### Interface client
- Affichage des articles avec images et détails
- Filtrage par catégories (T-shirts, Pantalons, Robes)
- Panier interactif (ajout, suppression, modification)
- Validation de commande avec confirmation
- Design responsive Bootstrap
### Panneau d'administration
* Gestion des articles (CRUD complet)
* Gestion des catégories (CRUD complet)
* Historique des commandes (affichage détaillé)
* 3 onglets : Articles, Catégories, Commandes
### Stockage des données
* LocalStorage pour la persistance
* Panier sauvegardé entre les sessions
* Catalogue stocké localement
* Historique des commandes conservé
### Installation
#### Méthode simple (1 fichier) :
- Copiez le code HTML complet
- Collez-le dans un fichier index.html
- Ouvrez dans votre navigateur
- C'est parti !
#### Méthode fichiers séparés :
dossier/
* index.html :  Structure HTML
* style.css : Styles personnalisés
* app.js : Logique JavaScript
### Architecture
#### Classes JavaScript (POO) :
* Category    // Catégories d'articles
* Article     // Produits de la boutique
* BasketItem  // Articles dans le panier
* Basket      // Gestion du panier
* Order       // Commandes validées
* Store       // Application principale
#### Données stockées :
LocalStorage:
- 'categories'    // Liste des catégories
- 'articles'      // Catalogue produits
- 'basket_guest'  // Panier utilisateur
- 'orders'        // Historique des commandes
### Utilisation
#### Pour les clients :
- Parcourez les articles
- Filtrez par catégorie
- Ajoutez au panier (choisissez une taille)
- Accédez au panier
- Validez la commande
#### Pour l'admin :
* Cliquez sur "Admin"
* Naviguez entre les 3 onglets
* Gérez articles et catégories
* Consultez l'historique des commandes
### Technologies
	
* HTML5	Structure
* CSS3	Styles
* Bootstrap 5	Framework CSS
* JavaScript ES6	Logique POO
* LocalStorage	Persistance
* Bootstrap Icons	Icônes
### Compatibilité
* Chrome / Firefox / Safari / Edge
* Mobile (responsive)
* Pas de backend requis
### Démarrage rapide
* Ouvrez index.html
* Testez les fonctionnalités
* Passez une commande test
* Vérifiez l'historique dans Admin

