import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCategory,
  fetchCategories,
  type CategoryInput,
} from "../api/categories";

export const categoryKeys = {
  all: ["categories"] as const,
};

export const useCategories = () =>
  useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};
