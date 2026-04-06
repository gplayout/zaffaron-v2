'use server';

import { GoogleGenAI } from '@google/genai';
import { computeOverall, getBadge, CRITERIA_NAMES, type TahdigResult, type TahdigScores } from './lib/scoring';
import { TAHDIG_ANALYSIS_PROMPT } from './lib/prompts';

// Simple in-memory rate limiter (resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { ok: boolean; waitMinutes?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }

  if (entry.count >= RATE_LIMIT) {
    const waitMs = entry.resetAt - now;
    return { ok: false, waitMinutes: Math.ceil(waitMs / 60000) };
  }

  entry.count++;
  return { ok: true };
}

export async function rateTahdig(
  formData: FormData
): Promise<{ ok: true; result: TahdigResult } | { ok: false; error: string }> {
  try {
    // Rate limit check
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = checkRateLimit(ip);
    if (!rl.ok) {
      return { ok: false, error: `Too many requests! Try again in ${rl.waitMinutes} minutes. ⏳` };
    }

    // Get the uploaded image
    const file = formData.get('photo') as File | null;
    if (!file || file.size === 0) {
      return { ok: false, error: 'Please upload a photo of your tahdig! 📸' };
    }

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      return { ok: false, error: 'Image too large (max 10MB). Try a smaller photo. 📏' };
    }
    if (!file.type.startsWith('image/')) {
      return { ok: false, error: 'Please upload an image file. 🖼️' };
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Call Gemini Vision
    if (!process.env.GOOGLE_AI_KEY) {
      return { ok: false, error: 'Service temporarily unavailable. Please try again later.' };
    }
    const google = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });
    const resp = await google.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: TAHDIG_ANALYSIS_PROMPT },
            { inlineData: { mimeType: file.type, data: base64 } },
          ],
        },
      ],
    });

    // Parse response
    const text = resp.text || resp.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { ok: false, error: 'AI got confused looking at your tahdig. Try another photo! 🤖' };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Not tahdig?
    if (parsed.isTahdig === false) {
      return {
        ok: true,
        result: {
          isTahdig: false,
          rejectReason: parsed.rejectReason || "This doesn't look like tahdig!",
          scores: { color: 0, crispiness: 0, evenness: 0, shape: 0, presentation: 0 },
          overall: 0,
          badge: { en: "Not Tahdig", fa: "تهدیگ نیست", emoji: "🤔" },
          commentary: { en: parsed.rejectReason || "", fa: "" },
          tips: [],
          criteria: [],
        },
      };
    }

    // Build result
    const scores: TahdigScores = {
      color: Math.min(10, Math.max(0, parseFloat(parsed.scores?.color) || 0)),
      crispiness: Math.min(10, Math.max(0, parseFloat(parsed.scores?.crispiness) || 0)),
      evenness: Math.min(10, Math.max(0, parseFloat(parsed.scores?.evenness) || 0)),
      shape: Math.min(10, Math.max(0, parseFloat(parsed.scores?.shape) || 0)),
      presentation: Math.min(10, Math.max(0, parseFloat(parsed.scores?.presentation) || 0)),
    };

    const overall = computeOverall(scores);
    const badge = getBadge(overall);

    const criteria = CRITERIA_NAMES.map(({ key, en, fa }) => ({
      name: en,
      nameFa: fa,
      score: scores[key],
      note: parsed.notes?.[key] || '',
    }));

    const result: TahdigResult = {
      isTahdig: true,
      scores,
      overall,
      badge,
      commentary: {
        en: parsed.commentary?.en || '',
        fa: parsed.commentary?.fa || '',
      },
      tips: (parsed.tips || []).slice(0, 3),
      criteria,
    };

    return { ok: true, result };
  } catch (e) {
    console.error('Tahdig rating error:', e);
    return { ok: false, error: 'Something went wrong. Please try again! 🔄' };
  }
}
