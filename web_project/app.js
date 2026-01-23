// ============================================
// PARTIE 1: CLASSES POO (Programmation Orientée Objet)
// ============================================

/**
 * Classe Category - Représente une catégorie d'articles
 */
class Category {
    constructor(categoryId, categoryName) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }
}

/**
 * Classe Article - Représente un produit
 */
class Article {
    constructor(articleId, articleName, price, stock, sizes, categoryId, image = '') {
        this.articleId = articleId;
        this.articleName = articleName;
        this.price = price;
        this.stock = stock;
        this.sizes = sizes; // Tableau de tailles
        this.categoryId = categoryId;
        this.image = image || 'https://via.placeholder.com/300x200?text=Article';
    }
}

/**
 * Classe BasketItem - Représente un article dans le panier
 */
class BasketItem {
    constructor(articleId, articleName, unitPrice, size, qty = 1) {
        this.articleId = articleId;
        this.articleName = articleName;
        this.unitPrice = unitPrice;
        this.size = size;
        this.qty = qty;
    }

    get total() {
        return this.qty * this.unitPrice;
    }
}

/**
 * Classe Basket - Gère le panier de l'utilisateur
 */
class Basket {
    constructor(userId = 'guest') {
        this.userId = userId;
        this.items = []; // Tableau de BasketItem
    }

    // Ajouter un article au panier
    addItem(article, size) {
        // Vérifier si l'article avec la même taille est déjà dans le panier
        const existingItem = this.items.find(item =>
            item.articleId === article.articleId && item.size === size);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            this.items.push(new BasketItem(
                article.articleId,
                article.articleName,
                article.price,
                size
            ));
        }

        this.saveToLocalStorage();
        return this;
    }

    // Diminuer la quantité d'un article
    removeItem(articleId, size) {
        const itemIndex = this.items.findIndex(item =>
            item.articleId === articleId && item.size === size);

        if (itemIndex !== -1) {
            if (this.items[itemIndex].qty > 1) {
                this.items[itemIndex].qty -= 1;
            } else {
                this.items.splice(itemIndex, 1);
            }
        }

        this.saveToLocalStorage();
        return this;
    }

    // Supprimer complètement un article
    deleteItem(articleId, size) {
        const itemIndex = this.items.findIndex(item =>
            item.articleId === articleId && item.size === size);

        if (itemIndex !== -1) {
            this.items.splice(itemIndex, 1);
        }

        this.saveToLocalStorage();
        return this;
    }

    // Calculer le total du panier
    get total() {
        return this.items.reduce((sum, item) => sum + item.total, 0);
    }

    // Compter le nombre total d'articles
    get itemCount() {
        return this.items.reduce((count, item) => count + item.qty, 0);
    }

    // Vider le panier
    clear() {
        this.items = [];
        this.saveToLocalStorage();
        return this;
    }

    // ============================================
    // PARTIE 2: LOCALSTORAGE - Persistance des données
    // ============================================

    /**
     * Sauvegarder le panier dans le localStorage
     * Le localStorage permet de stocker des données dans le navigateur
     * Les données persistent même après fermeture du navigateur
     */
    saveToLocalStorage() {
        // Convertir le tableau d'items en JSON et le stocker
        localStorage.setItem('basket_' + this.userId, JSON.stringify(this.items));
    }

    /**
     * Charger le panier depuis le localStorage
     */
    loadFromLocalStorage() {
        // Récupérer les données du localStorage
        const savedItems = localStorage.getItem('basket_' + this.userId);

        // Si des données existent, les parser et les charger
        if (savedItems) {
            this.items = JSON.parse(savedItems);
        }

        return this;
    }
}

/**
 * Classe Order - Représente une commande validée
 */
class Order {
    constructor(orderId, userId, date, articles, total) {
        this.orderId = orderId;
        this.userId = userId;
        this.date = date;
        this.articles = articles; // Tableau d'articles avec qty, size, etc.
        this.total = total;
    }

