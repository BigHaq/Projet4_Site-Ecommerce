import { motion } from 'framer-motion';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10', xl: 'w-16 h-16' };
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-2 border-primary/20 border-t-primary rounded-full ${className}`}
      role="status"
      aria-label="Chargement..."
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-kora-bg">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        <p className="text-kora-muted text-sm">Chargement...</p>
      </div>
    </div>
  );
}
