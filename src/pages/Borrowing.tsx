import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBorrowRecords,
  createBorrowRecord,
  returnBook,
  clearError,
} from "@/store/slices/borrowSlice";
import { fetchBooks } from "@/store/slices/booksSlice";
import { fetchMembers } from "@/store/slices/membersSlice";
import { BorrowRecord } from "@/data/borrowing";
import { BorrowList } from "@/components/borrowing/BorrowList";
import { BorrowForm } from "@/components/borrowing/BorrowForm";
import { ReturnForm } from "@/components/borrowing/ReturnForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Borrowing = () => {
  const dispatch = useAppDispatch();

  // Accessing state slices for borrow records, books, and members
  const { records, loading, error } = useAppSelector((state) => state.borrow);
  const { books } = useAppSelector((state) => state.books);
  const { members } = useAppSelector((state) => state.members);

  // Local state to manage dialog visibility and selected record
  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState(false);
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);

  // Fetch borrow records, books, and members when component mounts
  useEffect(() => {
    dispatch(fetchBorrowRecords());
    dispatch(fetchBooks());
    dispatch(fetchMembers());
  }, [dispatch]);

  // Show toast for any error and clear it afterward
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Open borrow form dialog
  const handleAddBorrow = () => {
    setIsBorrowFormOpen(true);
  };

  // Open return form dialog for a selected borrow record
  const handleReturn = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setIsReturnFormOpen(true);
  };

  // Handle submitting the borrow form to create a new borrow record
  const handleBorrowFormSubmit = async (
    data: Omit<BorrowRecord, "id" | "returnDate">
  ) => {
    await dispatch(createBorrowRecord(data));
    toast({
      title: "Success",
      description: "Book borrowed successfully",
    });
    setIsBorrowFormOpen(false);
  };

  // Handle submitting the return form
  const handleReturnFormSubmit = async (returnDate: string) => {
    if (!selectedRecord) return;

    // Dispatch returnBook action
    await dispatch(
      returnBook({
        id: selectedRecord.id,
        returnDate,
      })
    );

    // Calculate late fee if returned after due date
    const dueDate = new Date(selectedRecord.dueDate);
    const actualReturnDate = new Date(returnDate);
    const daysLate = Math.floor(
      (actualReturnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const lateFee = daysLate > 0 ? daysLate * 0.5 : 0;

    toast({
      title: "Success",
      description: lateFee > 0
        ? `Book returned with a late fee of $${lateFee.toFixed(2)}`
        : "Book returned successfully",
    });

    // Close return form and reset selected record
    setIsReturnFormOpen(false);
    setSelectedRecord(null);
  };

  // Helper to get book title from bookId
  const getBookTitle = (bookId: string) => {
    return books.find((b) => b.id === bookId)?.title;
  };

  // Helper to get member name from memberId
  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name;
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Borrowing</h1>
          <p className="text-muted-foreground">Track book loans and returns</p>
        </div>
        {/* Button to open borrow form */}
        <Button onClick={handleAddBorrow}>
          <Plus className="mr-2 h-4 w-4" />
          New Borrow
        </Button>
      </div>

      {/* List of borrow records */}
      <BorrowList
        borrowRecords={records}
        books={books}
        members={members}
        onReturn={handleReturn}
        loading={loading}
      />

      {/* Borrow Book Dialog */}
      <Dialog open={isBorrowFormOpen} onOpenChange={setIsBorrowFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Borrow Book</DialogTitle>
          </DialogHeader>
          <BorrowForm
            onSubmit={handleBorrowFormSubmit}
            onCancel={() => setIsBorrowFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Return Book Dialog */}
      <Dialog open={isReturnFormOpen} onOpenChange={setIsReturnFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <ReturnForm
              borrowRecord={selectedRecord}
              bookTitle={getBookTitle(selectedRecord.bookId)}
              memberName={getMemberName(selectedRecord.memberId)}
              onSubmit={handleReturnFormSubmit}
              onCancel={() => {
                setIsReturnFormOpen(false);
                setSelectedRecord(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Borrowing;