    // Créer une commande à partir d'un panier
    static createFromBasket(basket, orderId) {
        return new Order(
            orderId || Date.now().toString(),
            basket.userId,
            new Date().toISOString(),
            basket.items.map(item => ({
                articleId: item.articleId,
                qty: item.qty,
                size: item.size,
                unitPrice: item.unitPrice,
                articleName: item.articleName
            })),
            basket.total
        );
    }

    // Sauvegarder la commande dans le localStorage
    saveToLocalStorage() {
        // Récupérer les commandes existantes
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');

        // Ajouter la nouvelle commande
        orders.push(this);

        // Sauvegarder dans le localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

/**
 * Classe Store - Classe principale de l'application
 */
class Store {
    constructor() {
        this.categories = [];
        this.articles = [];
        this.basket = new Basket('guest').loadFromLocalStorage();
        this.currentCategory = 'all';
        this.currentView = 'welcome'; // welcome, basket, admin

        this.init();
    }

    // Initialiser l'application
    init() {
        this.loadSampleData();
        this.loadFromLocalStorage();
        this.render();
        this.setupEventListeners();
        this.updateBasketUI();
    }

    // ============================================
    // PARTIE 3: GESTION DU LOCALSTORAGE POUR LES DONNÉES
    // ============================================

    // Charger les données par défaut si nécessaire
    loadSampleData() {
        // Vérifier si des catégories existent déjà dans le localStorage
        if (!localStorage.getItem('categories')) {
            // Données par défaut pour les catégories
            this.categories = [
                new Category(1, 'T-shirts'),
                new Category(2, 'Pantalons'),
                new Category(3, 'Robes')
            ];
            this.saveCategoriesToLocalStorage();
        }

        // Vérifier si des articles existent déjà dans le localStorage
        if (!localStorage.getItem('articles')) {
            // Données par défaut pour les articles
            this.articles = [
                new Article(1, 'T-shirt basique blanc', 19.99, 20, ['S', 'M', 'L', 'XL'], 1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'),
                new Article(2, 'T-shirt noir adidas', 24.99, 15, ['M', 'L', 'XL'], 1, 'https://contents.mediadecathlon.com/p2632086/k$9491c0cbe040e01bb0764e4be9f85c03/sq/t-shirt-de-fitness-soft-training-adidas-homme-noir.jpg?format=auto&f=800x0'),
                new Article(3, 'Jean slim noir', 49.99, 10, ['S', 'M', 'L'], 2, 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'),
                new Article(4, 'Pantalon chino beige', 39.99, 12, ['M', 'L', 'XL'], 2, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'),
                new Article(5, 'Robe d\'été fleurie', 59.99, 8, ['S', 'M', 'L'], 3, 'https://foivo.com/cdn/shop/files/Aubrey-Langedamesjurk.png?v=1767203444&width=823'),
                new Article(6, 'Robe noire cocktail', 79.99, 5, ['XS', 'S', 'M'], 3, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80')
            ];
            this.saveArticlesToLocalStorage();
        }
    }

    // Charger les données depuis le localStorage
    loadFromLocalStorage() {
        // Charger les catégories
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            const categoriesData = JSON.parse(savedCategories);
            this.categories = categoriesData.map(cat => new Category(cat.categoryId, cat.categoryName));
        }

        // Charger les articles
        const savedArticles = localStorage.getItem('articles');
        if (savedArticles) {
            const articlesData = JSON.parse(savedArticles);
            this.articles = articlesData.map(art => new Article(
                art.articleId,
                art.articleName,
                art.price,
                art.stock,
                art.sizes,
                art.categoryId,
                art.image
            ));
        }
    }

    // Sauvegarder les catégories dans le localStorage
    saveCategoriesToLocalStorage() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    // Sauvegarder les articles dans le localStorage
    saveArticlesToLocalStorage() {
        localStorage.setItem('articles', JSON.stringify(this.articles));
    }

    // ============================================
    // PARTIE 4: MÉTHODES DE GESTION DES DONNÉES
    // ============================================

    // Obtenir le nom d'une catégorie par son ID
    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.categoryId == categoryId);
        return category ? category.categoryName : 'Inconnue';
    }

    // Obtenir toutes les commandes depuis le localStorage
    getOrders() {
        const savedOrders = localStorage.getItem('orders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    }

    // Filtrer les articles par catégorie
    getArticlesByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.articles;
        }
        return this.articles.filter(article => article.categoryId == categoryId);
    }

    // Ajouter un article
    addArticle(article) {
        // Générer un nouvel ID si nécessaire
        if (!article.articleId) {
            article.articleId = this.articles.length > 0
                ? Math.max(...this.articles.map(a => a.articleId)) + 1
                : 1;
        }

        this.articles.push(article);
        this.saveArticlesToLocalStorage();
        return article;
    }

    // Mettre à jour un article
    updateArticle(articleId, updatedData) {
        const index = this.articles.findIndex(a => a.articleId == articleId);
        if (index !== -1) {
            this.articles[index] = {...this.articles[index], ...updatedData};
            this.saveArticlesToLocalStorage();
            return true;
        }
        return false;
    }

    // Supprimer un article
    deleteArticle(articleId) {
        const index = this.articles.findIndex(a => a.articleId == articleId);
        if (index !== -1) {
            this.articles.splice(index, 1);
            this.saveArticlesToLocalStorage();
            return true;
        }
        return false;
    }

    // Ajouter une catégorie
    addCategory(category) {
        // Générer un nouvel ID si nécessaire
        if (!category.categoryId) {
            category.categoryId = this.categories.length > 0
                ? Math.max(...this.categories.map(c => c.categoryId)) + 1
                : 1;
        }

        this.categories.push(category);
        this.saveCategoriesToLocalStorage();
        return category;
    }

    // Mettre à jour une catégorie
    updateCategory(categoryId, updatedData) {
        const index = this.categories.findIndex(c => c.categoryId == categoryId);
        if (index !== -1) {
            this.categories[index] = {...this.categories[index], ...updatedData};
            this.saveCategoriesToLocalStorage();
            return true;
        }
        return false;
    }

    // Supprimer une catégorie
    deleteCategory(categoryId) {
        // Ne pas supprimer si des articles utilisent cette catégorie
        const articlesInCategory = this.articles.filter(a => a.categoryId == categoryId);
        if (articlesInCategory.length > 0) {
            return false; // Catégorie utilisée
        }

        const index = this.categories.findIndex(c => c.categoryId == categoryId);
        if (index !== -1) {
            this.categories.splice(index, 1);
            this.saveCategoriesToLocalStorage();
            return true;
        }
        return false;
    }

    // ============================================
    // PARTIE 5: RENDU DE L'INTERFACE
    // ============================================

    // Rendre toute l'interface
    render() {
        this.renderCategories();
        this.renderArticles();
        this.renderBasket();
        this.renderAdminPanel();
    }

    // Rendre la liste des catégories
    renderCategories() {
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;

        categoryList.innerHTML = '';

        // Bouton "Tous"
        const allBtn = document.createElement('button');
        allBtn.className = `btn btn-outline-light category-btn ${this.currentCategory === 'all' ? 'active' : ''}`;
        allBtn.textContent = 'Tous les articles';
        allBtn.dataset.categoryId = 'all';
        allBtn.addEventListener('click', () => {
            this.currentCategory = 'all';
            this.renderCategories();
            this.renderArticles();
        });
        categoryList.appendChild(allBtn);

        // Boutons pour chaque catégorie
        this.categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = `btn btn-outline-light category-btn ${this.currentCategory == category.categoryId ? 'active' : ''}`;
            btn.textContent = category.categoryName;
            btn.dataset.categoryId = category.categoryId;
            btn.addEventListener('click', () => {
                this.currentCategory = category.categoryId;
                this.renderCategories();
                this.renderArticles();
            });
            categoryList.appendChild(btn);
        });
    }

    // Rendre la liste des articles
    renderArticles() {
        const articlesContainer = document.getElementById('articlesContainer');
        if (!articlesContainer) return;

        const filteredArticles = this.getArticlesByCategory(this.currentCategory);

        if (filteredArticles.length === 0) {
            articlesContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        Aucun article disponible dans cette catégorie.
                    </div>
                </div>
            `;
            return;
        }

        articlesContainer.innerHTML = '';

        filteredArticles.forEach(article => {
            const categoryName = this.getCategoryName(article.categoryId);
            const isOutOfStock = article.stock <= 0;

            const col = document.createElement('div');
            col.className = `col-md-6 col-lg-4 mb-4 ${isOutOfStock ? 'out-of-stock' : ''}`;

            col.innerHTML = `
                <div class="card h-100">
                    <img src="${article.image}" class="card-img-top" alt="${article.articleName}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${article.articleName}</h5>
                        <p class="card-text text-muted">${categoryName}</p>
                        <div class="mb-2">
                            <strong class="fs-4 text-primary">${article.price.toFixed(2)} €</strong>
                        </div>
                        <div class="mb-3">
                            <small class="text-muted">Tailles: ${article.sizes.join(', ')}</small>
                            <br>
                            <small class="text-muted">Stock: ${article.stock} disponibles</small>
                        </div>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center">
                                <select class="form-select form-select-sm size-select" style="width: 60%;"
                                        data-article-id="${article.articleId}" ${isOutOfStock ? 'disabled' : ''}>
                                    ${article.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                                </select>
                                <button class="btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'} add-to-basket"
                                        data-article-id="${article.articleId}" ${isOutOfStock ? 'disabled' : ''}>
                                    <i class="bi bi-cart-plus"></i> ${isOutOfStock ? 'Rupture' : 'Ajouter'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            articlesContainer.appendChild(col);
        });
    }

    // Rendre le panier
    renderBasket() {
        const basketItems = document.getElementById('basketItems');
        if (!basketItems) return;

        if (this.basket.items.length === 0) {
            basketItems.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-cart-x"></i>
                    <h4>Votre panier est vide</h4>
                    <p>Ajoutez des articles pour commencer vos achats</p>
                    <button class="btn btn-primary" id="backToShopping">Retour aux achats</button>
                </div>
            `;

            // Réattacher l'événement
            document.getElementById('backToShopping')?.addEventListener('click', () => {
                this.showView('welcome');
            });

            return;
        }

        let html = '';
        this.basket.items.forEach((item, index) => {
            html += `
                <div class="basket-item">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <strong>${item.articleName}</strong>
                            <div class="text-muted">Taille: ${item.size}</div>
                        </div>
                        <div class="col-md-2">
                            <span class="badge bg-secondary">x${item.qty}</span>
                        </div>
                        <div class="col-md-2">
                            <strong>${item.total.toFixed(2)} €</strong>
                            <div class="text-muted">${item.unitPrice.toFixed(2)} €/unité</div>
                        </div>
                        <div class="col-md-4">
                            <div class="d-flex gap-2">
                                <button class="btn btn-outline-secondary quantity-btn decrease-item" data-index="${index}">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <button class="btn btn-outline-primary quantity-btn increase-item" data-index="${index}">
                                    <i class="bi bi-plus"></i>
                                </button>
                                <button class="btn btn-outline-danger delete-item" data-index="${index}">
                                    <i class="bi bi-trash"></i> Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        basketItems.innerHTML = html;

        // Mettre à jour les totaux
        document.getElementById('subtotal').textContent = `${this.basket.total.toFixed(2)} €`;
        document.getElementById('total').textContent = `${this.basket.total.toFixed(2)} €`;

        // Activer/désactiver le bouton de validation
        document.getElementById('validateOrder').disabled = this.basket.items.length === 0;
    }

    // Rendre le panneau d'administration
    renderAdminPanel() {
        this.renderArticlesTable();
        this.renderCategoriesTable();
        // Note: renderOrdersTable() est appelé seulement quand on clique sur l'onglet
    }

    // Rendre le tableau des articles (admin)
    renderArticlesTable() {
        const articlesTable = document.getElementById('articlesTable');
        if (!articlesTable) return;

        if (this.articles.length === 0) {
            articlesTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        Aucun article disponible. Ajoutez-en un !
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        this.articles.forEach(article => {
            const categoryName = this.getCategoryName(article.categoryId);

            html += `
                <tr>
                    <td>${article.articleId}</td>
                    <td>${article.articleName}</td>
                    <td>${categoryName}</td>
                    <td>${article.price.toFixed(2)} €</td>
                    <td>${article.stock}</td>
                    <td>${article.sizes.join(', ')}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-article" data-id="${article.articleId}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-article" data-id="${article.articleId}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        articlesTable.innerHTML = html;
    }

    // Rendre le tableau des catégories (admin)
    renderCategoriesTable() {
        const categoriesTable = document.getElementById('categoriesTable');
        if (!categoriesTable) return;

        if (this.categories.length === 0) {
            categoriesTable.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">
                        Aucune catégorie disponible. Ajoutez-en une !
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        this.categories.forEach(category => {
            // Compter les articles dans cette catégorie
            const articleCount = this.articles.filter(a => a.categoryId == category.categoryId).length;

            html += `
                <tr>
                    <td>${category.categoryId}</td>
                    <td>${category.categoryName}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-category" data-id="${category.categoryId}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-category" data-id="${category.categoryId}"
                                ${articleCount > 0 ? 'disabled title="Impossible de supprimer une catégorie contenant des articles"' : ''}>
                            <i class="bi bi-trash"></i>
                        </button>
                        <span class="badge bg-info ms-1">${articleCount} article(s)</span>
                    </td>
                </tr>
            `;
        });

        categoriesTable.innerHTML = html;
    }

    // Rendre le tableau des commandes (admin)
    renderOrdersTable() {
        const commandesTable = document.getElementById('commandesTable');
        if (!commandesTable) return;

        const orders = this.getOrders();

        if (orders.length === 0) {
            commandesTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        Aucune commande enregistrée.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';

        // Pour chaque commande
        orders.forEach(order => {
            // Pour chaque article dans la commande
            order.articles.forEach(article => {
                // Trouver la catégorie de l'article
                const articleObj = this.articles.find(a => a.articleId == article.articleId);
                const categoryName = articleObj ? this.getCategoryName(articleObj.categoryId) : 'Inconnue';

                // Formater la date
                const orderDate = new Date(order.date);
                const formattedDate = orderDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                html += `
                    <tr>
                        <td>${article.articleName}</td>
                        <td>${article.qty}</td>
                        <td>${(article.qty * article.unitPrice).toFixed(2)} €</td>
                        <td>${categoryName}</td>
                        <td>${formattedDate}</td>
                        <td>${order.orderId}</td>
                    </tr>
                `;
            });
        });

        commandesTable.innerHTML = html;
    }

    // ============================================
    // PARTIE 6: GESTION DE L'INTERFACE UTILISATEUR
    // ============================================

    // Changer de vue (accueil, panier, admin)
    showView(viewName) {
        this.currentView = viewName;

        // Masquer toutes les sections
        document.getElementById('welcomeSection').classList.add('hidden');
        document.getElementById('basketSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');

        // Montrer la section appropriée
        if (viewName === 'admin') {
            document.getElementById('adminPanel')?.classList.remove('hidden');
        } else {
            document.getElementById(`${viewName}Section`)?.classList.remove('hidden');
        }        

        // Mettre à jour la navigation active
        document.getElementById('homeLink').classList.remove('active');
        document.getElementById('basketLink').classList.remove('active');
        document.getElementById('adminLink').classList.remove('active');

        if (viewName === 'welcome') {
            document.getElementById('homeLink').classList.add('active');
        } else if (viewName === 'basket') {
            document.getElementById('basketLink').classList.add('active');
            this.renderBasket();
        } else if (viewName === 'admin') {
            document.getElementById('adminLink').classList.add('active');
            // Quand on montre le panneau admin, afficher l'onglet articles par défaut
            document.getElementById('articlesTab').click();
        }
    }

    // Mettre à jour l'UI du panier (badge, compteur)
    updateBasketUI() {
        const basketCount = document.getElementById('basketCount');
        const basketBadge = document.getElementById('basketBadge');

        if (basketCount) {
            basketCount.textContent = this.basket.itemCount;
        }

        if (basketBadge) {
            basketBadge.textContent = this.basket.itemCount;
            basketBadge.classList.toggle('hidden', this.basket.itemCount === 0);
        }
    }

    // ============================================
    // PARTIE 7: GESTION DES ÉVÉNEMENTS
    // ============================================

    // Configurer les écouteurs d'événements
    setupEventListeners() {
        // Navigation principale
        this.setupNavigationEvents();

        // Gestion des onglets admin
        this.setupAdminTabEvents();

        // Gestion des événements de clic (délégués)
        this.setupDelegatedEvents();

        // Boutons d'action
        this.setupActionButtons();

        // Validation de commande
        this.setupOrderEvents();
    }

    // Événements de navigation
    setupNavigationEvents() {
        document.getElementById('homeLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('welcome');
        });

        document.getElementById('basketLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('basket');
        });

        document.getElementById('adminLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('admin');
        });

        document.getElementById('basketToggle').addEventListener('click', () => {
            this.showView('basket');
        });

        document.getElementById('continueShopping').addEventListener('click', () => {
            this.showView('welcome');
        });

        document.getElementById('loginBtn').addEventListener('click', () => {
            alert('Fonctionnalité de connexion non implémentée dans cette version.');
        });
    }

    // Événements des onglets admin
    setupAdminTabEvents() {
        document.getElementById('articlesTab').addEventListener('click', () => {
            document.getElementById('articlesTab').classList.add('active');
            document.getElementById('categoriesTab').classList.remove('active');
            document.getElementById('commandesTab').classList.remove('active');
            document.getElementById('articlesManagement').classList.remove('hidden');
            document.getElementById('categoriesManagement').classList.add('hidden');
            document.getElementById('ordershistory').classList.add('hidden');
        });

        document.getElementById('categoriesTab').addEventListener('click', () => {
            document.getElementById('categoriesTab').classList.add('active');
            document.getElementById('articlesTab').classList.remove('active');
            document.getElementById('commandesTab').classList.remove('active');
            document.getElementById('categoriesManagement').classList.remove('hidden');
            document.getElementById('articlesManagement').classList.add('hidden');
            document.getElementById('ordershistory').classList.add('hidden');
        });

        document.getElementById('commandesTab').addEventListener('click', () => {
            document.getElementById('commandesTab').classList.add('active');
            document.getElementById('articlesTab').classList.remove('active');
            document.getElementById('categoriesTab').classList.remove('active');
            document.getElementById('ordershistory').classList.remove('hidden');
            document.getElementById('articlesManagement').classList.add('hidden');
            document.getElementById('categoriesManagement').classList.add('hidden');
            this.renderOrdersTable(); // Charger les commandes quand on clique sur l'onglet
        });
    }

    // Événements délégués (pour éléments dynamiques)
    setupDelegatedEvents() {
        document.addEventListener('click', (e) => {
            // Ajout au panier depuis la liste d'articles
            if (e.target.closest('.add-to-basket')) {
                this.handleAddToBasket(e);
            }

            // Diminuer la quantité dans le panier
            if (e.target.closest('.decrease-item')) {
                this.handleDecreaseItem(e);
            }

            // Augmenter la quantité dans le panier
            if (e.target.closest('.increase-item')) {
                this.handleIncreaseItem(e);
            }

            // Supprimer un article du panier
            if (e.target.closest('.delete-item')) {
                this.handleDeleteItem(e);
            }

            // Édition d'article (admin)
            if (e.target.closest('.edit-article')) {
                this.handleEditArticle(e);
            }

            // Suppression d'article (admin)
            if (e.target.closest('.delete-article')) {
                this.handleDeleteArticle(e);
            }

            // Édition de catégorie (admin)
            if (e.target.closest('.edit-category')) {
                this.handleEditCategory(e);
            }

            // Suppression de catégorie (admin)
            if (e.target.closest('.delete-category')) {
                this.handleDeleteCategory(e);
            }
        });
    }

    // Gérer l'ajout au panier
    handleAddToBasket(e) {
        const button = e.target.closest('.add-to-basket');
        const articleId = button.dataset.articleId;
        const article = this.articles.find(a => a.articleId == articleId);

        if (article) {
            // Trouver le sélecteur de taille correspondant
            const sizeSelect = document.querySelector(`.size-select[data-article-id="${articleId}"]`);
            const selectedSize = sizeSelect ? sizeSelect.value : article.sizes[0];

            this.basket.addItem(article, selectedSize);
            this.updateBasketUI();

            // Feedback visuel
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="bi bi-check"></i> Ajouté!';
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');

            // Animation
            button.classList.add('added-to-cart');
            setTimeout(() => {
                button.classList.remove('added-to-cart');
            }, 300);

            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('btn-success');
                button.classList.add('btn-primary');
            }, 1000);
        }
    }

    // Gérer la diminution de quantité
    handleDecreaseItem(e) {
        const button = e.target.closest('.decrease-item');
        const index = button.dataset.index;
        const item = this.basket.items[index];

        if (item) {
            this.basket.removeItem(item.articleId, item.size);
            this.renderBasket();
            this.updateBasketUI();
        }
    }

    // Gérer l'augmentation de quantité
    handleIncreaseItem(e) {
        const button = e.target.closest('.increase-item');
        const index = button.dataset.index;
        const item = this.basket.items[index];

        if (item) {
            const article = this.articles.find(a => a.articleId == item.articleId);
            if (article) {
                this.basket.addItem(article, item.size);
                this.renderBasket();
                this.updateBasketUI();
            }
        }
    }

    // Gérer la suppression d'article du panier
    handleDeleteItem(e) {
        const button = e.target.closest('.delete-item');
        const index = button.dataset.index;
        const item = this.basket.items[index];

        if (item) {
            this.basket.deleteItem(item.articleId, item.size);
            this.renderBasket();
            this.updateBasketUI();
        }
    }

    // Gérer l'édition d'article
    handleEditArticle(e) {
        const button = e.target.closest('.edit-article');
        const articleId = button.dataset.id;
        this.editArticle(articleId);
    }

    // Gérer la suppression d'article
    handleDeleteArticle(e) {
        const button = e.target.closest('.delete-article');
        const articleId = button.dataset.id;

        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            if (this.deleteArticle(articleId)) {
                this.render();
            }
        }
    }

    // Gérer l'édition de catégorie
    handleEditCategory(e) {
        const button = e.target.closest('.edit-category');
        const categoryId = button.dataset.id;
        this.editCategory(categoryId);
    }

    // Gérer la suppression de catégorie
    handleDeleteCategory(e) {
        const button = e.target.closest('.delete-category');
        const categoryId = button.dataset.id;

        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            if (this.deleteCategory(categoryId)) {
                this.render();
            } else {
                alert('Impossible de supprimer cette catégorie car elle contient des articles.');
            }
        }
    }

    // Boutons d'action
    setupActionButtons() {
        // Bouton d'ajout d'article (admin)
        document.getElementById('addArticleBtn').addEventListener('click', () => {
            this.editArticle();
        });

        // Bouton d'ajout de catégorie (admin)
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.editCategory();
        });

        // Sauvegarde d'article
        document.getElementById('saveArticleBtn').addEventListener('click', () => {
            this.saveArticle();
        });

        // Sauvegarde de catégorie
        document.getElementById('saveCategoryBtn').addEventListener('click', () => {
            this.saveCategory();
        });
    }

    // Événements de commande
    setupOrderEvents() {
        // Validation de commande
        document.getElementById('validateOrder').addEventListener('click', () => {
            if (this.basket.items.length > 0) {
                document.getElementById('orderTotalConfirm').textContent = `${this.basket.total.toFixed(2)} €`;
                const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
                orderModal.show();
            }
        });

        // Confirmation de commande
        document.getElementById('confirmOrderBtn').addEventListener('click', () => {
            const order = Order.createFromBasket(this.basket);
            order.saveToLocalStorage();

            this.basket.clear();
            this.updateBasketUI();
            this.showView('welcome');

            // Fermer la modal
            const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
            orderModal.hide();

            // Afficher un message de confirmation
            alert(`Commande validée !\nNuméro de commande: ${order.orderId}\nTotal: ${order.total.toFixed(2)} €`);
        });
    }

    // ============================================
    // PARTIE 8: GESTION DES FORMULAIRES (ADMIN)
    // ============================================

    // Éditer un article (ouverture du formulaire)
    editArticle(articleId = null) {
        const modalTitle = document.getElementById('articleModalTitle');
        const form = document.getElementById('articleForm');

        // Réinitialiser le formulaire
        form.reset();

        // Décocher toutes les tailles
        document.querySelectorAll('.size-check').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Remplir la liste des catégories
        const categorySelect = document.getElementById('articleCategory');
        categorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>';
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.categoryId;
            option.textContent = category.categoryName;
            categorySelect.appendChild(option);
        });

        if (articleId) {
            // Mode édition
            modalTitle.textContent = 'Modifier l\'article';
            const article = this.articles.find(a => a.articleId == articleId);

            if (article) {
                document.getElementById('articleId').value = article.articleId;
                document.getElementById('articleName').value = article.articleName;
                document.getElementById('articlePrice').value = article.price;
                document.getElementById('articleStock').value = article.stock;
                document.getElementById('articleImage').value = article.image;
                document.getElementById('articleCategory').value = article.categoryId;

                // Cocher les tailles
                article.sizes.forEach(size => {
                    const checkbox = document.getElementById(`size${size}`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } else {
            // Mode création
            modalTitle.textContent = 'Ajouter un article';
            document.getElementById('articleId').value = '';
        }

        const modal = new bootstrap.Modal(document.getElementById('articleModal'));
        modal.show();
    }

    // Sauvegarder un article
    saveArticle() {
        const articleId = document.getElementById('articleId').value;
        const articleName = document.getElementById('articleName').value;
        const price = parseFloat(document.getElementById('articlePrice').value);
        const stock = parseInt(document.getElementById('articleStock').value);
        const categoryId = parseInt(document.getElementById('articleCategory').value);
        const image = document.getElementById('articleImage').value;

        // Récupérer les tailles sélectionnées
        const sizes = [];
        document.querySelectorAll('.size-check:checked').forEach(checkbox => {
            sizes.push(checkbox.value);
        });

        if (!articleName || !price || !stock || !categoryId || sizes.length === 0) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        if (articleId) {
            // Mise à jour
            this.updateArticle(articleId, {
                articleName,
                price,
                stock,
                sizes,
                categoryId,
                image
            });
        } else {
            // Création
            const newArticle = new Article(
                null, // ID généré automatiquement
                articleName,
                price,
                stock,
                sizes,
                categoryId,
                image
            );
            this.addArticle(newArticle);
        }

        // Fermer la modal et re-rendre
        const modal = bootstrap.Modal.getInstance(document.getElementById('articleModal'));
        modal.hide();

        this.render();
    }

    // Éditer une catégorie (ouverture du formulaire)
    editCategory(categoryId = null) {
        const modalTitle = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');

        // Réinitialiser le formulaire
        form.reset();

        if (categoryId) {
            // Mode édition
            modalTitle.textContent = 'Modifier la catégorie';
            const category = this.categories.find(c => c.categoryId == categoryId);

            if (category) {
                document.getElementById('categoryId').value = category.categoryId;
                document.getElementById('categoryName').value = category.categoryName;
            }
        } else {
            // Mode création
            modalTitle.textContent = 'Ajouter une catégorie';
            document.getElementById('categoryId').value = '';
        }

        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    }

    // Sauvegarder une catégorie
    saveCategory() {
        const categoryId = document.getElementById('categoryId').value;
        const categoryName = document.getElementById('categoryName').value;

        if (!categoryName) {
            alert('Veuillez saisir un nom de catégorie.');
            return;
        }

        if (categoryId) {
            // Mise à jour
            this.updateCategory(categoryId, { categoryName });
        } else {
            // Création
            const newCategory = new Category(null, categoryName);
            this.addCategory(newCategory);
        }

        // Fermer la modal et re-rendre
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
        modal.hide();

        this.render();
    }
}

// ============================================
// PARTIE 9: INITIALISATION DE L'APPLICATION
// ============================================

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.store = new Store();
});