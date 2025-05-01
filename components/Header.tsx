"use client";

import Link from "next/link";
import UserDropdown from "./UserDropDown";
import { useSession } from "next-auth/react";

const Header = () => {
  const { data: session } = useSession();
  const parkingLotName = session?.user?.parkingLot?.name || session?.user?.parkingLot?.parkingLotName || "Smart Parking";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center m-auto justify-between px-4 md:px-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-blue-600"
            >
              <rect width="18" height="12" x="3" y="6" rx="3" ry="3" />
              <path d="M7 10h10" />
              <path d="M7 14h6" />
              <path d="M3 10v4" />
              <path d="M21 10v4" />
              <circle cx="17" cy="14" r="1.5" fill="currentColor" />
              <path d="M7 6V4" />
              <path d="M17 6V4" />
              <path d="M12 6V3" />
              <path d="M9 18l1.5 2" />
              <path d="M15 18l-1.5 2" />
            </svg>
            <div className="flex flex-col">
              <span className="inline-block font-bold">Smart Parking</span>
              {session?.user?.parkingLot && (
                <span className="text-xs text-blue-600 font-medium">{parkingLotName}</span>
              )}
            </div>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="/entrance" className="flex items-center text-sm font-medium transition-colors hover:text-foreground/80">
              Xe vào bãi
            </Link>
            <Link href="/exit" className="flex items-center text-sm font-medium transition-colors hover:text-foreground/80">
              Xe ra bãi
            </Link>
            <Link href="/statistics" className="flex items-center text-sm font-medium transition-colors hover:text-foreground/80">
              Thống kê
            </Link>
          </nav>
        </div>

        <UserDropdown />
      </div>
    </header>
  );
}

export default Header;