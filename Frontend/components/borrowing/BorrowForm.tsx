import { useEffect } from "react";
import { useForm } from "react-hook-form"; // For form handling
import { zodResolver } from "@hookform/resolvers/zod"; // Validation with Zod
import * as z from "zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBooks } from "@/store/slices/booksSlice";
import { fetchActiveMembers } from "@/store/slices/membersSlice";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { BorrowRecord } from "@/data/borrowing";

// --------------------------
// Form validation schema
// --------------------------
const borrowFormSchema = z.object({
  bookId: z.string().min(1, "Please select a book"), // Require selection
  memberId: z.string().min(1, "Please select a member"), // Require selection
  borrowDate: z.string(),
  dueDate: z.string(),
});

type BorrowFormValues = z.infer<typeof borrowFormSchema>;

interface BorrowFormProps {
  onSubmit: (data: Omit<BorrowRecord, "id" | "returnDate" | "fine">) => void; // Callback when form submits
  onCancel: () => void; // Callback when form is cancelled
}

export function BorrowForm({ onSubmit, onCancel }: BorrowFormProps) {
  const dispatch = useAppDispatch();
  const { books } = useAppSelector((state) => state.books); // All books from store
  const { members } = useAppSelector((state) => state.members); // All members from store

  // --------------------------
  // Default dates
  // --------------------------
  const today = new Date().toISOString().split("T")[0]; // Today's date in yyyy-mm-dd
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from today
    .toISOString()
    .split("T")[0];

  // --------------------------
  // Initialize React Hook Form
  // --------------------------
  const form = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowFormSchema), // Validate using Zod
    defaultValues: {
      bookId: "",
      memberId: "",
      borrowDate: today,
      dueDate: defaultDueDate,
    },
  });

  // --------------------------
  // Fetch books and members when component mounts
  // --------------------------
  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchActiveMembers());
  }, [dispatch]);

  // --------------------------
  // Filter available books and active members
  // --------------------------
  const availableBooks = books.filter((book) => book.availableQuantity > 0);
  const activeMembers = members.filter((member) => member.status === "active");

  // --------------------------
  // Form submission handler
  // --------------------------
  const handleSubmit = (data: BorrowFormValues) => {
    const selectedBook = books.find((b) => b.id === data.bookId);
    const selectedMember = members.find((m) => m.id === data.memberId);

    // Pass formatted data to parent component
    onSubmit({
      bookId: data.bookId,
      memberId: data.memberId,
      borrowDate: data.borrowDate,
      dueDate: data.dueDate,
      bookTitle: selectedBook?.title || "",
      memberName: selectedMember?.name || "",
      status: "active",
    });
  };

  // --------------------------
  // Automatically update due date when borrow date changes
  // --------------------------
  const handleBorrowDateChange = (date: string) => {
    form.setValue("borrowDate", date);
    const dueDate = new Date(new Date(date).getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days later
      .toISOString()
      .split("T")[0];
    form.setValue("dueDate", dueDate);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* --------------------------
            Member selection
        -------------------------- */}
        <FormField
          control={form.control}
          name="memberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover z-50">
                  {activeMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.membershipId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --------------------------
            Book selection
        -------------------------- */}
        <FormField
          control={form.control}
          name="bookId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Book</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a book" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover z-50">
                  {availableBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} - {book.author} ({book.availableQuantity} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              {availableBooks.length === 0 && (
                <p className="text-sm text-destructive mt-1">
                  No books available for borrowing
                </p>
              )}
            </FormItem>
          )}
        />

        {/* --------------------------
            Borrow Date
        -------------------------- */}
        <FormField
          control={form.control}
          name="borrowDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Borrow Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  onChange={(e) => handleBorrowDateChange(e.target.value)}
                  max={today} // Cannot pick future dates
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --------------------------
            Due Date (readonly, auto-calculated)
        -------------------------- */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} min={today} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --------------------------
            Buttons
        -------------------------- */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={availableBooks.length === 0}>
            Create Borrow Record
          </Button>
        </div>
      </form>
    </Form>
  );
}
