import { useState, useCallback } from 'react';

let toastId = 0;

// Store global simple (sans Zustand pour éviter la circularité)
let listeners = [];
const toastState = { toasts: [] };

function notify() { listeners.forEach((l) => l([...toastState.toasts])); }

export function addToast(message, type = 'info', duration = 4000) {
  const id = ++toastId;
  toastState.toasts = [...toastState.toasts, { id, message, type }];
  notify();
  setTimeout(() => removeToast(id), duration);
}

export function removeToast(id) {
  toastState.toasts = toastState.toasts.filter((t) => t.id !== id);
  notify();
}

export function useToast() {
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    addToast(message, type, duration);
  }, []);
  return { showToast };
}

export function useToastList() {
  const [toasts, setToasts] = useState(toastState.toasts);
  useState(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter((l) => l !== setToasts); };
  });
  return { toasts, removeToast };
}
