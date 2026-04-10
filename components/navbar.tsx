"use client";
import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Scale, Sun, Moon } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  // Theme state (dark mode) with persistence
  const [isDark, setIsDark] = React.useState(false);

  // Initialize theme based on localStorage or prefers-color-scheme
  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("lexai-theme") : null;
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      if (prefersDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("lexai-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("lexai-theme", "light");
    }
  };

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
              {/* Theme toggle button */}
              <button
                aria-label="Toggle dark mode"
                onClick={toggleTheme}
                className="p-2 rounded-full border border-stone-200 hover:bg-stone-100 transition-colors ml-2"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-stone-700" />
                ) : (
                  <Moon className="w-5 h-5 text-stone-700" />
                )}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
