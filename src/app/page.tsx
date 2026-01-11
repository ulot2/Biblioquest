"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Search } from "@/components/Search";
import { BookList } from "@/components/BookList";
import { Book } from "@/types/types";
import { searchBooks, calculateDifficulty, getCoverUrl } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchBooks = async (query: string) => {
    setLoading(true);
    try {
      const results = await searchBooks(query);
      const mappedBooks: Book[] = results.map((b) => ({
        id: b.id.toString(),
        title: b.title,
        author:
          b.authors[0]?.name
            .replace(/, /g, " ")
            .split(" ")
            .reverse()
            .join(" ") || "Unknown",
        description: `A classic work with ${b.download_count} downloads.`,
        fullDescription: `Subjects: ${b.subjects.slice(0, 3).join(", ")}...`,
        coverUrl:
          getCoverUrl(b) ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop",
        difficulty: calculateDifficulty(b),
        tags: b.subjects.slice(0, 3).map((s) => s.split(" -- ")[0]),
        gutendexId: b.id,
      }));
      setBooks(mappedBooks);
    } catch (e) {
      console.error("Failed to load books", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    if (activeFilter === "All") return true;
    return book.difficulty === activeFilter;
  });

  return (
    <>
      <Header />
      <main className="max-w-[1240px] mx-auto px-6 py-8">
        <div className="mb-10">
          <Search
            query={searchQuery}
            onSearch={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {searchQuery ? `Results for "${searchQuery}"` : "Popular Quests"}
            </h2>
            <button className="text-amber text-sm hover:underline">
              View All
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-amber" size={48} />
            </div>
          ) : (
            <BookList books={filteredBooks} />
          )}
        </div>
      </main>
    </>
  );
}
