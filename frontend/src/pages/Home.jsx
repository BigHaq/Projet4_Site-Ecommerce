import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx';
import { formatFCFA } from '../constants/index.js';

const heroVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Home() {
  const { products: featured, isLoading } = useProducts({ featured: true, limit: 6 });

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-kora-text via-[#2C1A0E] to-[#1A3A2A] min-h-[85vh] flex items-center">
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent blur-3xl" />
        </div>

        <div className="container-kora relative z-10 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={heroVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariant} className="inline-flex items-center gap-2 bg-primary/20 text-primary-light
              border border-primary/30 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <span>🌍</span>
              <span>Mode & Lifestyle Afrique de l'Ouest</span>
            </motion.div>

            <motion.h1 variants={itemVariant}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Le meilleur de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-yellow-300">
                l'Afrique de l'Ouest
              </span>
              , livré chez vous
            </motion.h1>

            <motion.p variants={itemVariant} className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Découvrez des créations artisanales authentiques — bazin, wax, bogolan —
              et payez facilement avec MTN MoMo, Moov Money, Wave ou Orange Money.
            </motion.p>

            <motion.div variants={itemVariant} className="flex flex-wrap gap-4">
              <Link to="/catalogue" className="btn-primary btn-lg">
                Explorer la boutique
              </Link>
              <Link to="/catalogue?featured=true" className="btn bg-white/10 text-white border border-white/30
                hover:bg-white/20 px-6 py-4 rounded-xl text-lg font-medium transition-all duration-200">
                Nos coups de cœur
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariant} className="flex gap-8 mt-10">
              {[{ val: '500+', label: 'Produits artisanaux' }, { val: '4 pays', label: 'Livraison' }, { val: '100%', label: 'Paiement sécurisé' }].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-display font-bold text-primary-light">{s.val}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero image / Opérateurs */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="hidden lg:flex flex-col items-center gap-6">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&h=500&fit=crop"
                alt="Mode africaine Marché Kora"
                className="w-80 h-80 object-cover rounded-3xl shadow-2xl"
              />
              {/* Floating badge MTN */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-kora-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center font-bold text-sm">MTN</div>
                <div>
                  <p className="text-xs text-kora-muted">Paiement MTN MoMo</p>
                  <p className="text-sm font-bold text-kora-text">100% sécurisé</p>
                </div>
              </motion.div>
            </div>

            {/* Opérateurs */}
            <div className="flex gap-3">
              {[
                { name: 'MTN', color: '#FFCC00', text: '#000' },
                { name: 'Moov', color: '#0066CC', text: '#fff' },
                { name: 'Wave', color: '#1BA9FF', text: '#fff' },
                { name: 'Orange', color: '#FF6600', text: '#fff' },
              ].map((op) => (
                <div key={op.name}
                  className="px-3 py-2 rounded-xl text-xs font-bold shadow-sm"
                  style={{ background: op.color, color: op.text }}>
                  {op.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Catégories ────────────────────────────────────────── */}
      <section className="py-16 container-kora">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Nos catégories</h2>
          <p className="text-kora-muted">Explorez notre sélection de produits authentiques</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { slug: 'vetements', name: 'Vêtements', emoji: '👗', desc: 'Tenues traditionnelles & modernes',
              img: 'https://images.unsplash.com/photo-1612085387376-e6ee97eae46b?w=600&h=400&fit=crop' },
            { slug: 'accessoires', name: 'Accessoires', emoji: '💎', desc: 'Bijoux & maroquinerie artisanaux',
              img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop' },
            { slug: 'cosmetiques', name: 'Cosmétiques', emoji: '✨', desc: 'Soins naturels africains',
              img: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&h=400&fit=crop' },
          ].map((cat, i) => (
            <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to={`/catalogue?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl block h-56">
                <img src={cat.img} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-2xl mb-1 block">{cat.emoji}</span>
                  <h3 className="font-display text-xl font-bold text-white">{cat.name}</h3>
                  <p className="text-gray-300 text-sm">{cat.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Produits vedettes ──────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container-kora">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-1">Nos coups de cœur</h2>
              <p className="text-kora-muted">Sélection de produits incontournables</p>
            </div>
            <Link to="/catalogue?featured=true" className="btn-secondary btn-sm hidden sm:inline-flex">
              Voir tout
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/catalogue" className="btn-secondary">Explorer toute la boutique</Link>
          </div>
        </div>
      </section>

      {/* ── Bannière Mobile Money ──────────────────────────────── */}
      <section className="py-16 container-kora">
        <div className="bg-gradient-to-r from-accent to-accent-dark rounded-3xl p-8 md:p-12 text-white text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-accent-light font-medium mb-3">💳 Paiements Mobile Money</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Payez comme vous voulez
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
              MTN MoMo, Moov Money/Flooz, Wave, Orange Money — tous les opérateurs acceptés.
              Paiement 100% sécurisé, confirmation en moins de 2 minutes.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {[{ n: 'MTN', c: '#FFCC00', t: '#000' }, { n: 'Moov', c: '#0066CC', t: '#fff' }, { n: 'Wave', c: '#1BA9FF', t: '#fff' }, { n: 'Orange', c: '#FF6600', t: '#fff' }].map((op) => (
                <div key={op.n} className="px-4 py-2 rounded-xl font-bold text-sm"
                  style={{ background: op.c, color: op.t }}>{op.n} Money</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Newsletter ─────────────────────────────────────────── */}
      <section className="py-16 bg-kora-text">
        <div className="container-kora text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-3">Restez informé</h2>
          <p className="text-gray-400 mb-8">Recevez nos nouveautés et promotions exclusives</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => { e.preventDefault(); }}>
            <input type="email" placeholder="Votre adresse email"
              className="flex-1 input bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
              aria-label="Email newsletter" />
            <button type="submit" className="btn-primary flex-shrink-0">S'abonner</button>
          </form>
        </div>
      </section>
    </main>
  );
}
