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
  reservations: Reservation[];
  onCancel: (id: string) => void;
}

export function ReservationList({
  reservations,
  onCancel,
}: ReservationListProps) {
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const getStatusBadge = (status: Reservation["status"]) => {
    const variants: Record<Reservation["status"], "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      fulfilled: "secondary",
      expired: "destructive",
      cancelled: "outline",
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "bookTitle",
      header: "Book",
    },
    {
      accessorKey: "memberName",
      header: "Member",
    },
    {
      accessorKey: "reservationDate",
      header: "Reserved On",
      cell: ({ row }) => format(new Date(row.original.reservationDate), "MMM dd, yyyy"),
    },
    {
      accessorKey: "expiryDate",
      header: "Expires On",
      cell: ({ row }) => format(new Date(row.original.expiryDate), "MMM dd, yyyy"),
    },
    {
      accessorKey: "priority",
      header: "Queue Position",
      cell: ({ row }) => (
        <Badge variant="outline">#{row.original.priority}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedReservation(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
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
      <DataTable
        columns={columns}
        data={reservations}
        searchKey="bookTitle"
      />

      <Dialog
        open={!!selectedReservation}
        onOpenChange={() => setSelectedReservation(null)}
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
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Book</h3>
                <p className="text-foreground">{selectedReservation.bookTitle}</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Member</h3>
                <p className="text-foreground">{selectedReservation.memberName}</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Queue Position
                </h3>
                <Badge variant="outline">#{selectedReservation.priority}</Badge>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Reservation Date
                </h3>
                <p className="text-foreground">
                  {format(new Date(selectedReservation.reservationDate), "MMMM dd, yyyy")}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Expiry Date
                </h3>
                <p className="text-foreground">
                  {format(new Date(selectedReservation.expiryDate), "MMMM dd, yyyy")}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                {getStatusBadge(selectedReservation.status)}
              </div>

              {selectedReservation.status === "active" && (
                <div className="pt-4 flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onCancel(selectedReservation.id);
                      setSelectedReservation(null);
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
