import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBooks } from "@/store/slices/booksSlice";
import { fetchMembers } from "@/store/slices/membersSlice";
import { Badge } from "@/components/ui/badge";

// Validation schema using Zod
const reservationSchema = z.object({
  bookId: z.string().min(1, "Please select a book"), // Book selection required
  memberId: z.string().min(1, "Please select a member"), // Member selection required
});

// Type inferred from schema for use with react-hook-form
type ReservationFormData = z.infer<typeof reservationSchema>;

// Props for the ReservationForm component
interface ReservationFormProps {
  open: boolean; // Dialog open/close state
  onOpenChange: (open: boolean) => void; // Callback to change open state
  onSubmit: (data: ReservationFormData) => void; // Callback when form is submitted
}

export function ReservationForm({
  open,
  onOpenChange,
  onSubmit,
}: ReservationFormProps) {
  const dispatch = useAppDispatch();

  // Get books and members from Redux store
  const { books } = useAppSelector((state) => state.books);
  const { members } = useAppSelector((state) => state.members);

  // Initialize react-hook-form with default values and zod validation
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      bookId: "",
      memberId: "",
    },
  });

  // Fetch books and members when the dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchBooks());
      dispatch(fetchMembers());
    }
  }, [open, dispatch]);

  // Handle form submission
  const handleSubmit = (data: ReservationFormData) => {
    onSubmit(data); // Pass form data to parent
    form.reset(); // Reset form after submission
  };

  // Find the selected book to check availability
  const selectedBook = books.find((b) => b.id === form.watch("bookId"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Reservation</DialogTitle>
          <DialogDescription>
            Reserve a book for a member. They will be notified when it becomes available.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Member selection */}
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members
                        .filter((m) => m.status === "active") // Only active members
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.membershipId}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage /> {/* Shows validation errors */}
                </FormItem>
              )}
            />

            {/* Book selection */}
            <FormField
              control={form.control}
              name="bookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a book" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          <div className="flex items-center gap-2">
                            <span>{book.title}</span>
                            {book.availableQuantity === 0 && (
                              <Badge variant="secondary" className="ml-2">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage /> {/* Validation errors */}
                </FormItem>
              )}
            />

            {/* Warning if selected book is unavailable */}
            {selectedBook && selectedBook.availableQuantity === 0 && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="text-muted-foreground">
                  This book is currently unavailable. The member will be added to the
                  reservation queue and notified when a copy becomes available.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4">
              {/* Cancel button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              {/* Submit button */}
              <Button type="submit">Create Reservation</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
