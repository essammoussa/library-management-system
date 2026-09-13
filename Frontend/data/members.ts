import membersData from "./members.json";

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipId: string;
  joinDate: string;
  status: "active" | "inactive" | "suspended";
  borrowedBooks: number;
  address: string;
}

export const mockMembers: Member[] = membersData as Member[];
