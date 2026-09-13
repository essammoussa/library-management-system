import React from 'react';
import { Book } from '@/data/books';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onBorrow: (book: Book) => void;
  onReserve: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onBorrow,
  onReserve,
}) => {
  if (!isOpen || !book) return null;

  const isAvailable = (book.availableQuantity ?? book.quantity ?? 1) > 0 && book.status !== 'reserved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans-ui">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white rounded-2xl border border-border-archival shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 bg-parchment-subtle border-b border-border-archival flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-archival-teal/10 flex items-center justify-center text-archival-teal border border-archival-teal/20">
              <span className="material-symbols-outlined text-[22px]">history_edu</span>
            </div>
            <div>
              <span className="font-sans-ui text-[11px] text-gilded-amber uppercase font-bold tracking-widest">
                {book.category} Folio Record
              </span>
              <h3 className="font-serif-display text-xl font-bold text-archival-teal">
                {book.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-white hover:bg-border-archival/50 text-ink-muted flex items-center justify-center transition-colors border border-border-archival"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-parchment-bg p-3 rounded-lg border border-border-archival">
            <div>
              <div className="text-[11px] font-sans-ui uppercase text-ink-muted font-bold">Author</div>
              <div className="font-serif-body text-xs font-bold text-archival-teal truncate">{book.author}</div>
            </div>
            <div>
              <div className="text-[11px] font-sans-ui uppercase text-ink-muted font-bold">ISBN Registry</div>
              <div className="font-mono text-xs text-ink-primary truncate">{book.isbn}</div>
            </div>
            <div>
              <div className="text-[11px] font-sans-ui uppercase text-ink-muted font-bold">Pub Year</div>
              <div className="font-mono text-xs font-bold text-gilded-amber">{book.publishYear}</div>
            </div>
            <div>
              <div className="text-[11px] font-sans-ui uppercase text-ink-muted font-bold">Shelf Availability</div>
              <div className={`font-sans-ui text-xs font-bold ${isAvailable ? 'text-[#059669]' : 'text-[#b45309]'}`}>
                {isAvailable ? `${book.availableQuantity ?? 1} on shelf` : 'Vault Reserved'}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-sans-ui font-bold text-archival-teal flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-gilded-amber">pin_drop</span>
              <span>Preserved Stack Location:</span>
            </div>
            <p className="font-mono text-xs text-ink-primary bg-parchment-subtle p-2.5 rounded border border-border-archival">
              Stack A-12 • Stacks Hall East • Tier Level 2
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-sans-ui font-bold text-archival-teal">Archival Custody Regulations:</div>
            <ul className="font-serif-body text-xs text-ink-muted italic space-y-1 list-disc list-inside">
              <li>Standard academic circulation: 21 business days upon physical desk dispatch.</li>
              <li>Reading room only for rare annotated specimens with gold stamps.</li>
              <li>High-resolution illuminated digital chapter scans available via ILL.</li>
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#f5eee2] border-t border-border-archival flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-parchment-subtle text-ink-muted font-sans-ui text-xs font-semibold transition-colors border border-border-archival"
          >
            Dismiss Folio
          </button>
          {isAvailable ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onBorrow(book);
              }}
              className="px-5 py-2 rounded-lg bg-archival-teal hover:bg-archival-deep text-white font-sans-ui text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">import_contacts</span>
              <span>Request Circulation</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onReserve(book);
              }}
              className="px-5 py-2 rounded-lg bg-gilded-amber hover:bg-[#92400e] text-white font-sans-ui text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
              <span>Queue Stack Hold</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
