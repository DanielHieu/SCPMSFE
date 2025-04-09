"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/lib/context/NotificationContext";
import { NotificationContainer } from "@/components/ui/Notification";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
        <NotificationContainer />
      </NotificationProvider>
    </SessionProvider>
  );
} 