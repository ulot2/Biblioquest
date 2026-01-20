export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  theme: string; // Replaces difficulty
  fullDescription?: string;
  rating?: number;
  tags?: string[];
  gutendexId?: number; // Link to original API data
}
