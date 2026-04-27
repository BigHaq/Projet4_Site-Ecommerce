import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsApi } from '../api/payments.js';
import { usePaymentStore } from '../store/paymentStore.js';
import { PAYMENT_POLLING_INTERVAL_MS, USSD_TIMEOUT_SECONDS } from '../constants/index.js';

export function usePayment() {
  const navigate = useNavigate();
  const { currentTransaction, status, secondsLeft, setTransaction, setStatus, setSecondsLeft, setIntervalId, reset } = usePaymentStore();
  const pollingRef = useRef(null);
  const countdownRef = useRef(null);

  const initiatePolling = (reference) => {
    // Countdown 120s
    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setStatus('TIMEOUT');
          clearInterval(pollingRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Polling statut
    pollingRef.current = setInterval(async () => {
      try {
        const res = await paymentsApi.checkStatus(reference);
        const txStatus = res.data.data.transaction.status;
        if (txStatus === 'SUCCESS' || txStatus === 'FAILED' || txStatus === 'CANCELLED') {
          setStatus(txStatus);
          clearInterval(pollingRef.current);
          clearInterval(countdownRef.current);
          if (txStatus === 'SUCCESS') {
            const orderId = res.data.data.transaction.orderId;
            setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1500);
          }
        }
      } catch {}
    }, PAYMENT_POLLING_INTERVAL_MS);

    setIntervalId(pollingRef.current);
  };

  const startPayment = (transaction) => {
    reset();
    setTransaction(transaction);
    initiatePolling(transaction.reference);
  };

  useEffect(() => {
    return () => {
      clearInterval(pollingRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  return { currentTransaction, status, secondsLeft, startPayment, reset };
}
