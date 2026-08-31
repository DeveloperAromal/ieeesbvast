"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { useCallback, useEffect, useState } from "react";

/**
 * useImageUrl Hook
 * Fetches fresh signed URL on-demand (avoids expiration)
 * Perfect for background images and dynamic content
 */
export const useImageUrl = (imageKey: string | null | undefined) => {
  const { makeApiCall } = useApiCall();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchImageUrl = useCallback(async () => {
    if (!imageKey) {
      setImageUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      // Call GET /api/v1/upload/{key}
      // The key may contain slashes like "uploads/1788191868095678800.png"
      // Don't encode slashes - Gin will handle it with wildcard route
      const result = await makeApiCall(
        "GET",
        `${APIENDPOINT.Root}api/v1/upload/${imageKey}`
      );

      if (result.success && result.data?.url) {
        setImageUrl(result.data.url);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [imageKey, makeApiCall]);

  useEffect(() => {
    fetchImageUrl();
  }, [fetchImageUrl]);

  return { imageUrl, loading, error, refetch: fetchImageUrl };
};
