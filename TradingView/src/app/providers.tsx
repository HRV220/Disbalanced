"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
// import { SessionProvider } from "next-auth/react"; // TODO: настроить next-auth

// Hydrate zustand stores on client (lazy import to avoid SSR issues)
function StoreHydration() {
  useEffect(() => {
    // Dynamic import to ensure this only runs on client
    import("@/stores").then(({ useChartStore, usePresetStore }) => {
      useChartStore.persist.rehydrate();
      usePresetStore.persist.rehydrate();
    });
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    // TODO: вернуть SessionProvider после настройки next-auth
    <QueryClientProvider client={queryClient}>
      <StoreHydration />
      {children}
    </QueryClientProvider>
  );
}
