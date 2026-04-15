// Vault recipe types — shared across client and server

export interface VaultIngredient {
  item: string;
  amount: string;
  unit: string;
  note?: string;
}

export interface VaultInstruction {
  step: number;
  text: string;
}

export interface VaultStructuredData {
  ingredients: VaultIngredient[];
  instructions: VaultInstruction[];
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  cuisine?: string;
  category?: string;
  language?: string;
}

export interface VaultRecipe {
  id: string;
  owner_id: string;
  family_id?: string;
  title: string;
  structured_data: VaultStructuredData;
  source_type: "voice" | "photo" | "text" | "fork";
  original_media_url?: string;
  raw_transcript?: string;
  attribution_name?: string;
  attribution_story?: string;
  visibility: "private" | "family" | "public";
  share_slug?: string;
  ai_confidence?: number;
  is_verified: boolean;
  cuisine?: string;
  language?: string;
  tags?: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type StructureResult =
  | {
      ok: true;
      data: VaultStructuredData;
      confidence: number;
      language_detected: string;
    }
  | {
      ok: false;
      error: string;
    };
