import { useState } from "react";

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  publishYear: number;
  status: "available" | "borrowed" | "reserved";
  availableQuantity: number;
  coverImage?: string;
  description?: string;
}

export interface BorrowedBook {
  userName: string;
  bookId: string;
  bookTitle: string;       
  borrowDate: string;
  dueDate: string;
  quantity: number;   
  notes?: string;      
}

export interface ReservedBook {
  bookId: string;
  bookTitle: string;       
  reserverName: string;
  reservationDate: string;
  quantity: number;
  notes?: string;
}

export interface UserBookState {
  borrowed: BorrowedBook[];
  reserved: ReservedBook[];
}

const [userBooks, setUserBooks] = useState<UserBookState>({
  borrowed: [],
  reserved: []
});
