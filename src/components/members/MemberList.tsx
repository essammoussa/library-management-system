import { useState } from "react";
import { Member } from "@/data/members";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react";

// Props for the MemberList component
interface MemberListProps {
  members: Member[]; // Array of members to display
  onView: (member: Member) => void; // Callback when clicking "view"
  onEdit: (member: Member) => void; // Callback when clicking "edit"
  onDelete: (id: string) => void; // Callback when clicking "delete"
  loading?: boolean; // Optional loading state
}

export function MemberList({
  members,
  onView,
  onEdit,
  onDelete,
  loading = false,
}: MemberListProps) {
  // State for search input
  const [searchQuery, setSearchQuery] = useState("");

  // State for status filter ("all", "active", "inactive", "suspended")
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Helper function to determine badge color based on member status
  const getStatusVariant = (status: Member["status"]) => {
    switch (status) {
      case "active":
        return "default"; // Default badge style
      case "inactive":
        return "secondary"; // Secondary color for inactive
      case "suspended":
        return "destructive"; // Red/destructive for suspended
      default:
        return "default";
    }
  };

  // Define table columns using TanStack Table
  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "name", // Field in the data
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} // Toggle sorting
          className="hover:bg-muted"
        >
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "membershipId",
      header: "Membership ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("membershipId")}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("phone")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Member["status"];
        // Display status as a badge with proper color
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "borrowedBooks",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} // Sort by borrowed books
          className="hover:bg-muted"
        >
          Borrowed <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("borrowedBooks")}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original; // Original row data
        return (
          <div className="flex items-center gap-2">
            {/* View button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(member)}
              className="hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Edit button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(member)}
              className="hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(member.id)}
              className="hover:bg-destructive/10 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Filter members based on search input and status filter
  const filteredMembers = members.filter((member) => {
    // Check if any field matches the search query
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.membershipId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery);

    // Check if status matches filter
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Show loading state if data is not ready
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input and status dropdown */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <Input
          placeholder="Search by name, email, ID, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />

        {/* Status filter dropdown */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Render data table with filtered members */}
      <DataTable columns={columns} data={filteredMembers} />
    </div>
  );
}
