import reservationsData from "./reservations.json";

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  reservationDate: string;
  expiryDate: string;
  image?: string; // Optional field for book cover image URL
  status: "active" | "fulfilled" | "expired" | "cancelled";
  priority: number;
}

export const mockReservations: Reservation[] = reservationsData as Reservation[];
