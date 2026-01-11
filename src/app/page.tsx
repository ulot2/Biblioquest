"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Search } from "@/components/Search";
import { BookList } from "@/components/BookList";
import { Book } from "@/types/types";
import { searchBooks, calculateDifficulty, getCoverUrl } from "@/lib/api";
import { Loader2, Wand2 } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Sparkles } from "lucide-react";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Custom Quest State
  const [customQuest, setCustomQuest] = useState("");
  const router = useRouter();

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

  const handleCustomQuest = () => {
    if (!customQuest.trim()) return;
    // Navigate to the special custom route
    router.push(`/quest/custom-${encodeURIComponent(customQuest.trim())}`);
  };

  return (
    <>
      <Header />
      <main className="max-w-[1240px] mx-auto px-6 py-8">
        {/* Custom Quest Input */}
        <div className="mb-10 p-6 rounded-2xl bg-charcoal border border-amber/20 shadow-lg shadow-amber/5 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="text-amber" size={20} />
              <h3 className="text-xl font-bold text-white">
                Custom Simulation
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              Want to play in a universe not in the public domain (e.g.{" "}
              <i>Percy Jackson</i>, <i>Harry Potter</i>)? Enter the title below
              and the AI will simulate it for you.
            </p>
          </div>

          <div className="flex w-full md:w-auto gap-2">
            <input
              type="text"
              placeholder="Enter book title..."
              className="bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber w-full md:w-64 placeholder:text-gray-600"
              value={customQuest}
              onChange={(e) => setCustomQuest(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomQuest()}
            />
            <button
              onClick={handleCustomQuest}
              className="bg-amber hover:bg-amber-400 text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-amber/20"
            >
              <Play size={18} />
              Play Custom
            </button>
          </div>
        </div>

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
