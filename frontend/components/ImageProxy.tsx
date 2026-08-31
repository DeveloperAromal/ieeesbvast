"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { useEffect, useState } from "react";

interface ImageProxyProps {
  imageKey: string | null | undefined;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ImageProxy Component
 * Fetches fresh signed URL only when needed (avoiding expiration)
 * Good for:
 * - Poster images
 * - Speaker photos
 * - Any dynamic images
 */
export function ImageProxy({
  imageKey,
  alt = "Image",
  className = "",
  style = {},
  onLoad,
  onError,
}: ImageProxyProps) {
  const { makeApiCall } = useApiCall();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imageKey) {
      setImageUrl(null);
      return;
    }

    const fetchImageUrl = async () => {
      setLoading(true);
      setError(false);

      try {
        // Call GET /api/v1/upload/{key}
        // The key may contain slashes like "uploads/1788191868095678800.png"
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
    };

    fetchImageUrl();
  }, [imageKey, makeApiCall]);

  if (loading || !imageUrl) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: "var(--bg-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading && <div style={{ color: "var(--text-muted)" }}>Loading...</div>}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: "var(--bg-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "var(--text-muted)" }}>Image not available</div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={onError}
    />
  );
}
