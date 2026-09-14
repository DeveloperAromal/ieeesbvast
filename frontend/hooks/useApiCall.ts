"use client";

import { ApiResponse } from "../types/api_types";
import axios, { Method } from "axios";
import { useCallback, useState } from "react";

export const useApiCall = () => {
  const [isLoading, setIsLoading] = useState(false);

  const makeApiCall = useCallback(
    async (
      method: Method,
      endpoint: string,
      data?: unknown,
    ): Promise<ApiResponse> => {
      setIsLoading(true);

      try {
        const sessionToken = typeof window === "undefined"
          ? null
          : window.sessionStorage.getItem("session_token");
        const response = await axios({
          method,
          url: endpoint,
          data,
          withCredentials: true,
          headers: sessionToken
            ? { Authorization: `Bearer ${sessionToken}` }
            : undefined,
        });

        return {
          success: true,
          data: response.data?.data,
          status: response.status,
          message: response.data?.message,
        };
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          return {
            success: false,
            data: null,
            message:
              error.response?.data?.message ??
              error.response?.data?.data?.message ??
              "Something went wrong. Please try again.",
            status: error.response?.status,
          };
        }

        return {
          success: false,
          data: null,
          message: "An unexpected error occurred.",
          status: 500,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    makeApiCall,
    isLoading,
  };
};
