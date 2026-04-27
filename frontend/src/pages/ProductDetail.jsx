import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProduct } from '../hooks/useProducts.js';
import { useCart } from '../hooks/useCart.js';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import { ProductGallery } from '../components/product/ProductGallery.jsx';
import { StarRating } from '../components/ui/StarRating.jsx';
import { Breadcrumb } from '../components/layout/Breadcrumb.jsx';
import { Skeleton, ProductDetailSkeleton } from '../components/ui/Skeleton.jsx';
import { formatFCFA } from '../constants/index.js';
import { productsApi } from '../api/products.js';
import { useToast } from '../hooks/useToast.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { product, isLoading, error } = useProduct(id);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuthStore();
  const { openCart } = useCartStore();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    setAddingToCart(true);
    await addItem(product, quantity, Object.keys(selectedVariant).length ? selectedVariant : undefined);
    setAddingToCart(false);
    openCart();
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/auth'); return; }
    if (reviewForm.rating === 0) { showToast('Sélectionnez une note', 'warning'); return; }
    setSubmittingReview(true);
    try {
      await productsApi.addReview(product.id, reviewForm);
      showToast('Avis publié !', 'success');
      setReviewForm({ rating: 0, comment: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la publication', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) return <div className="container-kora py-10"><ProductDetailSkeleton /></div>;
  if (error || !product) return (
    <div className="container-kora py-20 text-center">
      <p className="text-4xl mb-4">😕</p>
      <h1 className="font-display text-2xl font-bold mb-2">Produit introuvable</h1>
      <button onClick={() => navigate('/catalogue')} className="btn-primary mt-4">Retour au catalogue</button>
    </div>
  );

  const variants = product.variants || {};
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  return (
    <main className="container-kora py-6">
      <Breadcrumb items={[
        { to: '/', label: 'Accueil' },
        { to: '/catalogue', label: 'Catalogue' },
        { to: `/catalogue?category=${product.category?.slug}`, label: product.category?.name },
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
        {/* Galerie */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Infos */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-kora-muted mb-1">{product.category?.name}</p>
            <h1 className="font-display text-3xl font-bold text-kora-text mb-3">{product.name}</h1>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          {/* Prix */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary">{formatFCFA(product.price)}</span>
            {product.comparePrice && (
              <>
                <span className="price-original text-lg">{formatFCFA(product.comparePrice)}</span>
                <span className="badge badge-error">-{discount}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-kora-muted">
              {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Plus que ${product.stock} en stock` : 'Rupture de stock'}
            </span>
          </div>

          {/* Description */}
          <p className="text-kora-muted leading-relaxed text-sm">{product.description}</p>

          {/* Variantes taille */}
          {variants.sizes?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-kora-text mb-2">Taille</p>
              <div className="flex flex-wrap gap-2">
                {variants.sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedVariant((v) => ({ ...v, size: s }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all
                      ${selectedVariant.size === s ? 'border-primary bg-primary/10 text-primary' : 'border-kora-border text-kora-text hover:border-primary/50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variantes couleur */}
          {variants.colors?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-kora-text mb-2">
                Couleur {selectedVariant.color && <span className="text-primary font-normal">— {selectedVariant.color}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.colors.map((c) => (
                  <button key={c} onClick={() => setSelectedVariant((v) => ({ ...v, color: c }))}
                    className={`px-4 py-2 rounded-lg text-sm border-2 transition-all
                      ${selectedVariant.color === c ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-kora-border text-kora-text hover:border-primary/50'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantité + CTA */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-kora-border rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-11 flex items-center justify-center hover:bg-kora-bg transition-colors text-xl">−</button>
              <span className="w-12 text-center font-semibold text-kora-text">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-11 h-11 flex items-center justify-center hover:bg-kora-bg transition-colors text-xl disabled:opacity-40">+</button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="btn-primary flex-1 justify-center"
              id="add-to-cart-detail"
            >
              {addingToCart ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ajout...
                </span>
              ) : product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </motion.button>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="badge badge-muted">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Avis ────────────────────────────────────────────── */}
      <div className="mt-16 border-t border-kora-border pt-12">
        <h2 className="font-display text-2xl font-bold text-kora-text mb-8">
          Avis clients ({product.reviewCount})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Liste des avis */}
          <div className="lg:col-span-2 space-y-6">
            {product.reviews?.length === 0 && (
              <div className="text-center py-10 text-kora-muted">
                <p className="text-3xl mb-2">💬</p>
                <p>Soyez le premier à donner votre avis !</p>
              </div>
            )}
            {product.reviews?.map((review) => (
              <div key={review.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-kora-text text-sm">
                      {review.user.firstName} {review.user.lastName[0]}.
                    </p>
                    <p className="text-xs text-kora-muted">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && <p className="text-sm text-kora-muted">{review.comment}</p>}
                {review.isVerified && (
                  <span className="badge badge-success mt-2 text-xs">✓ Achat vérifié</span>
                )}
              </div>
            ))}
          </div>

          {/* Formulaire */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-kora-text mb-4">Laisser un avis</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <p className="text-sm text-kora-muted mb-2">Votre note</p>
                  <StarRating
                    rating={reviewForm.rating}
                    interactive
                    size="lg"
                    onRate={(r) => setReviewForm((f) => ({ ...f, rating: r }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-kora-muted mb-1 block" htmlFor="review-comment">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    placeholder="Votre expérience avec ce produit..."
                    className="input resize-none"
                  />
                </div>
                <button type="submit" disabled={submittingReview || reviewForm.rating === 0}
                  className="btn-primary w-full justify-center">
                  {submittingReview ? 'Publication...' : 'Publier mon avis'}
                </button>
                {!isAuthenticated && (
                  <p className="text-xs text-kora-muted text-center">
                    <a href="/auth" className="text-primary">Connectez-vous</a> pour laisser un avis
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
