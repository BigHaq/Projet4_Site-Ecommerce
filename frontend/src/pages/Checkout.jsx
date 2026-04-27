import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { OperatorSelector } from '../components/payment/OperatorSelector.jsx';
import { PhoneInput } from '../components/payment/PhoneInput.jsx';
import { Breadcrumb } from '../components/layout/Breadcrumb.jsx';
import { formatFCFA } from '../constants/index.js';
import { ordersApi } from '../api/orders.js';
import { paymentsApi } from '../api/payments.js';
import { usersApi } from '../api/users.js';
import { useEffect } from 'react';
import { usePayment } from '../hooks/usePayment.js';
import { useToast } from '../hooks/useToast.js';

const STEPS = ['Livraison', 'Paiement', 'Confirmation'];

export default function Checkout() {
  const { cart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { startPayment } = usePayment();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [operator, setOperator] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('BJ');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const SHIPPING_FEE = 1500;
  const total = (cart?.subtotal || 0) + SHIPPING_FEE;

  useEffect(() => {
    if (!cart || cart.itemCount === 0) { navigate('/'); return; }
    usersApi.getAddresses().then((res) => {
      const addrs = res.data.data.addresses;
      setAddresses(addrs);
      const def = addrs.find((a) => a.isDefault) || addrs[0];
      if (def) setSelectedAddress(def.id);
    }).catch(() => {});
  }, []);

  const handleCreateOrder = async () => {
    if (!selectedAddress) { showToast('Sélectionnez une adresse de livraison', 'warning'); return; }
    setIsSubmitting(true);
    try {
      const res = await ordersApi.create({ shippingAddressId: selectedAddress });
      setCreatedOrder(res.data.data.order);
      setStep(1);
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur création commande', 'error');
    } finally { setIsSubmitting(false); }
  };

  const handleInitiatePayment = async () => {
    if (!operator) { showToast('Sélectionnez un opérateur Mobile Money', 'warning'); return; }
    if (!phoneNumber) { setPhoneError('Numéro requis'); return; }
    setPhoneError('');
    setIsSubmitting(true);
    try {
      const res = await paymentsApi.initiate({
        orderId: createdOrder.id,
        provider: 'simulation', // En dev — CinetPay en production
        phoneNumber,
        countryCode,
        operator,
      });
      const tx = res.data.data.transaction;
      startPayment(tx);
      navigate(`/payment-waiting/${createdOrder.id}?ref=${tx.reference}&operator=${operator}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur initiation paiement', 'error');
    } finally { setIsSubmitting(false); }
  };

  if (!cart || cart.itemCount === 0) return null;

  return (
    <main className="container-kora py-6">
      <Breadcrumb items={[{ to: '/', label: 'Accueil' }, { to: '/catalogue', label: 'Catalogue' }, { label: 'Commande' }]} />

      {/* Étapes */}
      <div className="flex items-center justify-center gap-0 mb-10 mt-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${i <= step ? 'bg-primary text-white' : 'bg-kora-border text-kora-muted'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                ${i < step ? 'bg-white text-primary' : 'bg-white/20'}`}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-kora-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Formulaire ─────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="font-display text-xl font-bold text-kora-text mb-6">Adresse de livraison</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-kora-muted mb-4">Aucune adresse enregistrée</p>
                  <button onClick={() => navigate('/dashboard')} className="btn-secondary btn-sm">
                    Ajouter une adresse
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {addresses.map((addr) => (
                    <label key={addr.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-kora-border hover:border-primary/30'}`}>
                      <input type="radio" name="address" value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 text-primary focus:ring-primary" />
                      <div>
                        <p className="font-semibold text-kora-text text-sm">{addr.fullName}</p>
                        <p className="text-sm text-kora-muted">{addr.street}{addr.district ? `, ${addr.district}` : ''}</p>
                        <p className="text-sm text-kora-muted">{addr.city}, {addr.country}</p>
                        <p className="text-sm text-kora-muted">{addr.phone}</p>
                        {addr.isDefault && <span className="badge badge-primary mt-1">Adresse principale</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <button onClick={handleCreateOrder} disabled={!selectedAddress || isSubmitting}
                className="btn-primary w-full justify-center">
                {isSubmitting ? 'Création de la commande...' : 'Continuer vers le paiement →'}
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-8">
              <h2 className="font-display text-xl font-bold text-kora-text">Mode de paiement Mobile Money</h2>

              <OperatorSelector selected={operator} onSelect={setOperator} countryCode={countryCode} />

              {operator && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <PhoneInput
                    value={phoneNumber}
                    onChange={(full, _raw) => setPhoneNumber(full)}
                    countryCode={countryCode}
                    onCountryChange={setCountryCode}
                    error={phoneError}
                  />
                </motion.div>
              )}

              <button onClick={handleInitiatePayment}
                disabled={!operator || !phoneNumber || isSubmitting}
                className="btn-primary w-full justify-center text-base py-4">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Initiation du paiement...
                  </span>
                ) : `Payer ${formatFCFA(total)} →`}
              </button>

              <div className="flex items-center gap-2 text-xs text-kora-muted">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Paiement 100% sécurisé. Vos données ne sont jamais partagées.</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Récapitulatif ──────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="font-semibold text-kora-text mb-4">Récapitulatif</h3>
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <img src={item.product.images?.[0]} alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-kora-border flex-shrink-0" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-kora-text font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-kora-muted">×{item.quantity}</p>
                  </div>
                  <span className="font-semibold text-kora-text flex-shrink-0">{formatFCFA(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-kora-muted">
                <span>Sous-total</span><span>{formatFCFA(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-kora-muted">
                <span>Livraison</span><span>{formatFCFA(SHIPPING_FEE)}</span>
              </div>
            </div>
            <div className="divider" />
            <div className="flex justify-between font-bold text-lg text-kora-text">
              <span>Total</span>
              <span className="text-primary">{formatFCFA(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
