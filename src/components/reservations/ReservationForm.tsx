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

const reservationSchema = z.object({
  bookId: z.string().min(1, "Please select a book"),
  memberId: z.string().min(1, "Please select a member"),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReservationFormData) => void;
}

export function ReservationForm({
  open,
  onOpenChange,
  onSubmit,
}: ReservationFormProps) {
  const dispatch = useAppDispatch();
  const { books } = useAppSelector((state) => state.books);
  const { members } = useAppSelector((state) => state.members);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      bookId: "",
      memberId: "",
    },
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchBooks());
      dispatch(fetchMembers());
    }
  }, [open, dispatch]);

  const handleSubmit = (data: ReservationFormData) => {
    onSubmit(data);
    form.reset();
  };

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
                        .filter((m) => m.status === "active")
                        .map((member) => (
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedBook && selectedBook.availableQuantity === 0 && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="text-muted-foreground">
                  This book is currently unavailable. The member will be added to the
                  reservation queue and notified when a copy becomes available.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Reservation</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
