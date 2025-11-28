import { Book } from "@/data/books";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BookDetailsProps {
  book: Book;
}

const statusVariants = {
  available: "default",
  borrowed: "secondary",
  reserved: "outline",
} as const;

export const BookDetails = ({ book }: BookDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{book.title}</CardTitle>
            <CardDescription className="text-base">by {book.author}</CardDescription>
          </div>
          <Badge variant={statusVariants[book.status]}>
            {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <Separator />

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

        <div>
          <p className="text-sm text-muted-foreground">Available Copies</p>
          <p className="font-medium text-lg">
            {book.availableQuantity} of {book.quantity}
          </p>
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
