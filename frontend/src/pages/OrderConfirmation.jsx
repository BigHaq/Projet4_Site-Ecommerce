import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ordersApi } from '../api/orders.js';
import { formatFCFA, ORDER_STATUS_LABELS } from '../constants/index.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersApi.getById(orderId)
      .then((res) => setOrder(res.data.data.order))
      .catch(() => navigate('/'))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) return (
    <div className="container-kora py-20 max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-10 w-1/2 mx-auto" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
  if (!order) return null;

  const statusInfo = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.PENDING;
  const lastTx = order.transactions?.[0];

  return (
    <main className="container-kora py-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-kora-text mb-2">Commande confirmée !</h1>
        <p className="text-kora-muted">Merci pour votre confiance. Votre commande est en cours de traitement.</p>
      </motion.div>

      {/* Statut */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-kora-text">Commande #{orderId.slice(0, 8).toUpperCase()}</h2>
          <span className={`badge text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <p className="text-sm text-kora-muted">
          Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Articles */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-kora-text mb-4">Articles commandés</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <img src={item.product.images?.[0]} alt={item.product.name}
                className="w-16 h-16 rounded-xl object-cover bg-kora-border flex-shrink-0" loading="lazy" />
              <div className="flex-1">
                <p className="font-medium text-kora-text text-sm">{item.product.name}</p>
                <p className="text-kora-muted text-xs">Qté : {item.quantity}</p>
                {item.variant && Object.keys(item.variant).length > 0 && (
                  <div className="flex gap-2 mt-1">
                    {Object.entries(item.variant).map(([k, v]) => (
                      <span key={k} className="badge badge-muted text-xs">{k}: {v}</span>
                    ))}
                  </div>
                )}
              </div>
              <span className="font-semibold text-sm text-kora-text">
                {formatFCFA(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-kora-border mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-kora-muted">
            <span>Sous-total</span><span>{formatFCFA(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-kora-muted">
            <span>Livraison</span><span>{formatFCFA(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base text-kora-text">
            <span>Total payé</span>
            <span className="text-primary">{formatFCFA(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Livraison */}
      {order.shippingAddress && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-kora-text mb-3">Adresse de livraison</h3>
          <div className="text-sm text-kora-muted space-y-1">
            <p className="font-medium text-kora-text">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}{order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ''}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
            <p>{order.shippingAddress.phone}</p>
          </div>
        </div>
      )}

      {/* Transaction */}
      {lastTx && (
        <div className="card p-6 mb-8 bg-green-50 border-green-100">
          <h3 className="font-semibold text-kora-text mb-3">Paiement Mobile Money</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-kora-muted">Opérateur</span>
              <span className="font-medium">{lastTx.provider?.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kora-muted">Statut</span>
              <span className="text-green-700 font-semibold">✓ Confirmé</span>
            </div>
            {lastTx.confirmedAt && (
              <div className="flex justify-between">
                <span className="text-kora-muted">Confirmé à</span>
                <span>{new Date(lastTx.confirmedAt).toLocaleTimeString('fr-FR')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/dashboard/orders" className="btn-primary flex-1 justify-center">
          Voir mes commandes
        </Link>
        <Link to="/" className="btn-secondary flex-1 justify-center">
          Continuer les achats
        </Link>
      </div>
    </main>
  );
}
