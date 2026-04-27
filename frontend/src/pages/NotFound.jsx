import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md">
        <div className="relative mb-8">
          <span className="font-display text-[8rem] font-bold text-kora-border leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">🌍</span>
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-kora-text mb-3">Page introuvable</h1>
        <p className="text-kora-muted mb-8 leading-relaxed">
          Cette page n'existe pas ou a été déplacée. Explorez notre boutique pour trouver ce que vous cherchez.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">Retour à l'accueil</Link>
          <Link to="/catalogue" className="btn-secondary">Explorer la boutique</Link>
        </div>
      </motion.div>
    </div>
  );
}
