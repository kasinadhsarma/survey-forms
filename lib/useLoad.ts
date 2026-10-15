'use client';

import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from './fetch';

type LoadState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
};

/** Runs an async loader and reports loading, error or data; reruns when `key` changes. */
export function useLoad<T>(
  loader: () => Promise<T>,
  key: string,
): LoadState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let cancelled = false;
    loaderRef.current()
      .then((value) => {
        if (!cancelled) {
          setData(value);
          setError(null);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(e));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, version]);

  return { data, error, loading, reload: () => setVersion((v) => v + 1) };
}
