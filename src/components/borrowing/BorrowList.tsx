import { useState } from "react";
import { BorrowRecord } from "@/data/borrowing";
import { Book } from "@/data/books";
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
import { RotateCcw, ArrowUpDown ,Loader2} from "lucide-react";

interface BorrowListProps {
  borrowRecords: BorrowRecord[]; // List of borrow records
  books: Book[];                 // All books (needed for names & available quantity)
  members: Member[];             // All members (needed for names)
  onReturn: (record: BorrowRecord) => void; // Callback to handle returning a book
  loading?: boolean;             // Optional loading state
}

export function BorrowList({
  borrowRecords,
  books,
  members,
  onReturn,
  loading = false,
}: BorrowListProps) {
  // --- Local state ---
  const [searchQuery, setSearchQuery] = useState(""); // Search by book title or member name
  const [statusFilter, setStatusFilter] = useState<string>("all"); // Filter by borrow status

  // --- Helper functions ---
  
  // Convert book ID to book title
  const getBookTitle = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    return book ? book.title : "Unknown Book";
  };

  // Convert member ID to member name
  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : "Unknown Member";
  };

  // Map status to UI badge color
  const getStatusVariant = (status: BorrowRecord["status"]) => {
    switch (status) {
      case "active":
        return "default"; // Normal badge for active
      case "overdue":
        return "destructive"; // Red badge for overdue
      case "returned":
        return "secondary"; // Gray/secondary badge for returned
      default:
        return "default";
    }
  };

  // Determine current status based on return date and due date
  const calculateStatus = (record: BorrowRecord): BorrowRecord["status"] => {
    if (record.returnDate) return "returned"; // Already returned
    const today = new Date();
    const dueDate = new Date(record.dueDate);
    return today > dueDate ? "overdue" : "active"; // Overdue if past due
  };

  // Calculate late fee dynamically if overdue
  const calculateLateFee = (record: BorrowRecord): number => {
    if (record.returnDate) return record.fine; // Already returned, use recorded fine

    const today = new Date();
    const dueDate = new Date(record.dueDate);
    const daysLate = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLate <= 0) return 0; // Not late
    return daysLate * 0.5; // $0.5 per day
  };

  // --- Define table columns ---
  const columns: ColumnDef<BorrowRecord>[] = [
    {
      accessorKey: "bookId",
      header: ({ column }) => (
        // Sortable column header for Book
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Book
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{getBookTitle(row.getValue("bookId"))}</div>
      ),
    },
    {
      accessorKey: "memberId",
      header: "Member",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{getMemberName(row.getValue("memberId"))}</div>
      ),
    },
    {
      accessorKey: "borrowDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Borrow Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>{new Date(row.getValue("borrowDate")).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted"
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>{new Date(row.getValue("dueDate")).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "returnDate",
      header: "Return Date",
      cell: ({ row }) => {
        const returnDate = row.getValue("returnDate") as string | undefined;
        return (
          <div className="text-muted-foreground">
            {returnDate ? new Date(returnDate).toLocaleDateString() : "-"}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const record = row.original;
        const status = calculateStatus(record);
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      id: "lateFee",
      header: "Late Fee",
      cell: ({ row }) => {
        const record = row.original;
        const lateFee = calculateLateFee(record);
        return (
          <div className={lateFee > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
            ${lateFee.toFixed(2)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const record = row.original;
        const status = calculateStatus(record);
        const canReturn = status !== "returned"; // Only allow return if not returned

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReturn(record)}
            disabled={!canReturn}
            className="hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Return
          </Button>
        );
      },
    },
  ];

  // --- Filter records based on search and status ---
  const filteredRecords = borrowRecords.filter((record) => {
    const bookTitle = getBookTitle(record.bookId).toLowerCase();
    const memberName = getMemberName(record.memberId).toLowerCase();
    const matchesSearch =
      bookTitle.includes(searchQuery.toLowerCase()) ||
      memberName.includes(searchQuery.toLowerCase());

    const status = calculateStatus(record);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --- Show loading state if needed ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading borrow records...</p>
      </div>
    );
  }

  // --- Main render ---
  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by book or member name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Borrow records table */}
      <DataTable columns={columns} data={filteredRecords} />
    </div>
  );
}
