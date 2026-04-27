import { create } from 'zustand';

export const usePaymentStore = create((set) => ({
  currentTransaction: null,
  status: null, // PENDING | SUCCESS | FAILED | TIMEOUT
  secondsLeft: 120,
  intervalId: null,

  setTransaction: (transaction) => set({ currentTransaction: transaction, status: 'PENDING', secondsLeft: 120 }),
  setStatus: (status) => set({ status }),
  setSecondsLeft: (secondsLeft) => set({ secondsLeft }),
  setIntervalId: (intervalId) => set({ intervalId }),

  reset: () => {
    const { intervalId } = usePaymentStore.getState();
    if (intervalId) clearInterval(intervalId);
    set({ currentTransaction: null, status: null, secondsLeft: 120, intervalId: null });
  },
}));
