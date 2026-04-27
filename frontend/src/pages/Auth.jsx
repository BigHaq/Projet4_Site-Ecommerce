import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth.js';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (mode === 'login') {
        await login({ email: data.email, password: data.password });
      } else {
        await registerUser({
          email: data.email, password: data.password,
          firstName: data.firstName, lastName: data.lastName,
          phone: data.phone || undefined,
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-kora-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl shadow-kora-lg">

        {/* Panneau gauche — visuel */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-kora-text via-[#2C1A0E] to-accent p-10 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white text-lg font-display font-bold">K</span>
            </div>
            <span className="font-display font-bold text-xl">Marché Kora</span>
          </Link>
          <div>
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
              L'Afrique de l'Ouest dans votre maison
            </h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Découvrez des milliers de créations artisanales authentiques et payez facilement avec votre Mobile Money.
            </p>
            <div className="flex gap-3">
              {[{ n: 'MTN', c: '#FFCC00', t: '#000' }, { n: 'Moov', c: '#0066CC', t: '#fff' },
                { n: 'Wave', c: '#1BA9FF', t: '#fff' }, { n: 'Orange', c: '#FF6600', t: '#fff' }].map((op) => (
                <div key={op.n} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: op.c, color: op.t }}>{op.n}</div>
              ))}
            </div>
          </div>
          <img src="https://images.unsplash.com/photo-1548142813-c348350df52b?w=500&h=200&fit=crop"
            alt="Mode africaine" className="rounded-2xl object-cover h-40 w-full opacity-70" loading="lazy" />
        </div>

        {/* Panneau droit — formulaire */}
        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-display font-bold text-lg">Marché Kora</span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-kora-text mb-1">
              {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
            </h1>
            <p className="text-kora-muted text-sm">
              {mode === 'login'
                ? 'Connectez-vous pour accéder à votre espace'
                : 'Rejoignez la communauté Marché Kora'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-kora-bg rounded-xl p-1 mb-6">
            {[['login', 'Connexion'], ['register', 'Inscription']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                  ${mode === m ? 'bg-white shadow-sm text-kora-text' : 'text-kora-muted hover:text-kora-text'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Erreur globale */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div key="register-fields"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-kora-text mb-1 block" htmlFor="firstName">Prénom</label>
                      <input id="firstName" {...register('firstName', { required: 'Requis', minLength: { value: 2, message: 'Min 2 caractères' } })}
                        className={`input ${errors.firstName ? 'input-error' : ''}`} placeholder="Ama" />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-kora-text mb-1 block" htmlFor="lastName">Nom</label>
                      <input id="lastName" {...register('lastName', { required: 'Requis', minLength: { value: 2, message: 'Min 2 caractères' } })}
                        className={`input ${errors.lastName ? 'input-error' : ''}`} placeholder="Diallo" />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-kora-text mb-1 block" htmlFor="phone">Téléphone (optionnel)</label>
                    <input id="phone" type="tel" {...register('phone')}
                      className="input" placeholder="+22967123456" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-sm font-medium text-kora-text mb-1 block" htmlFor="email">Email</label>
              <input id="email" type="email" {...register('email', {
                required: 'Email requis',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' }
              })}
                className={`input ${errors.email ? 'input-error' : ''}`} placeholder="vous@exemple.com" autoComplete="email" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-kora-text mb-1 block" htmlFor="password">Mot de passe</label>
              <input id="password" type="password" {...register('password', {
                required: 'Mot de passe requis',
                minLength: { value: 8, message: 'Minimum 8 caractères' }
              })}
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder={mode === 'register' ? 'Minimum 8 caractères' : '••••••••'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {isSubmitting
                ? <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {mode === 'login' ? 'Connexion...' : 'Création...'}
                  </span>
                : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-xs text-kora-muted text-center mt-4">
              Compte test : <strong>client@marchekora.com</strong> / <strong>Kora2024!</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
