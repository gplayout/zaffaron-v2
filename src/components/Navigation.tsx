"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Menu, X, Search, UtensilsCrossed, Calendar } from "lucide-react";
import { HeaderAuthWithFavorites } from "./HeaderAuthWithFavorites";

const navLinks = [
  { href: "/recipes", label: "Recipes", icon: UtensilsCrossed },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/search", label: "Search", icon: Search },
];

// Marketplace links — hidden until live
// const becomeCookLink = { href: "/cook/apply", label: "Become a Cook" };
// const orderFoodLink = { href: "/cooks", label: "Order Food" };

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-amber-600" />
          <span className="text-xl font-bold text-amber-600">Zaffaron</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive(link.href)
                  ? "bg-amber-50 text-amber-700"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {/* Marketplace links hidden until live */}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/search"
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            aria-label="Search recipes"
          >
            <Search className="h-5 w-5" />
          </Link>
          <HeaderAuthWithFavorites />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/search"
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            aria-label="Search recipes"
          >
            <Search className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="border-t border-stone-200 bg-white md:hidden">
          <nav className="space-y-1 px-4 py-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition ${
                    isActive(link.href)
                      ? "bg-amber-50 text-amber-700"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
            <div className="my-3 border-t border-stone-100" />
            {/* Marketplace links hidden until live */}
            <div className="my-3 border-t border-stone-100" />
            <div className="px-3 py-2">
              <HeaderAuthWithFavorites />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
