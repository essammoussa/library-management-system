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
  image?: string; 

}

export interface BorrowedBook {
  bookId: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  userName: string;
  phoneNumber: string;
  notes?: string;
  image?: string; // Optional field for book cover image URL
}

// Track books reserved by user
export interface ReservedBook {
  bookId: string;
  bookTitle: string;
  reserverName: string;
  reservationDate: string;
  phoneNumber: string;
  notes?: string;
  image?: string; // Optional field for book cover image URL
}

// State structure for user's books
export interface UserBookState {
  borrowed: BorrowedBook[];
  reserved: ReservedBook[];
}


export const mockBooks: Book[] = booksData as Book[];
