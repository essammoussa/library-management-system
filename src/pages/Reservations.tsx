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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Reservations = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { reservations, loading } = useAppSelector((state) => state.reservations);
  const { books } = useAppSelector((state) => state.books);
  const { members } = useAppSelector((state) => state.members);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    dispatch(fetchReservations());
  }, [dispatch]);

  const handleCreateReservation = async (data: {
    bookId: string;
    memberId: string;
  }) => {
    const book = books.find((b) => b.id === data.bookId);
    const member = members.find((m) => m.id === data.memberId);

    if (!book || !member) {
      toast({
        title: "Error",
        description: "Book or member not found",
        variant: "destructive",
      });
      return;
    }

    const reservationDate = new Date().toISOString().split("T")[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    try {
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
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reservation",
        variant: "destructive",
      });
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      await dispatch(cancelReservation(id)).unwrap();
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

  const filteredReservations =
    statusFilter === "all"
      ? reservations
      : reservations.filter((r) => r.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reservations</h1>
          <p className="text-muted-foreground">
            Manage book reservations and queue system
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>

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

      <div className="bg-card rounded-lg border">
        <ReservationList
          reservations={filteredReservations}
          onCancel={handleCancelReservation}
        />
      </div>

      <ReservationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateReservation}
      />
    </div>
  );
};

export default Reservations;
