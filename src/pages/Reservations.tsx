import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchReservations,
  createReservation,
  cancelReservation,
} from "@/store/slices/reservationsSlice";
import { ReservationList } from "@/components/reservations/ReservationList";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { Button } from "@/components/ui/button";
import { Plus, Loader2} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Reservations = () => {
  const dispatch = useAppDispatch(); // Redux dispatch
  const { toast } = useToast(); // Toast notifications
  const { reservations, loading } = useAppSelector((state) => state.reservations); // Reservations state
  const { books } = useAppSelector((state) => state.books); // Books state
  const { members } = useAppSelector((state) => state.members); // Members state

  const [isFormOpen, setIsFormOpen] = useState(false); // Controls reservation form modal
  const [statusFilter, setStatusFilter] = useState<string>("all"); // Status filter for reservations

  // Fetch reservations on component mount
  useEffect(() => {
    dispatch(fetchReservations());
  }, [dispatch]);

  // Function to handle creating a new reservation
  const handleCreateReservation = async (data: { bookId: string; memberId: string }) => {
    const book = books.find((b) => b.id === data.bookId); // Find selected book
    const member = members.find((m) => m.id === data.memberId); // Find selected member

    if (!book || !member) {
      toast({
        title: "Error",
        description: "Book or member not found",
        variant: "destructive",
      });
      return;
    }

    // Set reservation and expiry dates
    const reservationDate = new Date().toISOString().split("T")[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days expiry

    try {
      // Dispatch createReservation action
      await dispatch(
        createReservation({
          bookId: data.bookId,
          bookTitle: book.title,
          memberId: data.memberId,
          memberName: member.name,
          reservationDate,
          expiryDate: expiryDate.toISOString().split("T")[0],
          status: "active",
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Reservation created successfully",
      });
      setIsFormOpen(false); // Close form after success
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reservation",
        variant: "destructive",
      });
    }
  };

  // Function to cancel a reservation
  const handleCancelReservation = async (id: string) => {
    try {
      await dispatch(cancelReservation(id)).unwrap(); // Dispatch cancel action
      toast({
        title: "Success",
        description: "Reservation cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel reservation",
        variant: "destructive",
      });
    }
  };

  // Filter reservations based on selected status
  const filteredReservations =
    statusFilter === "all"
      ? reservations
      : reservations.filter((r) => r.status === statusFilter);

  // Show loading state while fetching data
  if (loading) {
    return (
     <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reservations</h1>
          <p className="text-muted-foreground">
            Manage book reservations and queue system
          </p>
        </div>

        {/* Button to open reservation form */}
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-4 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
      <div className="bg-card rounded-lg border">
        <ReservationList
          reservations={filteredReservations} // Pass filtered list
          onCancel={handleCancelReservation} // Cancel handler
        />
      </div>

      {/* Reservation Form Modal */}
      <ReservationForm
        open={isFormOpen} // Control modal visibility
        onOpenChange={setIsFormOpen} // Handle open/close
        onSubmit={handleCreateReservation} // Submit handler
      />
    </div>
  );
};

export default Reservations;
