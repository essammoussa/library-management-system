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
import { FineCalculator } from "@/lib/fineCalculator";
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
    const fineStats = FineCalculator.calculateFine(selectedRecord.dueDate);
    const lateFee = fineStats.fineAmount;

    toast({
      title: "Success",
      description: lateFee > 0
        ? `Book returned with a late fee of ${FineCalculator.formatCurrency(lateFee)}`
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
    <div className="space-y-6 font-sans-ui text-ink-primary">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-archival pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-archival-teal">
              Circulation Control
            </span>
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-archival-teal tracking-tight">
            Circulation Loans &amp; Returns
          </h1>
          <p className="font-serif-body text-xs italic text-ink-muted mt-0.5">
            Monitor active monograph loans, inspect due dates, and process desk check-ins.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddBorrow}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-archival-teal hover:bg-archival-deep text-white text-xs font-semibold shadow-xs transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">post_add</span>
          <span>Issue New Loan</span>
        </button>
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
