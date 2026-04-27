import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx';
import { Breadcrumb } from '../components/layout/Breadcrumb.jsx';
import { SORT_OPTIONS } from '../constants/index.js';

export default function Catalogue() {
  const { products, pagination, categories, isLoading, error, params, updateParams, setPage } = useProducts({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleSearch = (e) => {
    updateParams({ search: e.target.value || undefined });
  };

  return (
    <main className="container-kora py-6">
      <Breadcrumb items={[{ to: '/', label: 'Accueil' }, { label: 'Catalogue' }]} />

      <div className="flex items-start gap-8">
        {/* ── Filtres sidebar ────────────────────────────────── */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-2xl transform transition-transform duration-300 lg:relative lg:inset-auto lg:shadow-none lg:z-auto lg:w-64 lg:flex-shrink-0
          ${filtersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h3 className="font-semibold text-kora-text">Filtres</h3>
              <button onClick={() => setFiltersOpen(false)} className="btn-ghost btn-sm rounded-full p-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <h3 className="font-semibold text-kora-text mb-4 hidden lg:block">Filtres</h3>

            {/* Catégories */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-kora-muted font-semibold mb-3">Catégorie</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParams({ category: undefined })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                    ${!params.category ? 'bg-primary/10 text-primary font-semibold' : 'text-kora-text hover:bg-kora-bg'}`}>
                  Toutes les catégories
                </button>
                {categories.map((cat) => (
                  <button key={cat.id}
                    onClick={() => updateParams({ category: cat.slug })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between
                      ${params.category === cat.slug ? 'bg-primary/10 text-primary font-semibold' : 'text-kora-text hover:bg-kora-bg'}`}>
                    <span>{cat.name}</span>
                    <span className="text-xs text-kora-muted">({cat._count?.products ?? 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prix */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-kora-muted font-semibold mb-3">Prix (FCFA)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-kora-muted mb-1 block">Min</label>
                  <input type="number" placeholder="0" min="0"
                    value={params.minPrice || ''}
                    onChange={(e) => updateParams({ minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="input text-sm py-2 px-3" />
                </div>
                <div>
                  <label className="text-xs text-kora-muted mb-1 block">Max</label>
                  <input type="number" placeholder="Max" min="0"
                    value={params.maxPrice || ''}
                    onChange={(e) => updateParams({ maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="input text-sm py-2 px-3" />
                </div>
              </div>
            </div>

            {/* Reset */}
            <button onClick={() => updateParams({ category: undefined, minPrice: undefined, maxPrice: undefined, search: undefined })}
              className="btn-ghost btn-sm w-full justify-center text-red-500 hover:text-red-700 hover:bg-red-50">
              Réinitialiser les filtres
            </button>
          </div>
        </aside>

        {/* Overlay mobile */}
        {filtersOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setFiltersOpen(false)} />
        )}

        {/* ── Contenu principal ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Barre de recherche + tri */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-kora-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="search" placeholder="Rechercher un produit..."
                defaultValue={params.search || ''}
                onChange={handleSearch}
                className="input pl-10" aria-label="Rechercher" />
            </div>
            <select
              value={params.sort || 'newest'}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="input w-full sm:w-48"
              aria-label="Trier par">
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button onClick={() => setFiltersOpen(true)}
              className="btn-secondary btn-sm lg:hidden flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filtres
            </button>
          </div>

          {/* Résultats */}
          {pagination && (
            <p className="text-sm text-kora-muted mb-4">
              {pagination.total} produit{pagination.total > 1 ? 's' : ''}
              {params.category && ` dans ${categories.find(c => c.slug === params.category)?.name}`}
            </p>
          )}

          {error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary">Réessayer</button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="font-display text-xl font-bold text-kora-text mb-2">Aucun produit trouvé</h3>
              <p className="text-kora-muted mb-6">Essayez de modifier vos filtres</p>
              <button onClick={() => updateParams({ category: undefined, search: undefined, minPrice: undefined, maxPrice: undefined })}
                className="btn-primary">Voir tous les produits</button>
            </div>
          ) : (
            <>
              <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </motion.div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button disabled={!pagination.hasPrev} onClick={() => setPage(pagination.page - 1)}
                    className="btn-ghost btn-sm disabled:opacity-40">← Précédent</button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
                      const p = i + 1;
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                            ${pagination.page === p ? 'bg-primary text-white' : 'hover:bg-kora-bg text-kora-muted'}`}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button disabled={!pagination.hasNext} onClick={() => setPage(pagination.page + 1)}
                    className="btn-ghost btn-sm disabled:opacity-40">Suivant →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
