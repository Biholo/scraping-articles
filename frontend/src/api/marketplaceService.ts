import { api } from "./interceptor";

export interface ArticleFilters {
  categorie?: string;
  sous_categorie?: string;
  auteur?: string;
  titre?: string;
  contenu?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ArticleResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  articles: any[];
}

class MarketplaceService {
    public async getCategories(): Promise<string[]> {
        const response = await api.fetchRequest("/categories", "GET", null);
        return response;
    }

    public async getArticles(filters?: ArticleFilters): Promise<ArticleResponse> {
        // Convertir les filtres en query parameters
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        
        const url = `/articles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.fetchRequest(url, "GET", null);
        return response;
    }
    
    public async getSousCategories(categorie?: string): Promise<string[]> {
        const params = categorie ? { categorie } : {};
        const response = await api.fetchRequest("/sous-categories", "GET", params);
        return response;
    }
}

export const marketplaceService = new MarketplaceService();
