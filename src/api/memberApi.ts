import { mockMembers, Member } from "@/data/members";

// Simulate network delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory store
let membersStore = [...mockMembers];

export const memberApi = {
  // Get all members
  getAll: async (): Promise<Member[]> => {
    await delay();
    return [...membersStore];
  },

  // Get member by ID
  getById: async (id: string): Promise<Member | null> => {
    await delay();
    const member = membersStore.find((m) => m.id === id);
    return member ? { ...member } : null;
  },

  // Search members
  search: async (query: string): Promise<Member[]> => {
    await delay();
    const lowerQuery = query.toLowerCase();
    return membersStore.filter(
      (member) =>
        member.name.toLowerCase().includes(lowerQuery) ||
        member.email.toLowerCase().includes(lowerQuery) ||
        member.membershipId.toLowerCase().includes(lowerQuery) ||
        member.phone.includes(lowerQuery)
    );
  },

  // Filter by status
  getByStatus: async (status: Member["status"]): Promise<Member[]> => {
    await delay();
    return membersStore.filter((member) => member.status === status);
  },

  // Get active members
  getActive: async (): Promise<Member[]> => {
    await delay();
    return membersStore.filter((member) => member.status === "active");
  },

  // Create new member
  create: async (memberData: Omit<Member, "id">): Promise<Member> => {
    await delay();
    const newMember: Member = {
      ...memberData,
      id: String(Date.now()),
    };
    membersStore.push(newMember);
    return { ...newMember };
  },

  // Update member
  update: async (id: string, memberData: Partial<Member>): Promise<Member | null> => {
    await delay();
    const index = membersStore.findIndex((m) => m.id === id);
    if (index === -1) return null;

    membersStore[index] = { ...membersStore[index], ...memberData };
    return { ...membersStore[index] };
  },

  // Delete member
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const initialLength = membersStore.length;
    membersStore = membersStore.filter((m) => m.id !== id);
    return membersStore.length < initialLength;
  },

  // Suspend member
  suspend: async (id: string): Promise<Member | null> => {
    await delay();
    const index = membersStore.findIndex((m) => m.id === id);
    if (index === -1) return null;

    membersStore[index].status = "suspended";
    return { ...membersStore[index] };
  },

  // Activate member
  activate: async (id: string): Promise<Member | null> => {
    await delay();
    const index = membersStore.findIndex((m) => m.id === id);
    if (index === -1) return null;

    membersStore[index].status = "active";
    return { ...membersStore[index] };
  },

  // Get member statistics
  getStats: async (id: string): Promise<{ borrowedBooks: number; totalBorrowed: number } | null> => {
    await delay();
    const member = membersStore.find((m) => m.id === id);
    if (!member) return null;

    return {
      borrowedBooks: member.borrowedBooks,
      totalBorrowed: member.borrowedBooks + Math.floor(Math.random() * 10), // Mock total history
    };
  },
};
