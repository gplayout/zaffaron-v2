'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Star,
  Settings,
  ChefHat,
  Plus,
  TrendingUp,
  DollarSign,
  Award,
  Package,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', href: '/cook/dashboard' },
  { icon: UtensilsCrossed, label: 'Menu', href: '/cook/dashboard/menu' },
  // TODO: enable when routes exist
  // { icon: ShoppingBag, label: 'Orders', href: '/cook/dashboard/orders' },
  // { icon: Star, label: 'Reviews', href: '/cook/dashboard/reviews' },
  { icon: Settings, label: 'Settings', href: '/cook/dashboard/settings' },
];

const STATS = [
  { label: 'Total Orders', value: '0', icon: ShoppingBag, color: 'blue' },
  { label: 'Revenue', value: '$0', icon: DollarSign, color: 'emerald' },
  { label: 'Rating', value: '—', icon: Award, color: 'amber' },
  { label: 'Active Menu Items', value: '0', icon: Package, color: 'purple' },
];

export default function CookDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/cook/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] gap-6">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-xl border border-stone-200 bg-white p-4">
          {/* Cook Profile Summary */}
          <div className="mb-6 border-b border-stone-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <ChefHat className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-stone-900">Your Kitchen</p>
                <p className="text-xs text-stone-500">Pending Approval</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
            <p className="text-stone-600">Welcome back! Here&apos;s how your kitchen is performing.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700">
            <Plus className="h-4 w-4" />
            Add Menu Item
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-stone-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-stone-900">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${
                  stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                  stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="mb-8 rounded-xl border border-stone-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Revenue Overview</h2>
            <select className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <div className="flex h-64 items-center justify-center rounded-lg bg-stone-50">
            <div className="text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-stone-300" />
              <p className="mt-2 text-sm text-stone-500">No revenue data yet</p>
              <p className="text-xs text-stone-400">Start selling to see your revenue grow!</p>
            </div>
          </div>
        </div>

        {/* Your Menu Section */}
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Your Menu</h2>
            <Link
              href="/cook/dashboard/menu"
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              View All
            </Link>
          </div>
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-200 py-12">
            <div className="rounded-full bg-amber-100 p-4">
              <UtensilsCrossed className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-stone-900">
              No menu items yet
            </h3>
            <p className="mt-1 max-w-sm text-center text-sm text-stone-600">
              Start building your menu by adding your first dish. Customers will be able to order once your kitchen is approved.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700">
              <Plus className="h-4 w-4" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h3 className="font-semibold text-stone-900">Complete Your Profile</h3>
            <p className="mt-1 text-sm text-stone-600">
              Add more details about your kitchen to attract more customers.
            </p>
            <Link
              href="/cook/dashboard/settings"
              className="mt-4 inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Edit Profile →
            </Link>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h3 className="font-semibold text-stone-900">Learn Best Practices</h3>
            <p className="mt-1 text-sm text-stone-600">
              Tips and guidelines for successful food preparation and delivery.
            </p>
            <button className="mt-4 inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700">
              Read Guide →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
