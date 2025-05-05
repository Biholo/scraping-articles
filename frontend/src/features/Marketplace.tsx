import { useState, useEffect } from 'react';
import { useGetArticles, useGetCategories, useGetSousCategories } from '@/api/queries/marketplaceQueries';
import { ArticleFilters } from '@/api/marketplaceService';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export const Marketplace = () => {
  const [filters, setFilters] = useState<ArticleFilters>({
    page: 1,
    limit: 12,
    sort_by: 'date_publication',
    sort_order: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Requêtes pour les données
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useGetCategories();
  const { data: sousCategories, isLoading: isLoadingSousCategories, error: sousCategoriesError } = useGetSousCategories(filters.categorie || '');
  const { data: articlesData, isLoading: isLoadingArticles, error: articlesError } = useGetArticles(filters);

  // Afficher les erreurs en console pour le débogage
  useEffect(() => {
    if (categoriesError) {
      console.error('Erreur lors du chargement des catégories:', categoriesError);
    }
    if (sousCategoriesError) {
      console.error('Erreur lors du chargement des sous-catégories:', sousCategoriesError);
    }
    if (articlesError) {
      console.error('Erreur lors du chargement des articles:', articlesError);
    }
  }, [categoriesError, sousCategoriesError, articlesError]);

  // Afficher les données reçues pour le débogage
  useEffect(() => {
    console.log('Filtres actuels:', filters);
    console.log('Catégories chargées:', categories);
    console.log('Sous-catégories chargées:', sousCategories);
    console.log('Articles chargés:', articlesData);
  }, [filters, categories, sousCategories, articlesData]);

  // Mettre à jour les filtres quand le terme de recherche change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setFilters(prev => ({ ...prev, titre: searchTerm, page: 1 }));
      } else {
        setFilters(prev => {
          const newFilters = { ...prev };
          delete newFilters.titre;
          return { ...newFilters, page: 1 };
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Mettre à jour la page
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    // Scroll doux vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Appliquer les filtres
  const applyFilters = (newFilters: Partial<ArticleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort_by: 'date_publication',
      sort_order: 'desc'
    });
    setSearchTerm('');
  };

  // Fonction pour générer les pages de pagination
  const getPaginationItems = () => {
    if (!articlesData || articlesData.total_pages <= 1) return [];
    
    const currentPage = filters.page || 1;
    const totalPages = articlesData.total_pages;
    
    // Déterminer combien de pages afficher
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajuster les limites si nécessaire
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Générer le tableau des pages
    const pages = [];
    
    // Toujours inclure la première page
    if (startPage > 1) {
      pages.push(1);
      // Ajouter des points de suspension si nécessaire
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Ajouter les pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Toujours inclure la dernière page
    if (endPage < totalPages) {
      // Ajouter des points de suspension si nécessaire
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Recherche d'articles</h1>
        <p className="text-gray-600">Explorez notre collection d'articles et filtrez selon vos préférences</p>
      </div>

      {/* Barre de filtres toujours visible */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-0 z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Barre de recherche (occupe toute la largeur sur mobile, première colonne sur desktop) */}
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          {/* Catégorie et Sous-catégorie (une par ligne sur mobile, une colonne chacune sur desktop) */}
          <div>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.categorie || ''}
              onChange={(e) => applyFilters({ categorie: e.target.value || undefined, sous_categorie: undefined })}
              aria-label="Catégorie"
            >
              <option value="">Toutes les catégories</option>
              {!isLoadingCategories && categories?.map((cat: string, index: number) => (
                <option key={`cat-${index}`} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.sous_categorie || ''}
              onChange={(e) => applyFilters({ sous_categorie: e.target.value || undefined })}
              disabled={!filters.categorie}
              aria-label="Sous-catégorie"
            >
              <option value="">Toutes les sous-catégories</option>
              {!isLoadingSousCategories && sousCategories?.map((subCat: string, index: number) => (
                <option key={`subcat-${index}`} value={subCat}>{subCat}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Deuxième ligne de filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-2">
            <div className="flex gap-2 items-center">
              <label className="text-sm whitespace-nowrap">Trier par:</label>
              <select
                className="flex-1 p-2 border border-gray-300 rounded-md"
                value={filters.sort_by || 'date_publication'}
                onChange={(e) => applyFilters({ sort_by: e.target.value })}
              >
                <option value="date_publication">Date de publication</option>
                <option value="titre">Titre</option>
                <option value="auteur">Auteur</option>
              </select>
              <select
                className="w-32 p-2 border border-gray-300 rounded-md"
                value={filters.sort_order || 'desc'}
                onChange={(e) => applyFilters({ sort_order: e.target.value as 'asc' | 'desc' })}
              >
                <option value="desc">Récent → Ancien</option>
                <option value="asc">Ancien → Récent</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="space-y-6">
        {isLoadingArticles ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : articlesError ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-red-500 text-lg">Erreur lors du chargement des articles. Veuillez réessayer.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : !articlesData || articlesData.articles?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">Aucun article trouvé avec les critères sélectionnés.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                {articlesData?.total} article{articlesData?.total !== 1 ? 's' : ''} trouvé{articlesData?.total !== 1 ? 's' : ''}
              </p>
              
              {/* Sélecteur d'éléments par page */}
              <div className="flex items-center">
                <label className="text-sm text-gray-500 mr-2 hidden sm:inline">Articles par page:</label>
                <select 
                  className="text-sm p-1 border border-gray-300 rounded-md"
                  value={filters.limit || 12}
                  onChange={(e) => applyFilters({ limit: Number(e.target.value), page: 1 })}
                >
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
              </div>
            </div>
            
            {/* Grille d'articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articlesData?.articles.map((article: any, index: number) => (
                <div key={article._id || `article-${index}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                  {article.image_principale && (
                    <div className="h-48">
                      <img 
                        src={article.image_principale} 
                        alt={article.titre} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                        }} 
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    {article.categorie && (
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                          {article.categorie}
                        </span>
                        {article.sous_categorie && (
                          <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full">
                            {article.sous_categorie}
                          </span>
                        )}
                      </div>
                    )}
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{article.titre}</h2>
                    {article.resume && (
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">{article.resume}</p>
                    )}
                    <div className="mt-auto pt-4 flex justify-between items-center text-sm">
                      <div className="text-gray-500">
                        {article.auteur && (
                          <div className="mb-1">Par {article.auteur}</div>
                        )}
                        {article.date_publication && (
                          <div>
                            {new Date(article.date_publication).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        Lire
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination améliorée */}
            {articlesData && articlesData.total_pages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="inline-flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
                    disabled={filters.page === 1}
                    className={`px-3 py-2 rounded-l-lg border-r flex items-center ${
                      filters.page === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="Page précédente"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span className="hidden sm:inline ml-1">Précédent</span>
                  </button>
                  
                  <div className="hidden sm:flex">
                    {getPaginationItems().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={`page-${page}`}
                          onClick={() => typeof page === 'number' && handlePageChange(page)}
                          className={`px-4 py-2 border-r ${
                            filters.page === page
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Affichage mobile simplifié */}
                  <div className="sm:hidden px-4 py-2 font-medium">
                    {filters.page} / {articlesData.total_pages}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(articlesData.total_pages, (filters.page || 1) + 1))}
                    disabled={filters.page === articlesData.total_pages}
                    className={`px-3 py-2 rounded-r-lg flex items-center ${
                      filters.page === articlesData.total_pages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="Page suivante"
                  >
                    <span className="hidden sm:inline mr-1">Suivant</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

