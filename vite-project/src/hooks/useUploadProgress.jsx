import { useCallback, useRef, useState } from 'react';
import { openProgressSSE, closeSSE as closeSSEUtil } from '../utils/sse.js';

const useUploadProgress = () => {
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const eventSourceRef = useRef(null);
  const totalRef = useRef(0);
  const doneRef = useRef(0);

  const genClientId = useCallback(() => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    totalRef.current = 0;
    doneRef.current = 0;
    setShowProgress(false);
  }, []);

  const closeSSE = useCallback(() => {
    if (eventSourceRef.current) {
      try { closeSSEUtil(eventSourceRef.current); } catch {}
      eventSourceRef.current = null;
    }
  }, []);

  const computePercent = useCallback(() => {
    const total = Math.max(1, totalRef.current || 1);
    const percent = Math.floor((doneRef.current / total) * 100);
    return Math.min(100, Math.max(0, percent));
  }, []);

  const openSSE = useCallback((cid) => {
    closeSSE();
    reset();
    eventSourceRef.current = openProgressSSE(cid, {
      onMessage: (data) => {
        switch (data.type) {
          case 'keepalive':
            break;
          case 'progress':
            totalRef.current = data.total || totalRef.current;
            doneRef.current = data.done || 0;
            setProgress(computePercent());
            break;
          case 'finished':
            setProgress(100);
            setTimeout(() => { reset(); }, 800);
            break;
          default:
            break;
        }
      },
      onError: () => {
        closeSSE();
      }
    });
  }, [closeSSE, reset, computePercent]);

  const startTracking = useCallback((cid) => {
    const id = cid || genClientId();
    setShowProgress(true);
    openSSE(id);
    return id;
  }, [genClientId, openSSE]);

  const stopTracking = useCallback((delayMs = 1500) => {
    setTimeout(() => closeSSE(), delayMs);
  }, [closeSSE]);

  const abortTracking = useCallback(() => {
    closeSSE();
    reset();
  }, [closeSSE, reset]);

  return {
    progress,
    showProgress,
    startTracking,
    stopTracking,
    abortTracking,
    reset,
    genClientId,
  };
};

export default useUploadProgress;


