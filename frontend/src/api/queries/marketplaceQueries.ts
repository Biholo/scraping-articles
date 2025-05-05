import { ArticleFilters, marketplaceService } from "../marketplaceService";
import { useQuery } from "@tanstack/react-query";

export const useGetCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => marketplaceService.getCategories(),
    });
};

export const useGetArticles = (filters: ArticleFilters) => {
    return useQuery({
        queryKey: ["articles", filters],
        queryFn: () => marketplaceService.getArticles(filters),
    });
};

export const useGetSousCategories = (categorie: string) => {
    return useQuery({
        queryKey: ["sous-categories", categorie],
        queryFn: () => marketplaceService.getSousCategories(categorie),
    });
};

