import booksData from "./books.json";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: "available" | "borrowed" | "reserved";
  publishYear: number;
  quantity: number;
  availableQuantity: number;
}

export const mockBooks: Book[] = booksData as Book[];
