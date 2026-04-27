import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { usePaymentStore } from '../store/paymentStore.js';
import { usePayment } from '../hooks/usePayment.js';
import { UssdWaiting } from '../components/payment/UssdWaiting.jsx';
import { PaymentSuccess, PaymentFailure } from '../components/payment/PaymentSuccess.jsx';
import { paymentsApi } from '../api/payments.js';

export default function PaymentWaiting() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const operator = searchParams.get('operator') || 'MTN';
  const navigate = useNavigate();

  const { currentTransaction, status, secondsLeft, startPayment, reset } = usePayment();
  const { currentTransaction: storedTx } = usePaymentStore();

  // Si on arrive directement sur cette page (rafraîchissement), recharger la transaction
  useEffect(() => {
    if (!storedTx && ref) {
      paymentsApi.checkStatus(ref).then((res) => {
        startPayment(res.data.data.transaction);
      }).catch(() => navigate('/'));
    }
  }, [ref]);

  const tx = currentTransaction || storedTx;

  if (!tx && !ref) { navigate('/'); return null; }

  return (
    <div className="min-h-screen bg-kora-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-kora-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-kora-text to-[#1A3A2A] px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">K</span>
          </div>
          <span className="text-white font-medium">Marché Kora — Paiement sécurisé</span>
        </div>

        {/* Contenu selon statut */}
        {(!status || status === 'PENDING') && (
          <UssdWaiting transaction={tx} secondsLeft={secondsLeft} operator={operator} />
        )}

        {status === 'SUCCESS' && (
          <PaymentSuccess transaction={tx} orderId={orderId} />
        )}

        {(status === 'FAILED' || status === 'TIMEOUT' || status === 'CANCELLED') && (
          <PaymentFailure
            onRetry={() => { reset(); navigate(`/checkout`); }}
            onChangeOperator={() => { reset(); navigate(`/checkout`); }}
          />
        )}
      </div>
    </div>
  );
}
