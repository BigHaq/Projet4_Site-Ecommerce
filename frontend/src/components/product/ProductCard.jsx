import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatFCFA } from '../../constants/index.js';
import { StarRating } from '../ui/StarRating.jsx';
import { useCart } from '../../hooks/useCart.js';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { useNavigate } from 'react-router-dom';

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuthStore();
  const { openCart } = useCartStore();
  const navigate = useNavigate();

  const isOutOfStock = product.stock === 0;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/auth'); return; }
    await addItem(product, 1);
    openCart();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Link to={`/produit/${product.slug || product.id}`} className="card card-hover block overflow-hidden group">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-kora-border">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400x400'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount && (
              <span className="badge bg-red-500 text-white text-xs font-bold">-{discount}%</span>
            )}
            {product.isFeatured && (
              <span className="badge bg-primary text-white text-xs">Coup de cœur</span>
            )}
            {isOutOfStock && (
              <span className="badge bg-gray-800 text-white text-xs">Rupture de stock</span>
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="p-4">
          <p className="text-xs text-kora-muted mb-1">{product.category?.name}</p>
          <h3 className="font-semibold text-kora-text text-sm leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            <StarRating rating={product.rating} size="sm" />
            {product.reviewCount > 0 && (
              <span className="text-xs text-kora-muted">({product.reviewCount})</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="price text-base text-primary">{formatFCFA(product.price)}</span>
              {product.comparePrice && (
                <span className="price-original text-xs ml-1.5">{formatFCFA(product.comparePrice)}</span>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              id={`add-to-cart-${product.id}`}
              className="btn-primary btn-sm flex-shrink-0 disabled:opacity-40"
              aria-label={`Ajouter ${product.name} au panier`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
