import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

const borrowFormSchema = z.object({
  bookId: z.string().min(1, "Please select a book"),
  memberId: z.string().min(1, "Please select a member"),
  borrowDate: z.string(),
  dueDate: z.string(),
});

type BorrowFormValues = z.infer<typeof borrowFormSchema>;

interface BorrowFormProps {
  onSubmit: (data: Omit<BorrowRecord, "id" | "returnDate" | "fine">) => void;
  onCancel: () => void;
}

export function BorrowForm({ onSubmit, onCancel }: BorrowFormProps) {
  const dispatch = useAppDispatch();
  const { books } = useAppSelector((state) => state.books);
  const { members } = useAppSelector((state) => state.members);

  const today = new Date().toISOString().split("T")[0];
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const form = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowFormSchema),
    defaultValues: {
      bookId: "",
      memberId: "",
      borrowDate: today,
      dueDate: defaultDueDate,
    },
  });

  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchActiveMembers());
  }, [dispatch]);

  const availableBooks = books.filter((book) => book.availableQuantity > 0);
  const activeMembers = members.filter((member) => member.status === "active");

  const handleSubmit = (data: BorrowFormValues) => {
    const selectedBook = books.find((b) => b.id === data.bookId);
    const selectedMember = members.find((m) => m.id === data.memberId);

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

  const handleBorrowDateChange = (date: string) => {
    form.setValue("borrowDate", date);
    const dueDate = new Date(new Date(date).getTime() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    form.setValue("dueDate", dueDate);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                  max={today}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
