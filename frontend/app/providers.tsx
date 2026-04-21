"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#0F172A',
          color: '#F8FAFC',
          borderRadius: '16px',
          border: '1px solid rgba(139, 92, 246, 0.1)',
        },
      }} />
    </QueryClientProvider>
  );
}
