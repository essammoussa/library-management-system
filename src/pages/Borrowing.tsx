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
  const { records, loading, error } = useAppSelector((state) => state.borrow);
  const { books } = useAppSelector((state) => state.books);
  const { members } = useAppSelector((state) => state.members);

  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState(false);
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);

  useEffect(() => {
    dispatch(fetchBorrowRecords());
    dispatch(fetchBooks());
    dispatch(fetchMembers());
  }, [dispatch]);

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

  const handleAddBorrow = () => {
    setIsBorrowFormOpen(true);
  };

  const handleReturn = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setIsReturnFormOpen(true);
  };

  const handleBorrowFormSubmit = async (data: Omit<BorrowRecord, "id" | "returnDate">) => {
    await dispatch(createBorrowRecord(data));
    toast({
      title: "Success",
      description: "Book borrowed successfully",
    });
    setIsBorrowFormOpen(false);
  };

  const handleReturnFormSubmit = async (returnDate: string) => {
    if (!selectedRecord) return;

    await dispatch(
      returnBook({
        id: selectedRecord.id,
        returnDate,
      })
    );

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
    setIsReturnFormOpen(false);
    setSelectedRecord(null);
  };

  const getBookTitle = (bookId: string) => {
    return books.find((b) => b.id === bookId)?.title;
  };

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Borrowing</h1>
          <p className="text-muted-foreground">Track book loans and returns</p>
        </div>
        <Button onClick={handleAddBorrow}>
          <Plus className="mr-2 h-4 w-4" />
          New Borrow
        </Button>
      </div>

      <BorrowList
        borrowRecords={records}
        books={books}
        members={members}
        onReturn={handleReturn}
        loading={loading}
      />

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
