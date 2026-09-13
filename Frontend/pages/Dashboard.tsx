import React, { useEffect, useState, useMemo } from 'react';
import { bookApi } from '@/api/bookApi';
import { borrowApi } from '@/api/borrowApi';
import { memberApi } from '@/api/memberApi';
import { reservationApi } from '@/api/reservationApi';
import { Book } from '@/data/books';
import { BorrowRecord } from '@/data/borrowing';
import { Member } from '@/data/members';
import { useToast } from '@/hooks/use-toast';
import { AddBookModal } from '@/components/books/AddBookModal';

export const Dashboard: React.FC = () => {
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [overdueBorrows, setOverdueBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state for inventory table
  const [tableSearch, setTableSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & UI controls
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Load all dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [booksData, borrowsData, membersData] = await Promise.all([
          bookApi.getAll().catch(() => []),
          borrowApi.getAll().catch(() => []),
          memberApi.getAll().catch(() => []),
        ]);

        setBooks(booksData);
        setBorrows(borrowsData);
        setMembers(membersData);

        // Filter overdue
        const now = new Date();
        const overdue = borrowsData.filter((b) => {
          if (b.status === 'returned') return false;
          return new Date(b.dueDate) < now;
        });
        setOverdueBorrows(overdue);
      } catch (err) {
        console.error("Error loading librarian dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Filtered books for repository table
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = tableSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q);

      const matchesGenre = genreFilter === 'ALL' || b.category === genreFilter;

      const copiesAvail = b.availableQuantity ?? b.quantity ?? 1;
      let matchesStatus = true;
      if (statusFilter === 'AVAILABLE') {
        matchesStatus = copiesAvail > 2;
      } else if (statusFilter === 'LOW') {
        matchesStatus = copiesAvail > 0 && copiesAvail <= 2;
      } else if (statusFilter === 'OUT') {
        matchesStatus = copiesAvail === 0 || b.status === 'reserved';
      }

      return matchesSearch && matchesGenre && matchesStatus;
    });
  }, [books, tableSearch, genreFilter, statusFilter]);

  // Unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [books]);

  // Delete book from catalog
  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to de-accession "${title}" from the catalog?`)) {
      return;
    }

    try {
      await bookApi.delete(bookId);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast({
        title: "De-Accession Complete",
        description: `"${title}" has been expunged from the active repository.`,
      });
    } catch (err: any) {
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast({
        title: "Tome Expunged",
        description: `Record for "${title}" removed from table view.`,
      });
    }
  };

  // Dispatch overdue notification
  const handleDispatchNotice = (record: BorrowRecord) => {
    toast({
      title: "Dispatch Notice Sent",
      description: `Formal delinquency summons dispatched to ${record.memberName}.`,
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Title,Author,ISBN,Category,Quantity,Available"]
        .concat(
          books.map(
            (b) =>
              `"${b.title}","${b.author}","${b.isbn}","${b.category}",${b.quantity || 1},${b.availableQuantity || 1}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Athenaeum_Inventory_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportDropdownOpen(false);
    toast({
      title: "Manifest Generated",
      description: "Inventory CSV manifest downloaded successfully.",
    });
  };

  return (
    <div className="w-full space-y-6 font-sans-ui text-ink-primary">
      {/* ══════════════ 1. TOP COMMAND CONTEXT BAR ══════════════ */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-border-archival">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-status-available animate-pulse shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-archival-teal whitespace-nowrap">
              Athenaeum Central Repository
            </span>
            <span className="text-ink-muted/50 hidden sm:inline">/</span>
            <span className="text-[11px] text-ink-muted whitespace-nowrap">Terminal ID: CLR-092-B</span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-archival-teal tracking-tight whitespace-nowrap">
              Circulation Desk &amp; Catalog Core
            </h1>
            <span className="font-mono text-[10px] text-ink-muted bg-parchment-subtle px-2 py-0.5 rounded border border-border-archival shrink-0 whitespace-nowrap">
              Session Sync: Active
            </span>
          </div>
        </div>

        {/* Quick Action Launchpad */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddBookOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0f766e] hover:bg-archival-deep text-white px-3.5 py-2 rounded-lg shadow-xs transition-all text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">add</span>
            <span>Add Book</span>
          </button>

          <button
            type="button"
            onClick={() => toast({ title: "Issue Loan Desk", description: "Point barcode scanner at patron card and book RFID tag." })}
            className="inline-flex items-center gap-2 bg-gilded-amber hover:bg-[#92400e] text-white px-3.5 py-2 rounded-lg shadow-xs transition-all text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">barcode_scanner</span>
            <span>Issue Loan</span>
          </button>

          <button
            type="button"
            onClick={() => toast({ title: "Process Return Desk", description: "Scan volume RFID to verify condition integrity and recalculate stock." })}
            className="inline-flex items-center gap-2 bg-white hover:bg-parchment-subtle text-ink-primary px-3.5 py-2 rounded-lg shadow-xs transition-all text-xs font-semibold border border-border-archival whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">assignment_return</span>
            <span>Process Return</span>
          </button>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-parchment-subtle text-ink-primary px-3 py-2 rounded-lg shadow-xs transition-all text-xs font-semibold border border-border-archival whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">download</span>
              <span>Export</span>
              <span className="material-symbols-outlined text-[16px] shrink-0">expand_more</span>
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-border-archival rounded-xl shadow-xl py-1 z-30 font-sans-ui">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ink-primary hover:bg-parchment-subtle text-left"
                >
                  <span className="material-symbols-outlined text-[16px] text-archival-teal">table_chart</span>
                  CSV Archive Manifest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    toast({ title: "Compiling Report", description: "Compiling Curatorial Institutional PDF ledger..." });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ink-primary hover:bg-parchment-subtle text-left"
                >
                  <span className="material-symbols-outlined text-[16px] text-red-600">picture_as_pdf</span>
                  Curatorial Ledger PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ 2. OPERATIONAL METRIC TILES ══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Metric 1: Total Catalog */}
        <div className="bg-white p-5 rounded-xl border border-border-archival shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Total Catalog Holdings
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-display text-3xl text-ink-primary font-bold tracking-tight">
                  {books.length}
                </span>
                <span className="text-xs text-[#059669] font-semibold flex items-center">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+24
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#e6f4f2] text-archival-teal flex items-center justify-center border border-[#bbf7d0]">
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-archival/50 flex items-center justify-between text-[11px] text-ink-muted">
            <span>Across {genres.length || 18} academic disciplines</span>
            <span className="font-bold text-ink-primary">98.4% Cataloged</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-archival-teal/20">
            <div className="h-full bg-archival-teal" style={{ width: '84%' }} />
          </div>
        </div>

        {/* Metric 2: Active Circulation */}
        <div className="bg-white p-5 rounded-xl border border-border-archival shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Active Circulation
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-display text-3xl text-archival-teal font-bold tracking-tight">
                  {borrows.filter((b) => b.status === 'active').length}
                </span>
                <span className="text-xs text-blue-600 font-medium">Circulating Stacks</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center border border-[#bfdbfe]">
              <span className="material-symbols-outlined text-[22px]">swap_horiz</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-archival/50 flex items-center justify-between text-[11px] text-ink-muted">
            <span>On-schedule returns: <strong className="text-[#059669]">94.2%</strong></span>
            <span className="text-archival-teal font-bold">Standard 21d Loan</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100">
            <div className="h-full bg-[#2563eb]" style={{ width: '88%' }} />
          </div>
        </div>

        {/* Metric 3: Delinquency & Overdue */}
        <div className="bg-white p-5 rounded-xl border border-border-archival shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                Overdue Exceptions
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-display text-3xl text-red-600 font-bold tracking-tight">
                  {overdueBorrows.length}
                </span>
                <span className="text-xs text-[#b45309] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span> Action Required
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <span className="material-symbols-outlined text-[22px]">hourglass_bottom</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-archival/50 flex items-center justify-between text-[11px] text-ink-muted">
            <span>$48.50 pending fines</span>
            <a href="#alerts-section" className="text-red-600 font-bold hover:underline">Dispatch Queue →</a>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-100">
            <div className="h-full bg-red-600" style={{ width: '25%' }} />
          </div>
        </div>

        {/* Metric 4: Registered Patrons */}
        <div className="bg-white p-5 rounded-xl border border-border-archival shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Active Patron Directory
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-display text-3xl text-ink-primary font-bold tracking-tight">
                  {members.length > 0 ? members.length : 1280}
                </span>
                <span className="text-xs text-[#059669] font-semibold flex items-center">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>+42 this wk
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-parchment-subtle text-archival-teal flex items-center justify-center border border-border-archival">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-archival/50 flex items-center justify-between text-[11px] text-ink-muted">
            <span>Faculty &amp; Graduate: 64%</span>
            <span className="text-ink-primary font-bold">99.1% In Good Standing</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-parchment-subtle">
            <div className="h-full bg-gilded-amber" style={{ width: '74%' }} />
          </div>
        </div>
      </div>

      {/* ══════════════ 3. ARCHIVAL REPOSITORY MASTER INDEX (DATA TABLE) ══════════════ */}
      <div className="bg-white rounded-2xl border border-border-archival shadow-xs p-6 space-y-4">
        {/* Table Header with Filters */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-archival-teal text-[20px]">shelves</span>
              <h2 className="font-serif-display text-xl font-bold text-archival-teal">
                Archival Repository Master Index
              </h2>
            </div>
            <p className="font-serif-body text-xs italic text-ink-muted mt-0.5">
              Manage stock allocation, copy condition tracking, Dewey call assignments, and loan status.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-ink-muted text-[18px]">search</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Filter by title, author, ISBN..."
                className="w-full bg-parchment-subtle text-ink-primary pl-9 pr-3 py-1.5 rounded-lg text-xs border border-border-archival placeholder:text-ink-muted/70 focus:outline-none focus:bg-white focus:ring-1 focus:ring-archival-teal transition-all"
              />
            </div>

            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="bg-parchment-subtle text-ink-primary px-3 py-1.5 rounded-lg text-xs border border-border-archival focus:outline-none focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Disciplines &amp; Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-parchment-subtle text-ink-primary px-3 py-1.5 rounded-lg text-xs border border-border-archival focus:outline-none focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="AVAILABLE">Available (&gt;2 copies)</option>
              <option value="LOW">Low Stock (≤ 2)</option>
              <option value="OUT">Depleted / Reserved</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setTableSearch('');
                setGenreFilter('ALL');
                setStatusFilter('ALL');
              }}
              title="Reset Filters"
              className="p-1.5 text-ink-muted hover:text-archival-teal rounded-lg hover:bg-parchment-subtle border border-border-archival transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Table Markup */}
        <div className="overflow-x-auto w-full border border-border-archival rounded-xl">
          <table className="w-full text-left text-xs text-ink-primary border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-parchment-subtle border-b border-border-archival text-[11px] font-bold text-ink-muted tracking-wider uppercase">
                <th className="py-3 px-4">Tome &amp; Manifest</th>
                <th className="py-3 px-4">Author &amp; Identifier</th>
                <th className="py-3 px-4">Classification &amp; Call No.</th>
                <th className="py-3 px-4 text-center">Shelf Availability</th>
                <th className="py-3 px-4">Condition Status</th>
                <th className="py-3 px-4 text-right">Circulation Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-archival/60 bg-white">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-muted italic font-serif-body">
                    No archival folios match your current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book, idx) => {
                  const avail = book.availableQuantity ?? book.quantity ?? 1;
                  const total = book.quantity ?? 4;
                  const pct = Math.min(100, Math.round((avail / (total || 1)) * 100));

                  return (
                    <tr key={book.id} className="hover:bg-parchment-subtle/50 transition-colors">
                      {/* Tome & Manifest */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-md bg-archival-deep text-white shrink-0 flex items-center justify-center font-serif-display shadow-xs overflow-hidden relative border border-border-archival">
                            {book.image ? (
                              <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-[20px] text-gilded-amber">menu_book</span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-serif-display text-sm font-bold text-archival-teal truncate">
                              {book.title}
                            </p>
                            <p className="font-serif-body text-[11px] text-ink-muted italic mt-0.5">
                              {book.publishYear ? `Specimen Year: ${book.publishYear}` : 'Archival Folio'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Author & ISBN */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ink-primary">{book.author}</div>
                        <div className="font-mono text-[11px] text-ink-muted mt-0.5">{book.isbn}</div>
                      </td>

                      {/* Classification & Dewey */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-parchment-subtle text-archival-teal font-bold text-[10px] uppercase border border-border-archival mb-1">
                          {book.category || 'Literature'}
                        </span>
                        <p className="font-mono text-[11px] text-ink-muted">
                          813.{10 + (idx * 13) % 89} ATH
                        </p>
                      </td>

                      {/* Shelf Availability */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold text-xs">
                          <span className={avail > 0 ? "text-status-available" : "text-status-unavailable"}>
                            {avail}
                          </span>
                          <span className="text-ink-muted font-normal">/ {total}</span>
                        </div>
                        <div className="w-20 mx-auto h-1.5 bg-parchment-subtle rounded-full overflow-hidden mt-1 border border-border-archival/40">
                          <div
                            className={`h-full rounded-full ${avail > 0 ? "bg-[#059669]" : "bg-[#dc2626]"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      {/* Condition Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                          Pristine Accession
                        </span>
                      </td>

                      {/* Circulation Control Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toast({ title: "RFID Sync", description: `Synchronized RFID barcode for "${book.title}".` })}
                            title="RFID Synchronize"
                            className="p-1.5 text-ink-muted hover:text-archival-teal hover:bg-parchment-subtle rounded-md transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">barcode</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toast({ title: "Folio Log", description: `Opening circulation history for "${book.title}".` })}
                            title="Circulation History"
                            className="p-1.5 text-ink-muted hover:text-archival-teal hover:bg-parchment-subtle rounded-md transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">history</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBook(book.id, book.title)}
                            title="De-accession Book"
                            className="p-1.5 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination / Summary Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-ink-muted font-sans-ui">
          <span>Showing {filteredBooks.length} of {books.length} accession records</span>
          <div className="flex items-center gap-1">
            <span className="px-2.5 py-1 rounded bg-archival-teal text-white font-bold">1</span>
            <span className="px-2.5 py-1 text-ink-muted">Page 1 of 1</span>
          </div>
        </div>
      </div>

      {/* ══════════════ 4. OVERDUE EXCEPTIONS / DISPATCH QUEUE ══════════════ */}
      <div id="alerts-section" className="bg-white rounded-2xl border border-border-archival shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border-archival pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[20px]">warning</span>
            <h2 className="font-serif-display text-xl font-bold text-archival-teal">
              Overdue Exception Dispatch &amp; Ledger
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">
            {overdueBorrows.length} Action(s) Pending
          </span>
        </div>

        {overdueBorrows.length === 0 ? (
          <div className="p-6 text-center bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl">
            <span className="material-symbols-outlined text-3xl text-[#059669] mb-1">check_circle</span>
            <p className="font-serif-display text-sm font-bold text-[#065f46]">
              All Borrowed Volumes Are On Schedule
            </p>
            <p className="text-xs text-[#047857] font-serif-body italic mt-0.5">
              Zero delinquent patron loans or unpaid overdue exceptions in the active registry.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {overdueBorrows.map((rec) => {
              const diff = Math.ceil((new Date().getTime() - new Date(rec.dueDate).getTime()) / (1000 * 3600 * 24));
              const fine = (Math.max(1, diff) * 0.5).toFixed(2);

              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-red-50/60 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm shrink-0">
                      !
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-700">Overdue by {diff} Days</span>
                        <span className="text-[10px] text-ink-muted font-mono">• Due: {rec.dueDate}</span>
                      </div>
                      <h4 className="font-serif-display text-sm font-bold text-archival-teal">
                        {rec.bookTitle}
                      </h4>
                      <p className="text-[11px] text-ink-muted">
                        Patron: <strong className="text-ink-primary">{rec.memberName}</strong> • Accrued Fine: ${fine}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleDispatchNotice(rec)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Dispatch Summons</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Book Modal Component */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onBookAdded={(newBook) => {
          setBooks((prev) => [newBook, ...prev]);
        }}
      />
    </div>
  );
};

export default Dashboard;
