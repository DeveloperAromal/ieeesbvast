"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import React, { useEffect, useState } from "react";

interface BackgroundImageProps {
  imageKey: string | null | undefined;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fallbackColor?: string;
  refreshInterval?: number; // in minutes, default 55 (refresh before 1 hour expires)
}

/**
 * BackgroundImage Component
 * Handles background images with automatic refresh before expiration
 * Refreshes signed URL every 55 minutes (before 1 hour expiration)
 */
export function BackgroundImage({
  imageKey,
  children,
  className = "",
  style = {},
  fallbackColor = "var(--bg-surface)",
  refreshInterval = 55, // minutes
}: BackgroundImageProps) {
  const { makeApiCall } = useApiCall();
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageKey) {
      setBackgroundUrl(null);
      setLoading(false);
      return;
    }

    const fetchImageUrl = async () => {
      try {
        const result = await makeApiCall(
          "GET",
          `${APIENDPOINT.Root}api/v1/upload/${encodeURIComponent(imageKey)}`
        );

        if (result.success && result.data?.url) {
          setBackgroundUrl(result.data.url);
        }
      } catch (err) {
        console.error("Failed to fetch image URL:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();

    // Refresh the signed URL before it expires
    const refreshTimer = setInterval(() => {
      fetchImageUrl();
    }, refreshInterval * 60 * 1000); // convert minutes to milliseconds

    return () => clearInterval(refreshTimer);
  }, [imageKey, makeApiCall, refreshInterval]);

  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: backgroundUrl ? `url('${backgroundUrl}')` : undefined,
        backgroundColor: !backgroundUrl ? fallbackColor : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
}
