import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../api/products.js';

export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsApi.list(params);
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des produits.');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    productsApi.categories().then((res) => setCategories(res.data.data.categories)).catch(() => {});
  }, []);

  const updateParams = (newParams) => setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  const setPage = (page) => setParams((prev) => ({ ...prev, page }));

  return { products, pagination, categories, isLoading, error, params, updateParams, setPage, refetch: fetchProducts };
}

export function useProduct(idOrSlug) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idOrSlug) return;
    setIsLoading(true);
    productsApi.getById(idOrSlug)
      .then((res) => setProduct(res.data.data.product))
      .catch((err) => setError(err.response?.data?.message || 'Produit introuvable.'))
      .finally(() => setIsLoading(false));
  }, [idOrSlug]);

  return { product, isLoading, error };
}
