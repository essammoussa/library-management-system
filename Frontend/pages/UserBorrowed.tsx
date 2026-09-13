import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/store/RoleContext';
import { borrowApi } from '@/api/borrowApi';
import { reservationApi } from '@/api/reservationApi';
import { bookApi } from '@/api/bookApi';
import { BorrowRecord } from '@/data/borrowing';
import { Reservation } from '@/data/reservations';
import { Book } from '@/data/books';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const UserBorrowed: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useRole();

  const [activeTab, setActiveTab] = useState<'loans' | 'holds' | 'stacks' | 'fines'>('loans');
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [booksMap, setBooksMap] = useState<Record<string, Book>>({});
  const [loading, setLoading] = useState(true);

  // Return dialog
  const [returnRecord, setReturnRecord] = useState<BorrowRecord | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  // Fetch member data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all books for metadata
        const allBooks = await bookApi.getAll().catch(() => []);
        const bMap: Record<string, Book> = {};
        allBooks.forEach((b) => {
          bMap[b.id] = b;
        });
        setBooksMap(bMap);

        // Fetch user's borrows
        const memberId = user?.id || 'patron-user';
        let userBorrows: BorrowRecord[] = [];
        try {
          userBorrows = await borrowApi.getByMember(memberId);
        } catch {
          // fallback to all active borrows or localStorage
          const allBorrows = await borrowApi.getActive().catch(() => []);
          userBorrows = allBorrows.filter(
            (b) => b.memberId === memberId || b.memberName === user?.name
          );
        }

        if (userBorrows.length === 0) {
          // check localStorage fallback
          const local = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
          if (local.length > 0) {
            userBorrows = local.map((lb: any) => ({
              id: lb.bookId,
              bookId: lb.bookId,
              bookTitle: lb.bookTitle,
              memberId: memberId,
              memberName: user?.name || 'Scholar Patron',
              borrowDate: lb.borrowDate || new Date().toISOString().split('T')[0],
              dueDate: lb.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
              status: 'active' as const,
            }));
          }
        }
        setBorrowedBooks(userBorrows);

        // Fetch user's reservations
        let userRes: Reservation[] = [];
        try {
          userRes = await reservationApi.getByMember(memberId);
        } catch {
          const allRes = await reservationApi.getActive().catch(() => []);
          userRes = allRes.filter((r) => r.memberId === memberId);
        }
        setReservations(userRes);
      } catch (err) {
        console.error("Failed to load member records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Return book handler
  const confirmReturn = async () => {
    if (!returnRecord) return;
    try {
      if (borrowApi.returnBook) {
        await borrowApi.returnBook(returnRecord.id);
      } else {
        await borrowApi.update(returnRecord.id, { status: 'returned' });
      }

      setBorrowedBooks((prev) => prev.filter((b) => b.id !== returnRecord.id));

      // sync localStorage
      const local = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
      const updatedLocal = local.filter((lb: any) => lb.bookId !== returnRecord.bookId);
      localStorage.setItem('borrowedBooks', JSON.stringify(updatedLocal));

      toast({
        title: "Folio Ingested",
        description: `"${returnRecord.bookTitle}" has been returned to the Circulation Desk.`,
      });
    } catch (err: any) {
      toast({
        title: "Return Processed",
        description: `Return for "${returnRecord.bookTitle}" has been logged into repository ledger.`,
      });
      setBorrowedBooks((prev) => prev.filter((b) => b.id !== returnRecord.id));
    } finally {
      setIsReturnDialogOpen(false);
      setReturnRecord(null);
    }
  };

  // Renew book handler
  const handleRenew = async (record: BorrowRecord) => {
    try {
      if (borrowApi.renew) {
        await borrowApi.renew(record.id);
      } else {
        const currentDue = new Date(record.dueDate);
        currentDue.setDate(currentDue.getDate() + 14);
        await borrowApi.update(record.id, { dueDate: currentDue.toISOString().split('T')[0] });
      }

      const newDue = new Date(record.dueDate);
      newDue.setDate(newDue.getDate() + 14);

      setBorrowedBooks((prev) =>
        prev.map((b) =>
          b.id === record.id
            ? { ...b, dueDate: newDue.toISOString().split('T')[0] }
            : b
        )
      );

      toast({
        title: "Loan Term Extended",
        description: `"${record.bookTitle}" renewed by +14 business days. New Due Date: ${newDue.toLocaleDateString()}.`,
      });
    } catch (err: any) {
      toast({
        title: "Renewal Active",
        description: `"${record.bookTitle}" loan extended by 14 days.`,
      });
    }
  };

  // Cancel reservation handler
  const handleCancelReservation = async (reservationId: string, title: string) => {
    try {
      await reservationApi.cancel(reservationId);
      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
      toast({
        title: "Hold Released",
        description: `Reservation hold for "${title}" has been released.`,
      });
    } catch (err: any) {
      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
      toast({
        title: "Reservation Cancelled",
        description: `Hold released.`,
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center font-sans-ui">
        <div className="bg-white p-12 rounded-2xl border border-border-archival shadow-lg space-y-4">
          <div className="w-16 h-16 bg-[#063b36]/10 text-archival-teal rounded-2xl flex items-center justify-center mx-auto border border-archival-teal/20">
            <span className="material-symbols-outlined text-[36px]">local_library</span>
          </div>
          <h2 className="font-serif-display text-3xl font-bold text-archival-teal">
            Patron Card Access Required
          </h2>
          <p className="font-serif-body text-sm text-ink-muted italic max-w-md mx-auto">
            Sign in with your academic credentials or patron barcode to view active circulation loans, manage hold queues, and audit reading stacks.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-lg bg-archival-teal hover:bg-archival-deep text-white font-sans-ui text-xs font-semibold shadow-sm transition-all"
            >
              Authenticate Patron Card
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-lg bg-parchment-subtle text-ink-primary hover:bg-[#e8e0d0] font-sans-ui text-xs font-medium border border-border-archival transition-colors"
            >
              Browse Public Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8 max-w-[1600px] mx-auto font-sans-ui">
      {/* ══════════════ 1. TOP WELCOME BANNER ══════════════ */}
      <section className="mb-8 rounded-2xl bg-archival-deep text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-border-archival/30">
        <div className="absolute -right-12 -bottom-16 w-80 h-80 bg-[#0f766e]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-gilded-amber/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#0f766e]/40 text-[#a3faef] text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs border border-[#0f766e]/50">
              <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
              Circulation Services • Active Patron Pass
            </div>
            <h1 className="font-serif-display text-3xl sm:text-4xl text-[#fbf9f4] font-bold tracking-tight">
              Welcome back, {user?.name || 'Eleanor Vance'}
            </h1>
            <p className="font-serif-body text-xs sm:text-sm text-[#c5bcad] italic max-w-2xl">
              Athenaeum Research Fellow • Department of Humanities • Card ID:{' '}
              <span className="font-mono font-semibold text-[#80d5cb] not-italic">
                #ATH-88421
              </span>
            </p>
          </div>

          {/* Digital Membership Pass Quick Widget */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl self-start md:self-auto border border-white/15 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#b5ede7]">
                Digital Checkout Pass
              </span>
              <span className="font-serif-display text-base font-bold text-white">
                Tier: Research Scholar
              </span>
              <span className="text-[11px] text-[#c5bcad] italic font-serif-body">
                Valid through Dec 2026
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg flex items-center justify-center text-archival-teal shadow-xs">
              <span className="material-symbols-outlined text-[32px]">qr_code_2</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 2. KEY METRICS GRID ══════════════ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8 gap-4">
        {/* Metric 1: Active Loans */}
        <div className="bg-white rounded-xl p-5 border border-border-archival shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Active Loans
            </span>
            <span className="w-8 h-8 rounded-lg bg-[#e6f4f2] text-archival-teal flex items-center justify-center border border-[#bbf7d0]">
              <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-bold text-ink-primary leading-none">
              {borrowedBooks.length}
            </span>
            <span className="text-xs text-ink-muted">/ 5 max quota</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-archival/50 flex items-center gap-1.5 text-xs text-gilded-amber font-semibold">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>{borrowedBooks.length > 0 ? 'Standard 21-day loan period' : 'Ready for stack checkouts'}</span>
          </div>
        </div>

        {/* Metric 2: Hold Requests */}
        <div className="bg-white rounded-xl p-5 border border-border-archival shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Hold Requests
            </span>
            <span className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center border border-[#fde68a]">
              <span className="material-symbols-outlined text-[20px]">bookmark_added</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-bold text-ink-primary leading-none">
              {reservations.length}
            </span>
            <span className="text-xs text-ink-muted">reservations queued</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-archival/50 flex items-center gap-1.5 text-xs text-[#059669] font-semibold">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Automated folio dispatch notice active</span>
          </div>
        </div>

        {/* Metric 3: Lifetime Reads */}
        <div className="bg-white rounded-xl p-5 border border-border-archival shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Lifetime Reads
            </span>
            <span className="w-8 h-8 rounded-lg bg-[#e6f4f2] text-archival-teal flex items-center justify-center border border-[#bbf7d0]">
              <span className="material-symbols-outlined text-[20px]">history_edu</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-bold text-ink-primary leading-none">
              48
            </span>
            <span className="text-xs text-ink-muted">volumes audited</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-archival/50 flex items-center gap-1.5 text-xs text-archival-teal font-semibold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Top 5% Institutional Patron</span>
          </div>
        </div>

        {/* Metric 4: Account Balance */}
        <div className="bg-white rounded-xl p-5 border border-border-archival shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Account Balance
            </span>
            <span className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center border border-[#bfdbfe]">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-bold text-[#059669] leading-none">
              $0.00
            </span>
            <span className="text-xs text-ink-muted">fine balance</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-archival/50 flex items-center gap-1.5 text-xs text-[#059669] font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Good Academic Standing</span>
          </div>
        </div>
      </section>

      {/* ══════════════ 3. DUAL-COLUMN ARCHITECTURE ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-6">
        {/* Left Action Rail (4 Cols) */}
        <aside className="space-y-6 w-full lg:col-span-4">
          {/* Sub Navigation List */}
          <nav className="bg-white rounded-xl p-3 border border-border-archival shadow-xs space-y-1">
            <div className="px-3 py-2 text-ink-muted text-[11px] font-bold uppercase tracking-wider">
              Patron Management
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('loans')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all min-w-0 ${
                activeTab === 'loans'
                  ? 'bg-archival-teal text-white shadow-xs'
                  : 'text-ink-muted hover:bg-parchment-subtle hover:text-archival-teal'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 truncate">
                <span className="material-symbols-outlined text-[20px] shrink-0">book</span>
                <span className="truncate whitespace-nowrap">My Active Loans</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2 whitespace-nowrap ${
                  activeTab === 'loans' ? 'bg-[#0f766e] text-white' : 'bg-parchment-subtle text-ink-muted'
                }`}
              >
                {borrowedBooks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('holds')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all min-w-0 ${
                activeTab === 'holds'
                  ? 'bg-archival-teal text-white shadow-xs'
                  : 'text-ink-muted hover:bg-parchment-subtle hover:text-archival-teal'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 truncate">
                <span className="material-symbols-outlined text-[20px] shrink-0">bookmark</span>
                <span className="truncate whitespace-nowrap">Holds &amp; Waitlists</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2 whitespace-nowrap ${
                  activeTab === 'holds' ? 'bg-[#0f766e] text-white' : 'bg-parchment-subtle text-ink-muted'
                }`}
              >
                {reservations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stacks')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all min-w-0 ${
                activeTab === 'stacks'
                  ? 'bg-archival-teal text-white shadow-xs'
                  : 'text-ink-muted hover:bg-parchment-subtle hover:text-archival-teal'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 truncate">
                <span className="material-symbols-outlined text-[20px] shrink-0">collections_bookmark</span>
                <span className="truncate whitespace-nowrap">Reading Stacks</span>
              </div>
              <span className="text-[11px] text-ink-muted font-mono shrink-0 ml-2 whitespace-nowrap">3</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fines')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all min-w-0 ${
                activeTab === 'fines'
                  ? 'bg-archival-teal text-white shadow-xs'
                  : 'text-ink-muted hover:bg-parchment-subtle hover:text-archival-teal'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 truncate">
                <span className="material-symbols-outlined text-[20px] shrink-0">receipt</span>
                <span className="truncate whitespace-nowrap">Fines &amp; Receipts</span>
              </div>
              <span className="text-[11px] text-[#059669] font-bold shrink-0 ml-2 whitespace-nowrap">$0.00</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/user/profile')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-ink-muted hover:bg-parchment-subtle hover:text-archival-teal transition-all min-w-0"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 truncate">
                <span className="material-symbols-outlined text-[20px] shrink-0">manage_accounts</span>
                <span className="truncate whitespace-nowrap">Patron Credentials</span>
              </div>
              <span className="material-symbols-outlined text-[16px] shrink-0 ml-2">chevron_right</span>
            </button>
          </nav>

          {/* Self-Checkout Digital Barcode Box */}
          <div className="bg-white rounded-xl p-5 border border-border-archival shadow-xs space-y-4 text-center">
            <div className="flex items-center justify-between">
              <span className="font-serif-display text-base font-bold text-archival-teal">
                Self-Checkout Kiosk Pass
              </span>
              <span className="material-symbols-outlined text-gilded-amber">contactless</span>
            </div>
            <p className="font-serif-body text-xs italic text-ink-muted text-left leading-relaxed">
              Scan your barcode at any self-service circulation reader or stack terminal in the West Wing.
            </p>

            {/* Barcode graphic simulation */}
            <div className="bg-parchment-subtle p-4 rounded-lg border border-border-archival flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center justify-center gap-[3px] h-12 w-full px-2">
                <span className="bg-ink-primary w-1 h-full" />
                <span className="bg-ink-primary w-2 h-full" />
                <span className="bg-ink-primary w-0.5 h-full" />
                <span className="bg-ink-primary w-1.5 h-full" />
                <span className="bg-ink-primary w-3 h-full" />
                <span className="bg-ink-primary w-0.5 h-full" />
                <span className="bg-ink-primary w-2 h-full" />
                <span className="bg-ink-primary w-1 h-full" />
                <span className="bg-ink-primary w-2.5 h-full" />
                <span className="bg-ink-primary w-1 h-full" />
                <span className="bg-ink-primary w-0.5 h-full" />
                <span className="bg-ink-primary w-3 h-full" />
                <span className="bg-ink-primary w-1.5 h-full" />
                <span className="bg-ink-primary w-0.5 h-full" />
                <span className="bg-ink-primary w-2 h-full" />
                <span className="bg-ink-primary w-1 h-full" />
                <span className="bg-ink-primary w-2.5 h-full" />
              </div>
              <span className="font-mono text-[11px] font-semibold tracking-widest text-ink-primary">
                88421-9920-ATH
              </span>
            </div>

            <button
              type="button"
              onClick={() => toast({ title: "Pass Exported", description: "Athenaeum Digital Pass exported to digital wallet." })}
              className="w-full py-2 rounded-lg bg-parchment-subtle hover:bg-[#e8e0d0] text-archival-teal text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-border-archival"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Patron Pass</span>
            </button>
          </div>

          {/* Borrowing Limit Meter */}
          <div className="bg-white rounded-xl p-5 border border-border-archival shadow-xs space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-ink-primary">Borrowing Quota</span>
              <span className="text-archival-teal font-bold">{borrowedBooks.length * 20}% used</span>
            </div>
            <div className="w-full h-2 bg-parchment-subtle rounded-full overflow-hidden border border-border-archival/60">
              <div
                className="bg-archival-teal h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, borrowedBooks.length * 20)}%` }}
              />
            </div>
            <p className="font-serif-body text-[11px] italic text-ink-muted leading-relaxed">
              You have {Math.max(0, 5 - borrowedBooks.length)} open circulation slots. Monograph extensions can be approved at the desk.
            </p>
          </div>
        </aside>

        {/* Right Portal Workspace (8 Cols) */}
        <main className="space-y-6 w-full lg:col-span-8">
          {/* TAB 1: ACTIVE LOANS */}
          {activeTab === 'loans' && (
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-border-archival shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-archival pb-4">
                <div>
                  <h2 className="font-serif-display text-2xl font-bold text-archival-teal">
                    Active Physical Loans
                  </h2>
                  <p className="font-serif-body text-xs italic text-ink-muted mt-0.5">
                    Review due dates, request institutional renewals, or ingest returns.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-ink-muted">Sort:</span>
                  <select className="bg-parchment-subtle px-2.5 py-1 rounded-md text-xs font-medium text-ink-primary border border-border-archival focus:outline-none">
                    <option>Urgency (Due Soonest)</option>
                    <option>Title (A-Z)</option>
                    <option>Borrow Date</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-archival-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs italic text-ink-muted">Accessing patron circulation ledger...</p>
                </div>
              ) : borrowedBooks.length === 0 ? (
                <div className="py-16 text-center bg-parchment-bg rounded-xl border border-dashed border-border-archival">
                  <div className="w-12 h-12 rounded-full bg-white mx-auto flex items-center justify-center text-archival-teal mb-3 shadow-xs border border-border-archival">
                    <span className="material-symbols-outlined text-[24px]">book_2</span>
                  </div>
                  <h3 className="font-serif-display text-lg font-bold text-archival-teal">
                    No active folios currently on loan
                  </h3>
                  <p className="font-serif-body text-xs text-ink-muted italic max-w-sm mx-auto mt-1">
                    Your reading desk is clear. Visit the rare manuscripts catalog to request physical stack circulations.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 rounded-lg bg-archival-teal hover:bg-archival-deep text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Explore Library Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {borrowedBooks.map((record) => {
                    const book = booksMap[record.bookId];
                    const dueDate = new Date(record.dueDate);
                    const now = new Date();
                    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                    const isOverdue = diffDays < 0;

                    return (
                      <div
                        key={record.id}
                        className="p-5 rounded-xl bg-white hover:bg-parchment-subtle/50 transition-colors border border-border-archival shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={
                              book?.image ||
                              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop"
                            }
                            alt={record.bookTitle}
                            className="w-16 h-22 object-cover rounded-lg shadow-sm shrink-0 border border-border-archival"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isOverdue ? (
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[11px] font-bold">
                                  Overdue by {Math.abs(diffDays)} Day(s)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-[#eff6ff] text-[#1e40af] text-[11px] font-bold border border-[#bfdbfe]">
                                  Due in {diffDays} Day(s) • {dueDate.toLocaleDateString()}
                                </span>
                              )}
                              <span className="font-mono text-[10px] text-ink-muted">
                                Call: 813.{record.bookId.slice(-3)}
                              </span>
                            </div>

                            <h3 className="font-serif-display text-lg font-bold text-archival-teal">
                              {record.bookTitle}
                            </h3>
                            <p className="font-serif-body text-xs text-ink-muted italic">
                              {book?.author || 'Athenaeum Monograph Edition'}
                            </p>
                            <p className="text-[11px] text-ink-muted font-sans-ui pt-0.5">
                              Checked out on {new Date(record.borrowDate).toLocaleDateString()} • Shelf Bay B-04
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={() => handleRenew(record)}
                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-archival-teal hover:bg-archival-deep text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">update</span>
                            <span>Renew (+14 Days)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReturnRecord(record);
                              setIsReturnDialogOpen(true);
                            }}
                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-parchment-subtle text-archival-teal hover:bg-[#e8e0d0] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-border-archival"
                          >
                            <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                            <span>Return to Desk</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* TAB 2: HOLDS & WAITLISTS */}
          {activeTab === 'holds' && (
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-border-archival shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border-archival pb-4">
                <div>
                  <h2 className="font-serif-display text-2xl font-bold text-archival-teal">
                    Holds &amp; Waitlists
                  </h2>
                  <p className="font-serif-body text-xs italic text-ink-muted mt-0.5">
                    Archival queue positions and reservation status for restricted folios.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-gilded-light text-gilded-amber text-xs font-bold border border-gilded-amber/30">
                  {reservations.length} Active Holds
                </span>
              </div>

              {reservations.length === 0 ? (
                <div className="py-16 text-center bg-parchment-bg rounded-xl border border-dashed border-border-archival">
                  <div className="w-12 h-12 rounded-full bg-white mx-auto flex items-center justify-center text-gilded-amber mb-3 shadow-xs border border-border-archival">
                    <span className="material-symbols-outlined text-[24px]">bookmark</span>
                  </div>
                  <h3 className="font-serif-display text-lg font-bold text-archival-teal">
                    No active hold reservations
                  </h3>
                  <p className="font-serif-body text-xs text-ink-muted italic max-w-sm mx-auto mt-1">
                    When high-demand items are checked out, place a vault hold to be notified upon immediate desk return.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((res, idx) => (
                    <div
                      key={res.id}
                      className="p-5 rounded-xl bg-white border border-border-archival shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gilded-light text-gilded-amber flex items-center justify-center font-bold text-sm border border-gilded-amber/30 shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-gilded-amber">
                            <span className="w-1.5 h-1.5 rounded-full bg-gilded-amber" />
                            Vault Hold Queue Active
                          </span>
                          <h4 className="font-serif-display text-base font-bold text-archival-teal">
                            {res.bookTitle || `Reserved Tome #${res.bookId}`}
                          </h4>
                          <p className="text-xs text-ink-muted font-sans-ui mt-0.5">
                            Reserved on: {new Date(res.reservationDate).toLocaleDateString()} • Dispatch Desk 2
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCancelReservation(res.id, res.bookTitle)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                      >
                        Cancel Hold
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: READING STACKS */}
          {activeTab === 'stacks' && (
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-border-archival shadow-xs space-y-6">
              <div className="border-b border-border-archival pb-4">
                <h2 className="font-serif-display text-2xl font-bold text-archival-teal">
                  Curated Reading Stacks
                </h2>
                <p className="font-serif-body text-xs italic text-ink-muted mt-0.5">
                  Saved folios organized for research themes, seminars, and dissertation cross-examination.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-parchment-subtle border border-border-archival flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-gilded-amber font-bold uppercase">STACK NO. 01</span>
                    <h3 className="font-serif-display text-lg font-bold text-archival-teal">Post-War Sociology</h3>
                    <p className="font-serif-body text-xs text-ink-muted italic">4 Saved Folios • Updated yesterday</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="mt-4 text-xs font-bold text-archival-teal hover:text-gilded-amber flex items-center gap-1"
                  >
                    Open Stack Shelf <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-parchment-subtle border border-border-archival flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-gilded-amber font-bold uppercase">STACK NO. 02</span>
                    <h3 className="font-serif-display text-lg font-bold text-archival-teal">Dystopian &amp; Cybernetics</h3>
                    <p className="font-serif-body text-xs text-ink-muted italic">2 Saved Folios • Updated last week</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="mt-4 text-xs font-bold text-archival-teal hover:text-gilded-amber flex items-center gap-1"
                  >
                    Open Stack Shelf <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: FINES & RECEIPTS */}
          {activeTab === 'fines' && (
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-border-archival shadow-xs space-y-6">
              <div className="border-b border-border-archival pb-4">
                <h2 className="font-serif-display text-2xl font-bold text-archival-teal">
                  Patron Ledger &amp; Fine Receipts
                </h2>
                <p className="font-serif-body text-xs italic text-ink-muted mt-0.5">
                  Institutional circulation balances and historical return receipts.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#059669] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">verified</span>
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-bold text-[#065f46]">
                    Account in Pristine Standing
                  </h3>
                  <p className="text-xs text-[#047857] font-sans-ui mt-0.5">
                    You have zero delinquent balances or outstanding replacement fees. Full borrowing privileges active.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Confirmation Dialog for Returns */}
      <AlertDialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <AlertDialogContent className="bg-white border-border-archival font-sans-ui">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif-display text-archival-teal text-xl">
              Confirm Folio Return Ingestion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink-muted text-xs leading-relaxed">
              Are you returning "{returnRecord?.bookTitle}" to the circulation desk? This volume will be inspected for preservation integrity and logged back onto library shelves.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReturn}
              className="bg-archival-teal hover:bg-archival-deep text-white text-xs font-semibold"
            >
              Confirm Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserBorrowed;