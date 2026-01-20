import { searchGoogleBooks, getOpenLibraryYear } from "./src/lib/api";

async function debug() {
  console.log("Fetching Harry Potter from Google Books...");
  const googleBooks = await searchGoogleBooks("Harry Potter");
  const firstBook = googleBooks[0];

  if (firstBook) {
    const info = firstBook.volumeInfo;
    console.log("Google Books Result:");
    console.log(`Title: ${info.title}`);
    console.log(`Authors: ${info.authors}`);

    const title = info.title || "Unknown";
    const author = info.authors ? info.authors[0] : "";

    const query = `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;
    const url = `https://openlibrary.org/search.json?${query}&limit=3&fields=title,author_name,first_publish_year`;
    console.log(`Open Library URL: ${url}`);

    const response = await fetch(url);
    const data = await response.json();
    console.log("Full Response Docs:", JSON.stringify(data.docs, null, 2));

    const year = await getOpenLibraryYear(title, author);
    console.log(`Open Library Year (via func): ${year}`);
  } else {
    console.log("No results from Google Books");
  }
}

debug();
