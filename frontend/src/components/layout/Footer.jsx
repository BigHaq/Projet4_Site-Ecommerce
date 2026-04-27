import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-kora-text text-white mt-20">
      <div className="container-kora py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white text-lg font-display font-bold">K</span>
              </div>
              <span className="font-display font-bold text-xl">Marché Kora</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Le meilleur de l'Afrique de l'Ouest, livré chez vous. Mode, accessoires et cosmétiques authentiques.
            </p>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'twitter'].map((s) => (
                <a key={s} href={`https://${s}.com`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={s}>
                  <span className="text-xs font-bold capitalize">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Liens */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Boutique</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/catalogue', label: 'Tous les produits' },
                { to: '/catalogue?category=vetements', label: 'Vêtements' },
                { to: '/catalogue?category=accessoires', label: 'Accessoires' },
                { to: '/catalogue?category=cosmetiques', label: 'Cosmétiques' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-gray-400 hover:text-white text-sm transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Compte</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/auth', label: 'Connexion / Inscription' },
                { to: '/dashboard', label: 'Mon compte' },
                { to: '/dashboard/orders', label: 'Mes commandes' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-gray-400 hover:text-white text-sm transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Paiements */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Paiements acceptés</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { name: 'MTN MoMo', color: '#FFCC00', text: '#000' },
                { name: 'Moov Money', color: '#0066CC', text: '#FFF' },
                { name: 'Wave', color: '#1BA9FF', text: '#FFF' },
                { name: 'Orange Money', color: '#FF6600', text: '#FFF' },
              ].map((op) => (
                <div key={op.name}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold text-center"
                  style={{ background: op.color, color: op.text }}>
                  {op.name}
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs">Paiements 100% sécurisés via Mobile Money</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-kora py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Marché Kora. Tous droits réservés.</p>
          <p className="text-gray-500 text-sm">Devise : XOF (Franc CFA) · Afrique de l'Ouest</p>
        </div>
      </div>
    </footer>
  );
}
