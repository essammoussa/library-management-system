import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BorrowRecord } from "@/data/borrowing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Validation schema using zod ---
const returnFormSchema = z.object({
  returnDate: z.string(), // return date is required
});

type ReturnFormValues = z.infer<typeof returnFormSchema>;

interface ReturnFormProps {
  borrowRecord: BorrowRecord; // The borrow record being returned
  bookTitle?: string;          // Optional book title
  memberName?: string;         // Optional member name
  onSubmit: (returnDate: string) => void; // Callback when form is submitted
  onCancel: () => void;                     // Callback for cancel button
}

export function ReturnForm({
  borrowRecord,
  bookTitle,
  memberName,
  onSubmit,
  onCancel,
}: ReturnFormProps) {
  // --- Default today date in YYYY-MM-DD format ---
  const today = new Date().toISOString().split("T")[0];

  // --- Initialize react-hook-form ---
  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      returnDate: today, // default return date is today
    },
  });

  // --- Calculate late fee based on return date ---
  const calculateLateFee = (returnDate: string): number => {
    const dueDate = new Date(borrowRecord.dueDate);
    const actualReturnDate = new Date(returnDate);
    const daysLate = Math.floor(
      (actualReturnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLate <= 0) return 0; // No fee if returned on time
    return daysLate * 0.5;       // $0.50 per day late
  };

  // --- Form submit handler ---
  const handleSubmit = (data: ReturnFormValues) => {
    onSubmit(data.returnDate); // Pass the selected return date to parent
  };

  // --- Calculate late fee dynamically based on form input ---
  const currentLateFee = calculateLateFee(form.watch("returnDate"));

  return (
    <div className="space-y-4">
      {/* --- Borrow details card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Borrow Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Book:</span>
            <span className="font-medium">{bookTitle || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member:</span>
            <span className="font-medium">{memberName || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Borrow Date:</span>
            <span className="font-medium">
              {new Date(borrowRecord.borrowDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Date:</span>
            <span className="font-medium">
              {new Date(borrowRecord.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={borrowRecord.status === "overdue" ? "destructive" : "default"}>
              {borrowRecord.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* --- Return form --- */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Return date input */}
          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    max={today}                        // Cannot return in future
                    min={borrowRecord.borrowDate}      // Cannot return before borrow
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Late fee card (only shown if applicable) */}
          {currentLateFee > 0 && (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Late Fee:</span>
                  <span className="text-lg font-bold text-destructive">
                    ${currentLateFee.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Calculated at $0.50 per day overdue
                </p>
              </CardContent>
            </Card>
          )}

          {/* Form buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Process Return</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
