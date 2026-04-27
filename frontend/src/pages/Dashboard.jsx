import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { ordersApi } from '../api/orders.js';
import { usersApi } from '../api/users.js';
import { formatFCFA, ORDER_STATUS_LABELS } from '../constants/index.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { useToast } from '../hooks/useToast.js';
import { useForm } from 'react-hook-form';

const TABS = [
  { id: 'orders', label: '📦 Mes commandes' },
  { id: 'addresses', label: '📍 Adresses' },
  { id: 'profile', label: '👤 Mon profil' },
];

export default function Dashboard() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'orders';
  const { showToast } = useToast();

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const profileForm = useForm({ defaultValues: { firstName: user?.firstName, lastName: user?.lastName, phone: user?.phone || '' } });
  const addressForm = useForm();
  const passwordForm = useForm();

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    setOrdersLoading(true);
    ordersApi.list({ limit: 20 }).then((r) => setOrders(r.data.data.orders)).catch(() => {}).finally(() => setOrdersLoading(false));
    setAddressesLoading(true);
    usersApi.getAddresses().then((r) => setAddresses(r.data.data.addresses)).catch(() => {}).finally(() => setAddressesLoading(false));
  }, [user]);

  const setTab = (t) => setSearchParams({ tab: t });

  const handleProfileSave = async (data) => {
    try {
      const res = await usersApi.updateProfile(data);
      updateUser(res.data.data.user);
      showToast('Profil mis à jour.', 'success');
    } catch (err) { showToast(err.response?.data?.message || 'Erreur', 'error'); }
  };

  const handleAddAddress = async (data) => {
    try {
      const res = await usersApi.addAddress({ ...data, isDefault: data.isDefault === 'true' || false });
      setAddresses((a) => [...a, res.data.data.address]);
      setShowAddressForm(false);
      addressForm.reset();
      showToast('Adresse ajoutée.', 'success');
    } catch (err) { showToast(err.response?.data?.message || 'Erreur', 'error'); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await usersApi.deleteAddress(id);
      setAddresses((a) => a.filter((ad) => ad.id !== id));
      showToast('Adresse supprimée.', 'info');
    } catch { showToast('Erreur suppression', 'error'); }
  };

  const handleChangePassword = async (data) => {
    try {
      await usersApi.changePassword(data);
      showToast('Mot de passe modifié.', 'success');
      passwordForm.reset();
    } catch (err) { showToast(err.response?.data?.message || 'Erreur', 'error'); }
  };

  return (
    <main className="container-kora py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-kora-text mb-1">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="text-kora-muted">{user?.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-kora-border mb-8 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all
              ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-kora-muted hover:text-kora-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Commandes ──────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📦</p>
              <h3 className="font-display text-xl font-bold mb-2">Aucune commande pour l'instant</h3>
              <p className="text-kora-muted mb-6">Explorez notre boutique et passez votre première commande !</p>
              <Link to="/catalogue" className="btn-primary">Explorer la boutique</Link>
            </div>
          ) : (
            orders.map((order) => {
              const statusInfo = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.PENDING;
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Link to={`/order-confirmation/${order.id}`} className="card card-hover p-5 block">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 min-w-0">
                        {order.items[0]?.product?.images?.[0] && (
                          <img src={order.items[0].product.images[0]} alt=""
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-kora-border" loading="lazy" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-kora-text text-sm">
                            Commande #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-kora-muted mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')} · {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {order.items.slice(0, 2).map((item) => (
                              <span key={item.id} className="text-xs text-kora-muted">
                                {item.product.name}{order.items.indexOf(item) < order.items.length - 1 ? ',' : ''}
                              </span>
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-xs text-kora-muted">+{order.items.length - 2} autres</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`badge text-xs px-2.5 py-1 rounded-full font-semibold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <p className="font-bold text-primary mt-2">{formatFCFA(order.totalAmount)}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: Adresses ──────────────────────────────────── */}
      {tab === 'addresses' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-kora-muted">{addresses.length} adresse{addresses.length > 1 ? 's' : ''} enregistrée{addresses.length > 1 ? 's' : ''}</p>
            <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-primary btn-sm">
              + Ajouter une adresse
            </button>
          </div>

          {showAddressForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-6">
              <h3 className="font-semibold text-kora-text mb-4">Nouvelle adresse</h3>
              <form onSubmit={addressForm.handleSubmit(handleAddAddress)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'fullName', label: 'Nom complet', placeholder: 'Ama Diallo', required: true, span: 2 },
                  { name: 'phone', label: 'Téléphone', placeholder: '+22967123456', required: true },
                  { name: 'street', label: 'Rue / N°', placeholder: '123 Avenue de la République', required: true, span: 2 },
                  { name: 'district', label: 'Quartier', placeholder: 'Akpakpa' },
                  { name: 'city', label: 'Ville', placeholder: 'Cotonou', required: true },
                  { name: 'country', label: 'Code pays', placeholder: 'BJ', required: true, maxLength: 2 },
                ].map((f) => (
                  <div key={f.name} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="text-sm font-medium text-kora-text mb-1 block">{f.label}</label>
                    <input {...addressForm.register(f.name, { required: f.required ? `${f.label} requis` : false })}
                      placeholder={f.placeholder}
                      maxLength={f.maxLength}
                      className={`input ${addressForm.formState.errors[f.name] ? 'input-error' : ''}`} />
                  </div>
                ))}
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="btn-primary btn-sm">Enregistrer</button>
                  <button type="button" onClick={() => { setShowAddressForm(false); addressForm.reset(); }}
                    className="btn-ghost btn-sm">Annuler</button>
                </div>
              </form>
            </motion.div>
          )}

          {addressesLoading ? (
            <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📍</p>
              <p className="text-kora-muted">Aucune adresse enregistrée.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      {addr.isDefault && <span className="badge badge-primary mb-2">Principale</span>}
                      <p className="font-semibold text-kora-text text-sm">{addr.fullName}</p>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr.id)}
                      className="text-kora-muted hover:text-red-500 transition-colors p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-kora-muted space-y-0.5">
                    <p>{addr.street}{addr.district ? `, ${addr.district}` : ''}</p>
                    <p>{addr.city}, {addr.country}</p>
                    <p>{addr.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Profil ─────────────────────────────────────── */}
      {tab === 'profile' && (
        <div className="max-w-lg space-y-8">
          {/* Infos personnelles */}
          <div className="card p-6">
            <h3 className="font-semibold text-kora-text mb-4">Informations personnelles</h3>
            <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-kora-text mb-1 block">Prénom</label>
                  <input {...profileForm.register('firstName', { required: true })} className="input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-kora-text mb-1 block">Nom</label>
                  <input {...profileForm.register('lastName', { required: true })} className="input" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-kora-text mb-1 block">Email</label>
                <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-sm font-medium text-kora-text mb-1 block">Téléphone</label>
                <input {...profileForm.register('phone')} placeholder="+22967123456" className="input" />
              </div>
              <button type="submit" className="btn-primary btn-sm">Enregistrer les modifications</button>
            </form>
          </div>

          {/* Mot de passe */}
          <div className="card p-6">
            <h3 className="font-semibold text-kora-text mb-4">Changer le mot de passe</h3>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
              {[
                { name: 'currentPassword', label: 'Mot de passe actuel', auto: 'current-password' },
                { name: 'newPassword', label: 'Nouveau mot de passe', auto: 'new-password' },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-sm font-medium text-kora-text mb-1 block">{f.label}</label>
                  <input type="password" {...passwordForm.register(f.name, { required: true, minLength: 8 })}
                    className="input" autoComplete={f.auto} placeholder="••••••••" />
                </div>
              ))}
              <button type="submit" className="btn-primary btn-sm">Modifier le mot de passe</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
