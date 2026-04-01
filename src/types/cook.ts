export interface Cook {
  id: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  specialties: string[];
  location: string;
  rating: number;
  review_count: number;
  verified: boolean;
  created_at: string;
}
