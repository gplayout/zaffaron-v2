'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChefHat,
  Star,
  MapPin,
  CheckCircle,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Clock,
  Users,
  X,
} from 'lucide-react';
import type { Cook } from '@/types/cook';
import type { MenuItem } from '@/types/order';

interface CartItem extends MenuItem {
  quantity: number;
}

interface OrderPageClientProps {
  cook: Cook;
  menuItems: MenuItem[];
}

export default function OrderPageClient({ cook, menuItems }: OrderPageClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = ['appetizer', 'main', 'side', 'dessert', 'drink'] as const;
  const categoryLabels: Record<string, string> = {
    appetizer: 'Appetizers',
    main: 'Main Dishes',
    side: 'Sides',
    dessert: 'Desserts',
    drink: 'Drinks',
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Back Link */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm text-stone-600 transition hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Cook Info Header */}
          <div className="mb-8 rounded-xl border border-stone-200 bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {cook.avatar_url ? (
                  <Image
                    src={cook.avatar_url}
                    alt={cook.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <ChefHat className="h-10 w-10" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-stone-900">{cook.name}</h1>
                  {cook.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-stone-900">{cook.rating}</span>
                    <span className="text-stone-500">({cook.review_count} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-600">
                    <MapPin className="h-4 w-4" />
                    <span>{cook.location}</span>
                  </div>
                </div>

                <p className="mt-2 text-sm text-stone-600">{cook.bio}</p>

                {/* Specialties */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {cook.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-8">
            {categories.map((category) => {
              const items = menuItems.filter((item) => item.category === category);
              if (items.length === 0) return null;

              return (
                <section key={category}>
                  <h2 className="mb-4 text-xl font-semibold text-stone-900">
                    {categoryLabels[category]}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 transition hover:shadow-md"
                      >
                        <div className="flex gap-4">
                          {/* Image Placeholder */}
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-stone-100">
                            <UtensilsCrossedIcon className="h-8 w-8 text-stone-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-stone-900 truncate">
                                {item.name}
                              </h3>
                              <span className="font-medium text-amber-600 shrink-0">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-stone-600 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-xs text-stone-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.prep_time_minutes} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Serves {item.serves}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => addToCart(item)}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
                        >
                          <Plus className="h-4 w-4" />
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Cart Sidebar */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">
                Your Order
              </h2>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-stone-500" />
                {cartItemCount > 0 && (
                  <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-medium text-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="mt-6 py-8 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-stone-300" />
                <p className="mt-3 text-sm text-stone-500">Your cart is empty</p>
                <p className="text-xs text-stone-400">Add items to get started</p>
              </div>
            ) : (
              <>
                <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-stone-50 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-stone-500">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-stone-600 transition hover:bg-stone-300"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white transition hover:bg-amber-700"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-stone-200 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="font-medium text-stone-900">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-stone-600">Delivery Fee</span>
                    <span className="font-medium text-stone-900">TBD</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-lg font-semibold">
                    <span className="text-stone-900">Total</span>
                    <span className="text-amber-600">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  disabled
                  className="mt-6 w-full rounded-lg bg-stone-300 px-4 py-3 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proceed to Checkout
                </button>
                <p className="mt-2 text-center text-xs text-stone-500">
                  Checkout coming soon
                </p>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Cart Button */}
      <div className="fixed bottom-4 left-4 right-4 lg:hidden">
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-amber-600 px-6 py-4 text-white shadow-lg"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">
              {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <span className="text-lg font-semibold">${cartTotal.toFixed(2)}</span>
        </button>
      </div>

      {/* Mobile Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Your Order</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-stone-300" />
                <p className="mt-3 text-sm text-stone-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-stone-50 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-stone-500">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-stone-600"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-stone-200 pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span className="text-stone-900">Total</span>
                    <span className="text-amber-600">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  disabled
                  className="mt-6 w-full rounded-lg bg-stone-300 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proceed to Checkout
                </button>
                <p className="mt-2 text-center text-xs text-stone-500">
                  Checkout coming soon
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UtensilsCrossedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}
