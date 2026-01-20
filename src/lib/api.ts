export const GOOGLE_BOOKS_API_URL =
  "https://www.googleapis.com/books/v1/volumes";
export const OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";

export interface UnifiedBook {
  id: string; // Google Books ID
  title: string;
  authors: string[];
  description: string;
  coverUrl: string;
  subjects: string[];
  language: string;
  firstPublishYear: number | null;
  isPublicDomain: boolean;
}

export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    categories?: string[]; // subjects
    language?: string;
  };
}

export const searchGoogleBooks = async (
  query: string,
): Promise<GoogleBookVolume[]> => {
  try {
    const url = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=20&printType=books`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching Google Books:", error);
    return [];
  }
};

export const getOpenLibraryYear = async (
  title: string,
  author: string,
): Promise<number | null> => {
  // Rate limiting / optimization could be added here.
  // For now, we query purely by title + author.
  try {
    const query = `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;
    const url = `${OPEN_LIBRARY_SEARCH_URL}?${query}&limit=1&fields=first_publish_year`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.docs && data.docs.length > 0) {
      return data.docs[0].first_publish_year || null;
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching Open Library data for ${title}:`, error);
    return null;
  }
};

export const searchBooks = async (
  query: string = "",
): Promise<UnifiedBook[]> => {
  if (!query) return [];

  // 1. Fetch from Google Books
  const googleBooks = await searchGoogleBooks(query);

  // 2. Process results and fetch Open Library data in parallel
  // Note: Searching Open Library for *every* result might be slow.
  // We'll limit concurrency or just do it for the top X results if performance is an issue.
  // For this implementation, we will try to fetch for all but handle failures gracefully.

  const unifiedBooks = await Promise.all(
    googleBooks.map(async (gb) => {
      const info = gb.volumeInfo;
      const title = info.title || "Unknown Title";
      const author = info.authors ? info.authors[0] : ""; // Use first author for lookup

      let firstPublishYear: number | null = null;

      // Only query Open Library if we have a valid title AND author
      if (title && author) {
        firstPublishYear = await getOpenLibraryYear(title, author);
      }

      // Determine Public Domain status (< 1929)
      // If we can't find a year, we default to FALSE (Copyrighted) to be safe for "Classic Mode",
      // forcing "Narrative Mode" (AI) which is safer for copyright/modern books.
      const isPublicDomain =
        firstPublishYear !== null && firstPublishYear < 1929;

      return {
        id: gb.id,
        title: title,
        authors: info.authors || ["Unknown Author"],
        description: info.description || "No description available.",
        coverUrl:
          info.imageLinks?.thumbnail?.replace("http://", "https://") || "", // Force HTTPS
        subjects: info.categories || [],
        language: info.language || "en",
        firstPublishYear,
        isPublicDomain,
      };
    }),
  );

  return unifiedBooks;
};

export const getPopularBooks = async (): Promise<UnifiedBook[]> => {
  // Using a broad query like "subject:fiction" and sorting by relevance (default)
  // or specifically targeting "bestsellers" if the API supported it directly.
  // "subject:fiction" is a good proxy for general popular books.
  // We can also try "newest" or other keywords.
  return searchBooks("subject:fiction");
};

export const getBookById = async (id: string): Promise<UnifiedBook | null> => {
  // For detail view, we likely just need the Google Books data again.
  // Note: The ID passed here should be the Google Books ID.
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${id}`);
    if (!response.ok) return null;

    const gb: GoogleBookVolume = await response.json();
    const info = gb.volumeInfo;
    const title = info.title || "Unknown";
    const author = info.authors ? info.authors[0] : "";

    let firstPublishYear: number | null = null;
    if (title && author) {
      firstPublishYear = await getOpenLibraryYear(title, author);
    }

    const isPublicDomain = firstPublishYear !== null && firstPublishYear < 1929;

    return {
      id: gb.id,
      title: title,
      authors: info.authors || ["Unknown Author"],
      description: info.description || "No description available.",
      coverUrl:
        info.imageLinks?.thumbnail?.replace("http://", "https://") || "",
      subjects: info.categories || [],
      language: info.language || "en",
      firstPublishYear,
      isPublicDomain,
    };
  } catch (e) {
    console.error("Error fetching book details:", e);
    return null;
  }
};

// Start Quest Button Utility - Generates a theme based on book content
export const calculateTheme = (book: UnifiedBook): string => {
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

export const getCoverUrl = (book: UnifiedBook): string => {
  return book.coverUrl || "";
};
