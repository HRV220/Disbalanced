"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
// import { SessionProvider } from "next-auth/react"; // TODO: настроить next-auth

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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
