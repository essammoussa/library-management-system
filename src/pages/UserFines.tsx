import React, { useEffect, useState } from 'react';
import { BorrowedBook } from '@/types/book';
import { FineCalculator } from '@/lib/fineCalculator';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useRole } from "@/store/RoleContext";
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';

export default function MyFines() {
  const navigate = useNavigate();
  const { isAuthenticated } = useRole();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [totalFines, setTotalFines] = useState(0);

  useEffect(() => {
    const borrowed: BorrowedBook[] = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
    setBorrowedBooks(borrowed);

    const fines = borrowed.reduce((acc, b) => {
      const { fineAmount } = FineCalculator.calculateFine(b.dueDate);
      return acc + fineAmount;
    }, 0);

    setTotalFines(fines);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="bg-card/40 backdrop-blur-md p-12 rounded-3xl border border-dashed border-border/60 max-w-lg w-full">
          <CreditCard className="w-16 h-16 text-primary/50 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Manage Your Account</h2>
          <p className="text-muted-foreground mb-8">Register now to manage your account details and view any outstanding balances.</p>
          <Button size="lg" className="w-full font-bold uppercase tracking-widest" onClick={() => navigate('/login?mode=register')}>
            Register Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Fines & Penalties</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage your outstanding balances</p>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex items-center gap-6">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Total Outstanding</p>
            <p className="text-3xl font-black text-primary">{FineCalculator.formatCurrency(totalFines)}</p>
          </div>
        </div>
      </div>

      {borrowedBooks.length === 0 ? (
        <div className="bg-card/40 backdrop-blur-md p-12 rounded-3xl border border-dashed border-border/60 text-center">
          <p className="text-muted-foreground font-medium">No active loans found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrowedBooks.map((book) => {
            const { daysOverdue, fineAmount } = FineCalculator.calculateFine(book.dueDate);

            return daysOverdue > 0 ? (
              <div key={book.bookId} className="bg-card/80 backdrop-blur-sm border border-red-500/10 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                    <AlertCircle className="size-5" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                    Overdue
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-1">{book.bookTitle}</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">Overdue Days</span>
                    <span className="font-bold text-red-600">{daysOverdue}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2">
                    <span className="text-muted-foreground font-medium">Calculated Fine</span>
                    <span className="font-bold text-xl">{FineCalculator.formatCurrency(fineAmount)}</span>
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
