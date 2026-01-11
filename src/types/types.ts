export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  difficulty: "Easy" | "Medium" | "Hard";
  fullDescription?: string;
  rating?: number;
  tags?: string[];
  gutendexId?: number; // Link to original API data
}
