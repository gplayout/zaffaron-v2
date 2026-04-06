'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Upload, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { submitCookApplication } from './actions';
import { useAuth } from '@/hooks/useAuth';

const SPECIALTIES = [
  'Persian Cuisine',
  'Mediterranean',
  'Italian',
  'Indian',
  'Asian',
  'Middle Eastern',
  'Vegan',
  'Gluten-Free',
  'Desserts',
  'Baking',
  'Grill & BBQ',
  'Seafood',
  'Vegetarian',
  'Healthy',
  'Fusion',
];

const KITCHEN_TYPES = [
  { value: 'home_kitchen', label: 'Home Kitchen', description: 'I cook from my home kitchen' },
  { value: 'commercial_kitchen', label: 'Commercial Kitchen', description: 'I have a licensed commercial kitchen' },
  { value: 'catering', label: 'Catering Business', description: 'I run a catering business' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'both', label: 'Both Weekdays & Weekends' },
];

export default function CookApplyPage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    specialties: [] as string[],
    yearsOfExperience: '',
    bio: '',
    kitchenType: '',
    availability: '',
    agreeToTerms: false,
  });

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitCookApplication({
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
      specialties: formData.specialties,
      yearsOfExperience: formData.yearsOfExperience,
      bio: formData.bio,
      kitchenType: formData.kitchenType,
      availability: formData.availability,
    });

    setIsSubmitting(false);

    if (result.ok) {
      setIsSubmitted(true);
    } else if (result.error === 'auth') {
      setSubmitError('You must be signed in to submit an application. Please sign in and try again.');
    } else {
      setSubmitError(result.error || 'Something went wrong. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-100 p-4">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-stone-900">
            Application Submitted!
          </h1>
          <p className="mt-2 text-stone-600">
            Thank you for applying to become a cook on Zaffaron. We&apos;ll review your application and get back to you within 2-3 business days.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition hover:bg-amber-700"
            >
              Return to Home
            </Link>
            {!user && (
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Sign In to Your Account
              </Link>
            )}
            {user && (
              <Link
                href="/cook/dashboard"
                className="inline-flex w-full items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-50"
              >
                View Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-600 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-3">
            <ChefHat className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Become a Cook
            </h1>
            <p className="text-stone-600">
              Share your culinary talents with hungry customers
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-stone-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="e.g., Los Angeles, CA"
              />
            </div>
          </div>
        </section>

        {/* Profile Photo */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">
            Profile Photo
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-100">
              <ChefHat className="h-10 w-10 text-stone-400" />
            </div>
            <div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </button>
              <p className="mt-2 text-xs text-stone-500">
                JPG, PNG or GIF. Max 5MB. (Coming soon)
              </p>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">
            Experience & Bio
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-stone-700">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <select
                id="yearsOfExperience"
                required
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">Select experience</option>
                <option value="0-1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-stone-700">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                id="bio"
                required
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="Tell us about yourself, your cooking style, and what makes your food special..."
              />
              <p className="mt-1 text-xs text-stone-500">
                Minimum 50 characters
              </p>
            </div>
          </div>
        </section>

        {/* Specialties */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">
            Specialties <span className="text-red-500">*</span>
          </h2>
          <p className="mb-4 text-sm text-stone-600">
            Select the cuisines and styles you specialize in:
          </p>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((specialty) => (
              <button
                key={specialty}
                type="button"
                onClick={() => handleSpecialtyToggle(specialty)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  formData.specialties.includes(specialty)
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
          {formData.specialties.length === 0 && (
            <p className="mt-2 text-xs text-red-500">
              Please select at least one specialty
            </p>
          )}
        </section>

        {/* Kitchen Type */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">
            Kitchen Type <span className="text-red-500">*</span>
          </h2>
          <div className="space-y-3">
            {KITCHEN_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  formData.kitchenType === type.value
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="kitchenType"
                  value={type.value}
                  checked={formData.kitchenType === type.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, kitchenType: e.target.value }))}
                  className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="block font-medium text-stone-900">{type.label}</span>
                  <span className="block text-sm text-stone-600">{type.description}</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Availability */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">
            Availability <span className="text-red-500">*</span>
          </h2>
          <div className="space-y-3">
            {AVAILABILITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                  formData.availability === option.value
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={formData.availability === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-stone-900">{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Terms */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              required
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
              className="mt-1 h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-stone-700">
              I agree to the{' '}
              <Link href="/terms" className="text-amber-600 hover:text-amber-700 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-amber-600 hover:text-amber-700 hover:underline">
                Privacy Policy
              </Link>{' '}
              and certify that all information provided is accurate. <span className="text-red-500">*</span>
            </span>
          </label>
        </section>

        {/* Submit */}
        <div className="flex flex-col gap-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting || formData.specialties.length === 0}
              className="flex flex-1 items-center justify-center rounded-lg bg-amber-600 px-8 py-3 font-medium text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
