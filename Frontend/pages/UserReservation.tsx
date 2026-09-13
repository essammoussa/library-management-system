import React, { useState, useEffect } from 'react';
import { reservationApi } from '@/api/reservationApi';
import { bookApi } from '@/api/bookApi';
import { Reservation } from '@/data/reservations';
import { Book } from '@/data/books';
import { useToast } from '@/hooks/use-toast';
import { useRole } from "@/store/RoleContext";
import { useNavigate } from "react-router-dom";

export default function UserReservation() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useRole();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [booksMap, setBooksMap] = useState<Record<string, Book>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allBooks = await bookApi.getAll().catch(() => []);
        const map: Record<string, Book> = {};
        allBooks.forEach((b) => {
          map[b.id] = b;
        });
        setBooksMap(map);

        const memberId = user?.id || 'patron-user';
        let resList: Reservation[] = [];
        try {
          resList = await reservationApi.getByMember(memberId);
        } catch {
          const all = await reservationApi.getActive().catch(() => []);
          resList = all.filter((r) => r.memberId === memberId);
        }

        if (resList.length === 0) {
          const local = JSON.parse(localStorage.getItem('reservedBooks') || '[]');
          resList = local.map((lr: any) => ({
            id: lr.bookId,
            bookId: lr.bookId,
            bookTitle: lr.bookTitle,
            memberId: memberId,
            memberName: user?.name || 'Scholar Patron',
            reservationDate: lr.reservationDate || new Date().toISOString().split('T')[0],
            status: 'active' as const,
          }));
        }

        setReservations(resList);
      } catch (err) {
        console.error("Failed to load user reservations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCancel = async (id: string, title: string) => {
    try {
      await reservationApi.cancel(id);
    } catch {
      // client-side update
    }

    setReservations((prev) => prev.filter((r) => r.id !== id));
    const local = JSON.parse(localStorage.getItem('reservedBooks') || '[]');
    localStorage.setItem('reservedBooks', JSON.stringify(local.filter((b: any) => b.bookId !== id)));

    toast({
      title: "Reservation Released",
      description: `Hold for "${title}" has been released back to stacks.`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center font-sans-ui">
        <div className="bg-white p-12 rounded-2xl border border-border-archival shadow-lg space-y-4">
          <div className="w-16 h-16 bg-[#063b36]/10 text-archival-teal rounded-2xl flex items-center justify-center mx-auto border border-archival-teal/20">
            <span className="material-symbols-outlined text-[36px]">bookmark_manager</span>
          </div>
          <h2 className="font-serif-display text-3xl font-bold text-archival-teal">
            Patron Card Access Required
          </h2>
          <p className="font-serif-body text-sm text-ink-muted italic max-w-md mx-auto">
            Sign in with your authenticated patron credentials to review upcoming holds and queue positions.
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
      <div className="border-b border-border-archival pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gilded-amber mb-1">
          <span className="material-symbols-outlined text-[15px]">history_edu</span>
          Patron Vault Services
        </div>
        <h1 className="font-serif-display text-3xl font-bold text-archival-teal">
          My Reserved Folios &amp; Queue Positions
        </h1>
        <p className="font-serif-body text-xs italic text-ink-muted mt-1">
          Monitor your position in line for high-demand manuscripts, course reserves, and restricted special collections.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-archival-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs italic text-ink-muted">Accessing reservation registries...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-border-archival">
          <div className="w-14 h-14 rounded-full bg-parchment-subtle text-gilded-amber flex items-center justify-center mx-auto mb-3 border border-border-archival">
            <span className="material-symbols-outlined text-[28px]">bookmark_border</span>
          </div>
          <h3 className="font-serif-display text-xl font-bold text-archival-teal">
            No Active Hold Reservations
          </h3>
          <p className="font-serif-body text-xs text-ink-muted italic max-w-sm mx-auto mt-1">
            When books are currently checked out by other researchers, you can queue an archival hold to claim priority checkout upon return.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 px-5 py-2.5 rounded-lg bg-archival-teal hover:bg-archival-deep text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Explore Rare Manuscripts &amp; Stacks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((res, index) => {
            const book = booksMap[res.bookId];
            return (
              <div
                key={res.id}
                className="bg-white rounded-xl border border-border-archival p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#fffbeb] text-[#92400e] border border-[#fde68a]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" />
                      Hold Queue Active
                    </span>
                    <span className="font-mono text-xs font-bold text-archival-teal">
                      Queue #{index + 1}
                    </span>
                  </div>

                  <div className="flex gap-3.5 items-start">
                    <img
                      src={
                        book?.image ||
                        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop"
                      }
                      alt={res.bookTitle}
                      className="w-14 h-20 object-cover rounded-md shadow-xs border border-border-archival shrink-0"
                    />
                    <div>
                      <h3 className="font-serif-display text-base font-bold text-archival-teal leading-snug">
                        {res.bookTitle}
                      </h3>
                      <p className="font-serif-body text-xs text-ink-muted italic mt-0.5">
                        {book?.author || 'Historical Archive Specimen'}
                      </p>
                      <p className="text-[11px] text-ink-muted font-sans-ui mt-1">
                        Reserved: {new Date(res.reservationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-archival/60 flex items-center justify-between">
                  <span className="text-[11px] text-ink-muted italic font-serif-body">
                    Dispatch: Desk 2
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCancel(res.id, res.bookTitle)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                  >
                    Cancel Hold
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
