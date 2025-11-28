import { mockReservations, Reservation } from "@/data/reservations";

// Simulate network delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory store
let reservationStore = [...mockReservations];

export const reservationApi = {
  // Get all reservations
  getAll: async (): Promise<Reservation[]> => {
    await delay();
    return [...reservationStore];
  },

  // Get reservation by ID
  getById: async (id: string): Promise<Reservation | null> => {
    await delay();
    const reservation = reservationStore.find((r) => r.id === id);
    return reservation ? { ...reservation } : null;
  },

  // Get active reservations
  getActive: async (): Promise<Reservation[]> => {
    await delay();
    return reservationStore.filter((r) => r.status === "active");
  },

  // Get by member
  getByMember: async (memberId: string): Promise<Reservation[]> => {
    await delay();
    return reservationStore.filter((r) => r.memberId === memberId);
  },

  // Get by book
  getByBook: async (bookId: string): Promise<Reservation[]> => {
    await delay();
    return reservationStore
      .filter((r) => r.bookId === bookId)
      .sort((a, b) => a.priority - b.priority);
  },

  // Get by status
  getByStatus: async (status: Reservation["status"]): Promise<Reservation[]> => {
    await delay();
    return reservationStore.filter((r) => r.status === status);
  },

  // Create reservation
  create: async (
    reservationData: Omit<Reservation, "id" | "priority">
  ): Promise<Reservation> => {
    await delay();

    // Calculate priority based on existing reservations for the same book
    const existingReservations = reservationStore.filter(
      (r) => r.bookId === reservationData.bookId && r.status === "active"
    );
    const priority = existingReservations.length + 1;

    const newReservation: Reservation = {
      ...reservationData,
      id: String(Date.now()),
      priority,
    };
    reservationStore.push(newReservation);
    return { ...newReservation };
  },

  // Update reservation
  update: async (id: string, data: Partial<Reservation>): Promise<Reservation | null> => {
    await delay();
    const index = reservationStore.findIndex((r) => r.id === id);
    if (index === -1) return null;

    reservationStore[index] = { ...reservationStore[index], ...data };
    return { ...reservationStore[index] };
  },

  // Cancel reservation
  cancel: async (id: string): Promise<Reservation | null> => {
    await delay();
    const index = reservationStore.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const reservation = reservationStore[index];
    reservationStore[index].status = "cancelled";

    // Reorder priorities for remaining reservations
    const remainingReservations = reservationStore.filter(
      (r) => r.bookId === reservation.bookId && r.status === "active"
    );
    remainingReservations.sort((a, b) => a.priority - b.priority);
    remainingReservations.forEach((r, idx) => {
      const rIndex = reservationStore.findIndex((res) => res.id === r.id);
      if (rIndex !== -1) {
        reservationStore[rIndex].priority = idx + 1;
      }
    });

    return { ...reservationStore[index] };
  },

  // Fulfill reservation
  fulfill: async (id: string): Promise<Reservation | null> => {
    await delay();
    const index = reservationStore.findIndex((r) => r.id === id);
    if (index === -1) return null;

    reservationStore[index].status = "fulfilled";
    return { ...reservationStore[index] };
  },

  // Delete reservation
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const initialLength = reservationStore.length;
    reservationStore = reservationStore.filter((r) => r.id !== id);
    return reservationStore.length < initialLength;
  },

  // Get next in queue
  getNextInQueue: async (bookId: string): Promise<Reservation | null> => {
    await delay();
    const activeReservations = reservationStore
      .filter((r) => r.bookId === bookId && r.status === "active")
      .sort((a, b) => a.priority - b.priority);

    return activeReservations[0] ? { ...activeReservations[0] } : null;
  },

  // Get statistics
  getStats: async (): Promise<{
    total: number;
    active: number;
    fulfilled: number;
    expired: number;
    cancelled: number;
  }> => {
    await delay();
    return {
      total: reservationStore.length,
      active: reservationStore.filter((r) => r.status === "active").length,
      fulfilled: reservationStore.filter((r) => r.status === "fulfilled").length,
      expired: reservationStore.filter((r) => r.status === "expired").length,
      cancelled: reservationStore.filter((r) => r.status === "cancelled").length,
    };
  },
};
