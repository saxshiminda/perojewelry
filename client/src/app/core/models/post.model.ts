export interface Post {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}
