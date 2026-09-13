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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Member } from "@/data/members";

// Validation schema using Zod
const memberFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  membershipId: z.string().min(5, "Membership ID must be at least 5 characters"),
  joinDate: z.string(),
  status: z.enum(["active", "inactive", "suspended"]),
  address: z.string().min(5, "Address must be at least 5 characters"),
  borrowedBooks: z.coerce.number().min(0, "Borrowed books must be 0 or more"),
});

// TypeScript type inferred from the schema
type MemberFormValues = z.infer<typeof memberFormSchema>;

interface MemberFormProps {
  member?: Member; // If provided, form is in edit mode
  onSubmit: (data: Omit<Member, "id">) => void; // Callback for submitting form
  onCancel: () => void; // Callback for cancel button
}

export function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  // Initialize React Hook Form
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: member || {
      name: "",
      email: "",
      phone: "",
      membershipId: "",
      joinDate: new Date().toISOString().split("T")[0], // Today by default
      status: "active",
      address: "",
      borrowedBooks: 0,
    },
  });

  // Form submit handler
  const handleSubmit = (data: MemberFormValues) => {
    onSubmit(data as Omit<Member, "id">);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Name input */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter member name" {...field} />
              </FormControl>
              <FormMessage /> {/* Validation error messages */}
            </FormItem>
          )}
        />

        {/* Email input */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="member@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone input */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1-555-0101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Membership ID input */}
        <FormField
          control={form.control}
          name="membershipId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Membership ID</FormLabel>
              <FormControl>
                <Input placeholder="MEM-2024-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Join Date input */}
        <FormField
          control={form.control}
          name="joinDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Join Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status dropdown */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address textarea */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Borrowed Books input */}
        <FormField
          control={form.control}
          name="borrowedBooks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Borrowed Books</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{member ? "Update Member" : "Add Member"}</Button>
        </div>
      </form>
    </Form>
  );
}
