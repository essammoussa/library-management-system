import { useEffect } from "react";
import { useForm } from "react-hook-form"; // React Hook Form for managing form state
import { zodResolver } from "@hookform/resolvers/zod"; // Zod resolver for validation
import * as z from "zod"; // Zod for schema validation
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Custom form components
import { Input } from "@/components/ui/input"; // Input component
import { Button } from "@/components/ui/button"; // Button component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Custom Select components
import { Book } from "@/data/books"; // Book type

// --------------------------
// Validation schema using Zod
// --------------------------
const bookSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  author: z.string().trim().min(1, "Author is required").max(100, "Author name too long"),
  isbn: z.string().trim().min(10, "Invalid ISBN").max(17, "Invalid ISBN"),
  category: z.string().min(1, "Category is required"),
  publishYear: z.coerce.number().min(1000).max(new Date().getFullYear() + 1), // Convert string to number
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  availableQuantity: z.coerce.number().min(0, "Available quantity cannot be negative"),
  status: z.enum(["available", "borrowed", "reserved"]), // Only these values allowed
});

type BookFormValues = z.infer<typeof bookSchema>; // Infer TS type from Zod schema

// --------------------------
// Props for BookForm component
// --------------------------
interface BookFormProps {
  book?: Book; // Optional: if editing an existing book
  categories: string[]; // List of available categories for the dropdown
  onSubmit: (data: Omit<Book, "id"> | Book) => void; // Callback when form is submitted
  onCancel: () => void; // Callback for cancel button
  isLoading?: boolean; // Loading state for async operations
}

export const BookForm = ({
  book,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}: BookFormProps) => {
  // --------------------------
  // Initialize the form
  // --------------------------
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema), // Use Zod for validation
    defaultValues: book || {
      title: "",
      author: "",
      isbn: "",
      category: "",
      publishYear: new Date().getFullYear(),
      quantity: 1,
      availableQuantity: 1,
      status: "available",
    },
  });

  // --------------------------
  // Reset form values when editing an existing book
  // --------------------------
  useEffect(() => {
    if (book) {
      form.reset(book);
    }
  }, [book, form]);

  // --------------------------
  // Handle form submission
  // --------------------------
  const handleSubmit = (data: BookFormValues) => {
    if (book) {
      // If editing, include book id
      onSubmit({ ...data, id: book.id } as Book);
    } else {
      // If adding new book, no id yet
      onSubmit(data as Omit<Book, "id">);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* --------------------------
            Title field
        -------------------------- */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter book title" {...field} />
              </FormControl>
              <FormMessage /> {/* Displays validation errors */}
            </FormItem>
          )}
        />

        {/* --------------------------
            Author field
        -------------------------- */}
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input placeholder="Enter author name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --------------------------
            ISBN field
        -------------------------- */}
        <FormField
          control={form.control}
          name="isbn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISBN</FormLabel>
              <FormControl>
                <Input placeholder="Enter ISBN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --------------------------
            Category dropdown
        -------------------------- */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --------------------------
            Publish Year and Total Quantity
        -------------------------- */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="publishYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publish Year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Quantity</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --------------------------
            Available Quantity and Status
        -------------------------- */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="availableQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Quantity</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="borrowed">Borrowed</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --------------------------
            Action Buttons
        -------------------------- */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : book ? "Update Book" : "Add Book"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
