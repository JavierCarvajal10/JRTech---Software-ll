import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchFavorites,
  fetchFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../api/favorites";
import { useAuth } from "../context/AuthContext";

export const favoriteKeys = {
  all: ["favorites"] as const,
  list: () => ["favorites", "list"] as const,
  ids: () => ["favorites", "ids"] as const,
};

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: fetchFavorites,
    enabled: isAuthenticated,
  });
};

export const useFavoriteIds = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: favoriteKeys.ids(),
    queryFn: fetchFavoriteIds,
    enabled: isAuthenticated,
  });
};

export const useAddFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => addFavorite(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
};

export const useRemoveFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => removeFavorite(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
};

export const useToggleFavorite = () => {
  const { data: ids } = useFavoriteIds();
  const add = useAddFavorite();
  const remove = useRemoveFavorite();

  return {
    isFavorite: (productId: number) => (ids ?? []).includes(productId),
    toggle: (productId: number) => {
      if ((ids ?? []).includes(productId)) {
        return remove.mutateAsync(productId);
      }
      return add.mutateAsync(productId);
    },
    isPending: add.isPending || remove.isPending,
  };
};
