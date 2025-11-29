import { Book } from "@/data/books"; // Import the Book type for type safety
import { Badge } from "@/components/ui/badge"; // Import UI Badge component
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Import Card components for layout
import { Separator } from "@/components/ui/separator"; // Import a line separator for sections

interface BookDetailsProps {
  book: Book; // Props: expects a single book object
}

// Mapping book status to different UI badge styles
const statusVariants = {
  available: "default",
  borrowed: "secondary",
  reserved: "outline",
} as const;

export const BookDetails = ({ book }: BookDetailsProps) => {
  return (
    <Card>
      {/* Card header with title, author, and status badge */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {/* Book title */}
            <CardTitle className="text-2xl">{book.title}</CardTitle>
            {/* Book author */}
            <CardDescription className="text-base">by {book.author}</CardDescription>
          </div>

          {/* Status badge */}
          <Badge variant={statusVariants[book.status]}>
            {/* Capitalize first letter of status */}
            {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      {/* Card content: other book details */}
      <CardContent className="space-y-4">
        {/* First row: ISBN and Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">ISBN</p>
            <p className="font-medium">{book.isbn}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-medium">{book.category}</p>
          </div>
        </div>

        <Separator /> {/* Divider line */}

        {/* Second row: Publish Year and Total Copies */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Publish Year</p>
            <p className="font-medium">{book.publishYear}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Copies</p>
            <p className="font-medium">{book.quantity}</p>
          </div>
        </div>

        {/* Available copies */}
        <div>
          <p className="text-sm text-muted-foreground">Available Copies</p>
          <p className="font-medium text-lg">
            {book.availableQuantity} of {book.quantity}
          </p>

          {/* Show warning if no copies are available */}
          {book.availableQuantity === 0 && (
            <p className="text-sm text-destructive mt-1">
              No copies currently available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
