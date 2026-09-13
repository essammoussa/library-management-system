import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table"; // React Table types
import { Book } from "@/data/books";
import { DataTable } from "@/components/shared/DataTable"; // Custom data table component
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Pencil, Trash2, Eye , Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookDetails } from "./BookDetails";

// --------------------------
// Props for BookList component
// --------------------------
interface BookListProps {
  books: Book[]; // List of books to display
  categories: string[]; // Categories for filtering
  onEdit: (book: Book) => void; // Callback when editing a book
  onDelete: (id: string) => void; // Callback when deleting a book
  isLoading?: boolean; // Loading state
}

// --------------------------
// Map book status to badge styles
// --------------------------
const statusVariants = {
  available: "default",
  borrowed: "secondary",
  reserved: "outline",
} as const;

export const BookList = ({
  books,
  categories,
  onEdit,
  onDelete,
  isLoading,
}: BookListProps) => {
  // --------------------------
  // Local state
  // --------------------------
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [categoryFilter, setCategoryFilter] = useState<string>("all"); // Category dropdown
  const [statusFilter, setStatusFilter] = useState<string>("all"); // Status dropdown
  const [selectedBook, setSelectedBook] = useState<Book | null>(null); // Book to view in dialog

  // --------------------------
  // Table columns definition
  // --------------------------
  const columns: ColumnDef<Book>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    { accessorKey: "author", header: "Author" },
    { accessorKey: "isbn", header: "ISBN" },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Book["status"];
        return (
          <Badge variant={statusVariants[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "availableQuantity",
      header: "Available",
      cell: ({ row }) => {
        const available = row.getValue("availableQuantity") as number;
        const total = row.original.quantity;
        return (
          <span className={available === 0 ? "text-destructive" : ""}>
            {available}/{total}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const book = row.original;
        const isUnavailable = book.availableQuantity === 0; // Disable actions if no copies

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              {/* View book details */}
              <DropdownMenuItem onClick={() => setSelectedBook(book)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Edit and Delete */}
              <DropdownMenuItem onClick={() => onEdit(book)} disabled={isUnavailable}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(book.id)}
                className="text-destructive"
                disabled={isUnavailable}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // --------------------------
  // Filter books by search, category, and status
  // --------------------------
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);

    const matchesCategory =
      categoryFilter === "all" || book.category === categoryFilter;

    const matchesStatus = statusFilter === "all" || book.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <>
      {/* --------------------------
          Search and filters
      -------------------------- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="borrowed">Borrowed</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* --------------------------
            Data table or loading state
        -------------------------- */}
        {isLoading ? (
         <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading books...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredBooks} />
        )}
      </div>

      {/* --------------------------
          Book details modal
      -------------------------- */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Details</DialogTitle>
          </DialogHeader>
          {selectedBook && <BookDetails book={selectedBook} />}
        </DialogContent>
      </Dialog>
    </>
  );
};
