import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  updateProduct,
  type ProductInput,
} from "../api/products";

export const productKeys = {
  all: ["products"] as const,
  list: (includeOutOfStock: boolean, includeImports: boolean) =>
    ["products", "list", { includeOutOfStock, includeImports }] as const,
  detail: (id: number | string) => ["products", id] as const,
};

export interface UseProductsOptions {
  includeOutOfStock?: boolean;
  includeImports?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const includeOutOfStock = options.includeOutOfStock ?? false;
  const includeImports = options.includeImports ?? false;
  return useQuery({
    queryKey: productKeys.list(includeOutOfStock, includeImports),
    queryFn: () => fetchProducts({ includeOutOfStock, includeImports }),
  });
};

export const useProduct = (id: number | string | undefined) =>
  useQuery({
    queryKey: id ? productKeys.detail(id) : productKeys.all,
    queryFn: () => fetchProductById(id as number | string),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Partial<ProductInput>;
    }) => updateProduct(id, input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: productKeys.detail(vars.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
