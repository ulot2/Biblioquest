export const GUTENDEX_API_URL = "https://gutendex.com/books";

export interface GutendexBook {
  id: number;
  title: string;
  authors: {
    name: string;
    birth_year: number | null;
    death_year: number | null;
  }[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean | null;
  media_type: string;
  formats: Record<string, string>;
  download_count: number;
}

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

export const searchBooks = async (
  query: string = "",
): Promise<GutendexBook[]> => {
  try {
    const url = query
      ? `${GUTENDEX_API_URL}?search=${encodeURIComponent(query)}`
      : `${GUTENDEX_API_URL}?sort=popular`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }
    const data: GutendexResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

export const getBookById = async (id: string): Promise<GutendexBook | null> => {
  try {
    const response = await fetch(`${GUTENDEX_API_URL}/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
};

// Start Quest Button Utility - Generates a theme based on book content
export const calculateTheme = (book: GutendexBook): string => {
  const text = (book.title + " " + book.subjects.join(" ")).toLowerCase();

  if (
    text.includes("mystery") ||
    text.includes("detective") ||
    text.includes("sherlock") ||
    text.includes("crime")
  ) {
    return "Logic";
  }
  if (
    text.includes("love") ||
    text.includes("romance") ||
    text.includes("austen") ||
    text.includes("pride")
  ) {
    return "Social";
  }
  if (
    text.includes("horror") ||
    text.includes("dracula") ||
    text.includes("ghost") ||
    text.includes("frankenstein")
  ) {
    return "Occult";
  }
  if (
    text.includes("philosophy") ||
    text.includes("politics") ||
    text.includes("society") ||
    text.includes("government")
  ) {
    return "Debate";
  }
  if (
    text.includes("war") ||
    text.includes("history") ||
    text.includes("adventure") ||
    text.includes("sea")
  ) {
    return "Adventure";
  }

  return "Literary"; // Default
};

export const getCoverUrl = (book: GutendexBook): string => {
  return book.formats["image/jpeg"] || book.formats["image/png"] || "";
};
