import React from "react";
import { Book } from "@/types/types";
import { BookCard } from "./BookCard";

interface BookListProps {
  books: Book[];
}

export const BookList: React.FC<BookListProps> = ({ books }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};
