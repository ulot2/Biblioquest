"use client";

import React, { useState } from "react";
import { Book } from "@/types/types";
import { X, BookOpen, Scroll, User } from "lucide-react";
import Link from "next/link";

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case "Logic":
      case "Mystery":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Social":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "Occult":
        return "bg-red-900/40 text-red-400 border-red-500/50";
      case "Debate":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Adventure":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-[var(--color-amber)]/20 text-[var(--color-amber)] border-[var(--color-amber)]/30";
    }
  };

  return (
    <>
      <div className="group relative bg-charcoal rounded-xl overflow-hidden border border-white/5 hover:border-amber/50 transition-all duration-300 hover:shadow-2xl hover:shadow-(--color-amber)/10 hover:-translate-y-1 flex flex-col h-[500px] w-[290px]">
        {/* Image Container with Overlay */}
        <div className="relative aspect-2/3 overflow-hidden">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-charcoal via-transparent to-transparent opacity-60" />

          {/* Theme Badge */}
          <div
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${getThemeColor(
              book.theme,
            )}`}
          >
            {book.theme}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col grow">
          <h3 className="text-xl font-bold text-white mb-1 leading-tight group-hover:text-amber transition-colors">
            {book.title}
          </h3>
          <p className="text-muted-gray text-sm mb-3 flex items-center gap-1">
            <User size={14} /> {book.author}
          </p>

          <p className="text-gray-400 text-sm line-clamp-3 mb-6 grow">
            {book.description}
          </p>

          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-lg border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <Scroll size={16} />
              View Details
            </button>
            <Link href={`/quest/${book.id}`} className="w-full">
              <button className="w-full px-4 py-2.5 rounded-lg bg-amber text-black text-sm font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                <BookOpen size={16} />
                Begin Quest
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-charcoal rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header Image */}
            <div className="h-40 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-charcoal" />
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover opacity-50"
              />
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-8 pb-8 -mt-20 relative">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Cover Float */}
                <div className="w-32 md:w-48 shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-auto"
                  />
                </div>

                <div className="flex-1 pt-4 md:pt-12">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 border ${getThemeColor(
                      book.theme,
                    )}`}
                  >
                    {book.theme}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {book.title}
                  </h2>
                  <p className="text-amber text-lg mb-4">{book.author}</p>

                  <div className="prose prose-invert prose-sm max-w-none text-gray-300 mb-6">
                    <p>{book.fullDescription || book.description}</p>
                  </div>

                  {/* Tags if any */}
                  {book.tags && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {book.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Link
                      href={`/quest/${book.id}`}
                      className="flex-1 group/btn"
                    >
                      <button className="w-full px-6 py-3 rounded-xl bg-amber text-black font-bold text-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 group-hover/btn:scale-[1.02]">
                        <BookOpen size={20} />
                        Start Quest
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
