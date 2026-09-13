import React, { useEffect, useState } from 'react';
import { BorrowRecord } from '@/data/borrowing';
import { borrowApi } from '@/api/borrowApi';
import { useRole } from "@/store/RoleContext";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';

export default function UserFines() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useRole();

  const [overdueList, setOverdueList] = useState<BorrowRecord[]>([]);
  const [totalFines, setTotalFines] = useState(0);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const memberId = user?.id || 'patron-user';
        let borrows: BorrowRecord[] = [];
        try {
          borrows = await borrowApi.getByMember(memberId);
        } catch {
          const all = await borrowApi.getAll().catch(() => []);
          borrows = all.filter((b) => b.memberId === memberId);
        }

        const now = new Date();
        const overdue = borrows.filter((b) => b.status !== 'returned' && new Date(b.dueDate) < now);
        setOverdueList(overdue);

        const total = overdue.reduce((sum, b) => {
          const days = Math.max(1, Math.ceil((now.getTime() - new Date(b.dueDate).getTime()) / (1000 * 3600 * 24)));
          return sum + days * 0.5;
        }, 0);
        setTotalFines(total);
      } catch (err) {
        console.error("Failed to load user fines:", err);
      }
    };

    fetchFines();
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center font-sans-ui">
        <div className="bg-white p-12 rounded-2xl border border-border-archival shadow-lg space-y-4">
          <div className="w-16 h-16 bg-[#063b36]/10 text-archival-teal rounded-2xl flex items-center justify-center mx-auto border border-archival-teal/20">
            <span className="material-symbols-outlined text-[36px]">receipt_long</span>
          </div>
          <h2 className="font-serif-display text-3xl font-bold text-archival-teal">
            Patron Account Authentication Required
          </h2>
          <p className="font-serif-body text-sm text-ink-muted italic max-w-md mx-auto">
            Sign in with your institutional credentials to review folio circulation fees and clearance certificates.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-lg bg-archival-teal hover:bg-archival-deep text-white font-sans-ui text-xs font-semibold shadow-sm transition-all"
          >
            Authenticate Patron Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 md:px-12 py-10 max-w-7xl mx-auto space-y-8 font-sans-ui">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border-archival pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gilded-amber mb-1">
            <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
            Circulation Ledger &amp; Clearance
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-archival-teal">
            Patron Fines &amp; Replacement Ledger
          </h1>
          <p className="font-serif-body text-xs italic text-ink-muted mt-1">
            Institutional fee auditing according to the Athenaeum Preservation Charter.
          </p>
        </div>

        <div className="bg-white border border-border-archival p-5 rounded-2xl shadow-xs flex items-center gap-5 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center border border-[#bfdbfe]">
            <span className="material-symbols-outlined text-[24px]">receipt</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">
              Total Delinquency Balance
            </p>
            <p className={`font-serif-display text-3xl font-bold ${totalFines > 0 ? 'text-red-600' : 'text-[#059669]'}`}>
              ${totalFines.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {overdueList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-border-archival shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center mx-auto border border-[#a7f3d0]">
            <span className="material-symbols-outlined text-[28px]">verified</span>
          </div>
          <h3 className="font-serif-display text-xl font-bold text-[#065f46]">
            Exemplary Archival Standing
          </h3>
          <p className="font-serif-body text-xs text-ink-muted italic max-w-md mx-auto">
            You have zero late return assessments or unpaid preservation replacement balances. Full circulating desk borrowing privileges remain unencumbered.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-red-600">
            Outstanding Late Loan Exceptions ({overdueList.length})
          </div>
          {overdueList.map((item) => {
            const diff = Math.max(1, Math.ceil((new Date().getTime() - new Date(item.dueDate).getTime()) / (1000 * 3600 * 24)));
            const fine = (diff * 0.5).toFixed(2);

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-white border border-red-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[11px] font-bold">
                      {diff} Days Overdue
                    </span>
                    <span className="text-xs text-ink-muted font-mono">Due: {item.dueDate}</span>
                  </div>
                  <h4 className="font-serif-display text-base font-bold text-archival-teal mt-1">
                    {item.bookTitle}
                  </h4>
                  <p className="text-xs text-ink-muted font-sans-ui mt-0.5">
                    Accrual Rate: $0.50 per day overdue • Accrued Fee: <strong className="text-red-600">${fine}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toast({ title: "Receipt Clearance", description: "Payment processing modal initiated at desk terminal." })}
                  className="px-4 py-2 rounded-lg bg-gilded-amber hover:bg-[#92400e] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Clear &amp; Settle Fee (${fine})
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
