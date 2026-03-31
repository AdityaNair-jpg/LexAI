"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Scale } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 shadow-lg shadow-stone-900/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-stone-900/20">
            <Scale className="h-5.5 w-5.5 text-[#c5a368]" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-bold font-serif tracking-tight text-stone-900">
            Lex<span className="text-[#9a7b4f]">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === "/dashboard"
                ? "bg-stone-100 text-stone-900"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            Dashboard
          </Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-4">
          {isLoaded && isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-stone-100",
                },
              }}
            />
          ) : isLoaded ? (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-full shadow-lg shadow-stone-900/10 hover:shadow-stone-900/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
