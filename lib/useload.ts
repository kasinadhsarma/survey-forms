'use client';
import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "./fetch";

type LoadState<T> = {
    data: T | null;
    error: string | null;
    loading: boolean;
    reload: () => void;
};

/**
 * Run an async loader and report loading, error or data.
 */
export function useLoad<T>(
    loader: () => Promise<T>,
    deps: unknown[],
): LoadState<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;
        loader()
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [version, ...deps]);

    const reload = useCallback(() => {
        setLoading(true);
        setVersion((v) => v + 1);
    }, []);

    return { data, error, loading, reload };
}
