export type { Cook } from './cook';

export interface Ingredient {
  item: string;
  amount: string;
  unit: string;
  note?: string;
  group?: string;
}

export interface Instruction {
  step: number;
  text: string;
  time_minutes?: number;
}

export interface Substitution {
  original: string;
  substitute: string;
  note?: string;
}

export interface NutritionInfo {
  calories?: number;
  protein_g?: number;
  fat_g?: number;
  carbs_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  saturated_fat_g?: number;
}

export interface DietaryInfo {
  vegetarian?: boolean;
  vegan?: boolean;
  gluten_free?: boolean;
  dairy_free?: boolean;
  nut_free?: boolean;
  halal?: boolean;
  allergens?: string[];
  tags?: string[];
}

export interface FlavorProfile {
  taste?: string[];
  texture?: string[];
  aroma?: string[];
  spice_level?: string;
}

export interface CommonMistake {
  mistake: string;
  why: string;
  fix: string;
}

export interface RegionalVariation {
  region: string;
  description?: string;
  difference?: string;
}

export interface CostEstimate {
  per_serving_usd?: number;
  total_usd?: number;
  budget_level?: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string | null;
  image_alt: string | null;
  image_source: string | null;
  image_prompt: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  category_slug: string | null;
  cuisine: string;
  cuisine_slug: string | null;
  calories_per_serving: number | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  tips: string | string[] | null;
  storage_notes: string | null;
  serve_with: string | null;
  substitutions: Substitution[] | null;
  nutrition_per_serving: NutritionInfo | null;
  dietary_info: DietaryInfo | null;
  flavor_profile: FlavorProfile | null;
  cultural_significance: string | null;
  equipment: string[] | null;
  common_mistakes: CommonMistake[] | null;
  regional_variations: RegionalVariation[] | null;
  make_ahead: string | null;
  occasions: string[] | null;
  cost_estimate: CostEstimate | null;
  seo_title: string | null;
  seo_description: string | null;
  source_urls: string[] | null;
  author: string | null;
  published: boolean;
  published_at: string | null;
  verification_status: 'draft' | 'reviewed' | 'verified' | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}
