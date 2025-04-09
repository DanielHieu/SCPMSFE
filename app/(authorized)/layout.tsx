"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import "../globals.css";
import Header from "@/components/Header";

interface AuthorizedLayoutProps {
  children: ReactNode;
}

export default function AuthorizedLayout({ children }: AuthorizedLayoutProps) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  return (
    <>
      <Header />
      <main className="min-h-screen container mx-auto py-4 px-4">
        {children}
      </main>
    </>
  );
}
