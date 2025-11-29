import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import { Reservation } from "@/data/reservations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, X } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReservationListProps {
  reservations: Reservation[]; // Array of reservations to display
  onCancel: (id: string) => void; // Callback to cancel a reservation
}

export function ReservationList({
  reservations,
  onCancel,
}: ReservationListProps) {
  // State to track the reservation currently being viewed in the dialog
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  // Function to return a Badge component based on reservation status
  const getStatusBadge = (status: Reservation["status"]) => {
    const variants: Record<Reservation["status"], "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      fulfilled: "secondary",
      expired: "destructive",
      cancelled: "outline",
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)} {/* Capitalize first letter */}
      </Badge>
    );
  };

  // Define table columns for DataTable
  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "bookTitle", // Column shows book title
      header: "Book",
    },
    {
      accessorKey: "memberName", // Column shows member name
      header: "Member",
    },
    {
      accessorKey: "reservationDate", // Column shows reservation date
      header: "Reserved On",
      cell: ({ row }) => format(new Date(row.original.reservationDate), "MMM dd, yyyy"), // Format date
    },
    {
      accessorKey: "expiryDate", // Column shows expiry date
      header: "Expires On",
      cell: ({ row }) => format(new Date(row.original.expiryDate), "MMM dd, yyyy"), // Format date
    },
    {
      accessorKey: "priority", // Column shows queue position
      header: "Queue Position",
      cell: ({ row }) => (
        <Badge variant="outline">#{row.original.priority}</Badge>
      ),
    },
    {
      accessorKey: "status", // Column shows status as badge
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions", // Action buttons column
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {/* View button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedReservation(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {/* Cancel button only for active reservations */}
          {row.original.status === "active" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(row.original.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* DataTable for listing reservations */}
      <DataTable
        columns={columns}
        data={reservations}
        searchKey="bookTitle" // Enable search by book title
      />

      {/* Dialog for viewing reservation details */}
      <Dialog
        open={!!selectedReservation} // Open if a reservation is selected
        onOpenChange={() => setSelectedReservation(null)} // Close dialog
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>
              View detailed information about this reservation
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              {/* Book title */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Book</h3>
                <p className="text-foreground">{selectedReservation.bookTitle}</p>
              </div>

              {/* Member name */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Member</h3>
                <p className="text-foreground">{selectedReservation.memberName}</p>
              </div>

              {/* Queue position */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Queue Position
                </h3>
                <Badge variant="outline">#{selectedReservation.priority}</Badge>
              </div>

              {/* Reservation date */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Reservation Date
                </h3>
                <p className="text-foreground">
                  {format(new Date(selectedReservation.reservationDate), "MMMM dd, yyyy")}
                </p>
              </div>

              {/* Expiry date */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Expiry Date
                </h3>
                <p className="text-foreground">
                  {format(new Date(selectedReservation.expiryDate), "MMMM dd, yyyy")}
                </p>
              </div>

              {/* Status badge */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                {getStatusBadge(selectedReservation.status)}
              </div>

              {/* Cancel reservation button if active */}
              {selectedReservation.status === "active" && (
                <div className="pt-4 flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onCancel(selectedReservation.id);
                      setSelectedReservation(null); // Close dialog after cancelling
                    }}
                  >
                    Cancel Reservation
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
