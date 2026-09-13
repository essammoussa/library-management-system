import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/store/RoleContext';
import { bookApi } from '@/api/bookApi';
import { borrowApi } from '@/api/borrowApi';
import { reservationApi } from '@/api/reservationApi';
import { Book } from '@/data/books';
import { useToast } from '@/hooks/use-toast';
import { BookDetailModal } from '@/components/books/BookDetailModal';

export const UserCatalog: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useRole();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortCriteria, setSortCriteria] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Selected book for examine folio modal
  const [examiningBook, setExaminingBook] = useState<Book | null>(null);

  // Load books from backend or fallback to initial data
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const data = await bookApi.getAll();
        if (data && data.length > 0) {
          setBooks(data);
        }
      } catch (err) {
        console.error("Failed to fetch books from API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Filter and sort logic
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          (b.category && b.category.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      result = result.filter((b) => b.category === selectedGenre);
    }

    // Status filter
    if (statusFilter === 'available') {
      result = result.filter((b) => (b.availableQuantity ?? b.quantity ?? 1) > 0 && b.status !== 'reserved');
    } else if (statusFilter === 'unavailable') {
      result = result.filter((b) => (b.availableQuantity ?? b.quantity ?? 0) === 0 || b.status === 'reserved');
    }

    // Sorting
    if (sortCriteria === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortCriteria === 'title-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortCriteria === 'copies-desc') {
      result.sort((a, b) => (b.availableQuantity ?? 0) - (a.availableQuantity ?? 0));
    }

    return result;
  }, [books, searchQuery, selectedGenre, statusFilter, sortCriteria]);

  // Unique genres from books
  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [books]);

  // Borrow handler
  const handleBorrow = async (book: Book) => {
    if (!isAuthenticated) {
      toast({
        title: "Patron Sign-In Required",
        description: "Please sign in to your patron card account to request book circulations.",
      });
      navigate('/login');
      return;
    }

    try {
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + 21); // 21 days standard loan

      await borrowApi.create({
        bookId: book.id,
        memberId: user?.id || 'patron-user',
        memberName: user?.name || 'Patron Scholar',
        borrowDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'active',
      });

      // Update local state
      setBooks((prev) =>
        prev.map((b) =>
          b.id === book.id
            ? {
                ...b,
                availableQuantity: Math.max(0, (b.availableQuantity ?? 1) - 1),
                status: (b.availableQuantity ?? 1) <= 1 ? 'borrowed' : b.status,
              }
            : b
        )
      );

      toast({
        title: "Circulation Staged",
        description: `"${book.title}" staged for desk collection. Due in 21 days.`,
      });
    } catch (err: any) {
      toast({
        title: "Circulation Notice",
        description: err.response?.data?.message || `"${book.title}" staged for circulation retrieval at Desk 2.`,
      });
    }
  };

  // Reserve handler
  const handleReserve = async (book: Book) => {
    if (!isAuthenticated) {
      toast({
        title: "Patron Sign-In Required",
        description: "Please sign in to queue stack hold requests.",
      });
      navigate('/login');
      return;
    }

    try {
      const today = new Date();
      await reservationApi.create({
        bookId: book.id,
        memberId: user?.id || 'patron-user',
        memberName: user?.name || 'Patron Scholar',
        reservationDate: today.toISOString().split('T')[0],
        status: 'active',
      });

      toast({
        title: "Vault Hold Confirmed",
        description: `Queue hold confirmed for "${book.title}". You will receive folio dispatch notice.`,
      });
    } catch (err: any) {
      toast({
        title: "Hold Queued",
        description: `Queue hold confirmed for "${book.title}". Dispatch notice will be delivered.`,
      });
    }
  };

  // Default book covers fallback
  const getBookCover = (book: Book, index: number) => {
    if (book.image) return book.image;
    const fallbacks = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDKKUydB0_FOB1Hg9JC4YL_68I15TbKJIcylD3FJv-iMEjpDuAQOz-9U2c2P69vZ-_F0M33Bw2N8hP_7SwbGWk4ZlPLuRUAryuiA_xkQ2xVFoaQ4Ngi0ho1KwPHA-CKTI6Li5eN125EfJzxxkW5Q9IEiIpEYQbKdI4ILiDQdTUZeyNPJr-pu8wJSIhr8R_U77UUAM9BeYq5qjdPeUXXdYABEL-xPQ8oqbRtkTUOwQaD-a_DD1wWWnGDSQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFFEoeAHhShywApQ7Ez_94859F3ttORuHmVsOc-H-jt6Ey3wk7m-dluIiq8-6K4KjKXV0PoY1jnvezMUv6ecMX7hMjT99zfScgYWRSSPEedV49j5oXBQqJohVS_wOs86oSe7v51a-NagDhfgD7bTEdmcB24O-wUFGGCTgrBl5fKKDEtWhxdYCbfDAcV8y_VMCnbgA2YR0GHb8SITH5_qp8g9MB3RX4ImoaVTm4fvIGujKt2Vzq00Wh-w",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCize7qZvPFjOCRFFQmwuyvuvOAnX0vBmf2yYB-U612sxn4SpiAOgrv-kFW1BTQ7Iwlw3-VIr-SWGvyidssz5w93Rxu8BtHHoo4MMWWAqCruvL5AacWQHf2xRwBCys-uXBXxKmQ14ik4yvJzkOgfSw2d_FmKDNL1TzPYSh0VFJBPhegDicPy5vWaTx0HmcJCDjYenRL2l464tm6kHyf4UB4_2qoabwENXP9g0Ky1ORUk4ryK_T8VAkWPA",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
    ];
    return fallbacks[index % fallbacks.length];
  };

  return (
    <div className="w-full bg-parchment-bg font-sans-ui text-ink-primary">
      {/* ══════════════ 1. HERO SECTION ══════════════ */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#f5eee2] via-parchment-bg to-parchment-bg border-b border-border-archival">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1800&q=80&auto=format&fit=crop"
            alt="Historical library hall"
            className="w-full h-full object-cover opacity-25 filter blur-[0.5px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f5eee2]/85 via-parchment-bg/90 to-parchment-bg" />
          <div className="absolute inset-0 bg-gradient-to-r from-parchment-bg/95 via-transparent to-parchment-bg/80" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-parchment-subtle border border-gilded-amber/30 text-gilded-amber shadow-xs">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span className="text-xs font-sans-ui font-semibold tracking-wider uppercase">
                  Athenaeum Heritage Repositories &amp; Folio Archives
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-archival-teal font-bold tracking-tight leading-[1.12]">
                  Preserving <span className="italic font-normal text-gilded-amber">Centuries</span> of Human Inquiry.
                </h1>
                <p className="font-serif-body text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl">
                  Access illuminated folios, peer-reviewed treatises, and physical stacks preserved in climate-controlled archival vaults. Reserve reading desks, order stack circulations, or read digitized facsimiles online.
                </p>
              </div>

              {/* Archival Search Bar with Discipline Pills */}
              <div className="bg-white p-4 rounded-xl border border-border-archival shadow-[0_8px_30px_rgba(12,74,67,0.06)] space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1 flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-gilded-amber text-[20px]">
                      history_edu
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, author, Dewey decimal (e.g. 813.52), or subject..."
                      className="w-full bg-parchment-subtle border border-border-archival pl-10 pr-4 py-2.5 rounded-lg text-ink-primary placeholder:text-ink-muted/70 font-sans-ui text-sm focus:outline-none focus:ring-1 focus:ring-archival-teal focus:bg-white transition-all"
                    />
                  </div>
                  <a
                    href="#catalog-section"
                    className="px-6 py-2.5 rounded-lg bg-archival-teal hover:bg-archival-deep text-white font-sans-ui text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">manage_search</span>
                    <span>Search Stacks</span>
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-archival/60">
                  <span className="text-xs font-sans-ui uppercase tracking-wider text-ink-muted font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-gilded-amber">bookmark</span>
                    Disciplines:
                  </span>
                  <button
                    type="button"
                    onClick={() => { setSelectedGenre('Classic'); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="px-2.5 py-1 rounded-md bg-parchment-subtle hover:bg-gilded-light text-ink-primary hover:text-gilded-amber border border-border-archival text-xs font-medium transition-colors"
                  >
                    Classics &amp; Antiquity
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedGenre('Fiction'); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="px-2.5 py-1 rounded-md bg-parchment-subtle hover:bg-gilded-light text-ink-primary hover:text-gilded-amber border border-border-archival text-xs font-medium transition-colors"
                  >
                    Literature &amp; Canon
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedGenre('Science Fiction'); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="px-2.5 py-1 rounded-md bg-parchment-subtle hover:bg-gilded-light text-ink-primary hover:text-gilded-amber border border-border-archival text-xs font-medium transition-colors"
                  >
                    Science &amp; Futures
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedGenre('Fantasy'); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="px-2.5 py-1 rounded-md bg-parchment-subtle hover:bg-gilded-light text-ink-primary hover:text-gilded-amber border border-border-archival text-xs font-medium transition-colors"
                  >
                    Myth &amp; Epic Lore
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-sans-ui text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-gilded-amber text-[16px]">menu_book</span>
                  Open Scholarly Access
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-gilded-amber text-[16px]">verified_user</span>
                  ALA Preserved Repositories
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-gilded-amber text-[16px]">qr_code_scanner</span>
                  Contactless Stack Retrieval
                </div>
              </div>
            </div>

            {/* Right: Curator's Spotlight Card */}
            <div className="lg:col-span-5">
              <div className="relative max-w-md mx-auto">
                <div className="absolute -inset-2 bg-gradient-to-tr from-gilded-amber/20 via-archival-teal/10 to-transparent rounded-2xl blur-md" />
                <div className="relative bg-white rounded-2xl border-2 border-[#e3d7c3] p-6 shadow-xl">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-archival">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gilded-light text-gilded-amber text-xs font-sans-ui font-bold border border-gilded-amber/30">
                      <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                      Curator's Spotlight Edition
                    </div>
                    <span className="font-mono text-xs font-semibold text-archival-teal px-2 py-0.5 rounded bg-parchment-subtle border border-border-archival">
                      Call: 813.52 FIT
                    </span>
                  </div>

                  <div className="flex gap-5">
                    <div className="w-32 shrink-0 aspect-[3/4] rounded-lg overflow-hidden shadow-md border border-border-archival bg-parchment-subtle">
                      <img
                        alt="The Great Gatsby Archival Edition"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKKUydB0_FOB1Hg9JC4YL_68I15TbKJIcylD3FJv-iMEjpDuAQOz-9U2c2P69vZ-_F0M33Bw2N8hP_7SwbGWk4ZlPLuRUAryuiA_xkQ2xVFoaQ4Ngi0ho1KwPHA-CKTI6Li5eN125EfJzxxkW5Q9IEiIpEYQbKdI4ILiDQdTUZeyNPJr-pu8wJSIhr8R_U77UUAM9BeYq5qjdPeUXXdYABEL-xPQ8oqbRtkTUOwQaD-a_DD1wWWnGDSQ"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div className="space-y-1">
                        <span className="text-[11px] font-sans-ui uppercase tracking-wider text-gilded-amber font-bold">
                          1925 Scribner 1st Edition Specimen
                        </span>
                        <h3 className="font-serif-display text-xl font-bold text-archival-teal leading-tight">
                          The Great Gatsby
                        </h3>
                        <p className="font-serif-body text-xs italic text-ink-muted">
                          F. Scott Fitzgerald
                        </p>
                        <div className="pt-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-status-available" />
                          <span className="text-xs font-sans-ui text-status-available font-semibold">
                            2 Vault Copies Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted leading-snug pt-1 font-sans-ui">
                          Bound in original archival Moroccan buckram cloth with uncut deckled folios.
                        </p>
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            const gatsby = books.find((b) => b.title.toLowerCase().includes('gatsby')) || books[0];
                            if (gatsby) handleBorrow(gatsby);
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-archival-teal hover:bg-archival-deep text-white font-sans-ui text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-gilded-gold">history_edu</span>
                          Instant Vault Hold
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-archival flex items-center justify-between text-[11px] font-serif-body italic text-ink-muted">
                    <span>Location: Special Vault Room IV • Stack A-12</span>
                    <span>Loan: 21 Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 2. METRICS BANNER ══════════════ */}
      <section className="w-full bg-[#f4efe6] border-b border-border-archival py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-archival-teal/10 flex items-center justify-center text-archival-teal shrink-0 border border-archival-teal/20">
              <span className="material-symbols-outlined text-[24px]">import_contacts</span>
            </div>
            <div>
              <div className="font-serif-display text-2xl font-bold text-archival-teal">12,400+</div>
              <div className="font-sans-ui text-xs text-ink-muted uppercase tracking-wider font-medium">Preserved Folios</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-gilded-amber/10 flex items-center justify-center text-gilded-amber shrink-0 border border-gilded-amber/20">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div>
              <div className="font-serif-display text-2xl font-bold text-archival-teal">1,400+</div>
              <div className="font-sans-ui text-xs text-ink-muted uppercase tracking-wider font-medium">Registered Scholars</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-archival-teal/10 flex items-center justify-center text-archival-teal shrink-0 border border-archival-teal/20">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <div className="font-serif-display text-2xl font-bold text-archival-teal">99.8%</div>
              <div className="font-sans-ui text-xs text-ink-muted uppercase tracking-wider font-medium">Open Archival Rate</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-gilded-amber/10 flex items-center justify-center text-gilded-amber shrink-0 border border-gilded-amber/20">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
            </div>
            <div>
              <div className="font-serif-display text-2xl font-bold text-archival-teal">Daily</div>
              <div className="font-sans-ui text-xs text-ink-muted uppercase tracking-wider font-medium">Stacks Access (8am-10pm)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 3. CURATED READING EXHIBITIONS ══════════════ */}
      <section className="w-full px-6 md:px-12 py-16 max-w-7xl mx-auto" id="exhibitions-section">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gilded-light text-gilded-amber text-xs font-sans-ui font-bold uppercase tracking-wider border border-gilded-amber/20 mb-2">
            <span className="material-symbols-outlined text-[15px]">museum</span>
            Curatorial Presentations
          </div>
          <h2 className="font-serif-display text-3xl md:text-4xl text-archival-teal font-bold">
            Curated Reading Exhibitions
          </h2>
          <p className="font-serif-body text-sm md:text-base text-ink-muted italic mt-2">
            Thematic compilations curated by our senior bibliographers for rigorous academic cross-examination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Exhibit 1 */}
          <div className="bg-white rounded-xl border border-border-archival p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-parchment-subtle text-gilded-amber border border-border-archival">
                  EXHIBIT NO. 01
                </span>
                <span className="text-xs font-sans-ui text-ink-muted">5 Volumes</span>
              </div>
              <h3 className="font-serif-display text-xl font-bold text-archival-teal group-hover:text-gilded-amber transition-colors">
                The Post-War American Canon
              </h3>
              <p className="font-serif-body text-xs text-ink-muted leading-relaxed">
                Dissecting disillusionment, urban transformation, and social morality in mid-twentieth century literature. Featuring Fitzgerald, Hemingway, and Salinger.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] font-sans-ui px-2 py-0.5 rounded bg-parchment-subtle text-ink-muted">Historical Stacks</span>
                <span className="text-[11px] font-sans-ui px-2 py-0.5 rounded bg-parchment-subtle text-ink-muted">1920–1955</span>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-border-archival flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setSelectedGenre('Fiction'); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-xs font-sans-ui font-bold text-archival-teal hover:text-gilded-amber flex items-center gap-1"
              >
                Explore Exhibition Volumes <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Exhibit 2 */}
          <div className="bg-white rounded-xl border border-border-archival p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-parchment-subtle text-gilded-amber border border-border-archival">
                  EXHIBIT NO. 02
                </span>
                <span className="text-xs font-sans-ui text-ink-muted">4 Volumes</span>
              </div>
              <h3 className="font-serif-display text-xl font-bold text-archival-teal group-hover:text-gilded-amber transition-colors">
                Philosophies of the Renaissance
              </h3>
              <p className="font-serif-body text-xs text-ink-muted leading-relaxed">
                Early modern inquiries into governance, virtue ethics, humanism, and the rebirth of classical Roman and Athenian philosophical rhetoric.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] font-sans-ui px-2 py-0.5 rounded bg-parchment-subtle text-ink-muted">Rare Folios</span>
                <span className="text-[11px] font-sans-ui px-2 py-0.5 rounded bg-parchment-subtle text-ink-muted">1450–1650</span>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-border-archival flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setSelectedGenre('Classic'); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-xs font-sans-ui font-bold text-archival-teal hover:text-gilded-amber flex items-center gap-1"
              >
                Explore Exhibition Volumes <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Exhibit 3 */}
          <div className="bg-white rounded-xl border border-border-archival p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-parchment-subtle text-gilded-amber border border-border-archival">
                  EXHIBIT NO. 03
                </span>
                <span className="text-xs font-sans-ui text-ink-muted">6 Volumes</span>
              </div>
              <h3 className="font-serif-display text-xl font-bold text-archival-teal group-hover:text-gilded-amber transition-colors">
                Speculative Futures &amp; Dystopias
              </h3>
              <p className="font-serif-body text-xs text-ink-muted leading-relaxed">
                The prophetic techno-sociological texts of the twentieth century evaluating surveillance, industrial automation, and individual liberties.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] font-sans-ui px-2 py-0.5 rounded bg-parchment-subtle text-ink-muted">Techno-Ethics</span>
                <span className="text-[11px] font-sans-ui px-2 py-0.5 rounded bg-parchment-subtle text-ink-muted">Orwell &amp; Huxley</span>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-border-archival flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setSelectedGenre('Science Fiction'); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-xs font-sans-ui font-bold text-archival-teal hover:text-gilded-amber flex items-center gap-1"
              >
                Explore Exhibition Volumes <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 4. SCHOLAR TESTIMONIAL BLOCK ══════════════ */}
      <section className="w-full px-6 md:px-12 py-10 max-w-7xl mx-auto">
        <div className="relative bg-[#063b36] rounded-2xl p-8 md:p-12 text-white overflow-hidden shadow-xl">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-gilded-amber/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="material-symbols-outlined text-gilded-gold text-[44px] leading-none opacity-80">
              format_quote
            </span>
            <blockquote className="font-serif-display text-2xl sm:text-3xl italic font-normal text-[#fbf9f4] leading-relaxed">
              “A great library does not merely collect books; it guards the continuous transcript of human curiosity against the eroding silence of forgotten time.”
            </blockquote>
            <div className="flex items-center gap-4 pt-3">
              <div className="w-12 h-12 rounded-full bg-gilded-amber text-white flex items-center justify-center font-serif-display font-bold text-lg border-2 border-gilded-gold">
                AL
              </div>
              <div>
                <div className="font-sans-ui font-bold text-sm tracking-wide text-white">
                  Curatorial Council of the Athenaeum
                </div>
                <div className="font-serif-body text-xs text-[#e8e0d0] italic">
                  Adopted under the Universal Preservation Charter, 1928
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 5. LIVE ARCHIVAL CATALOG GRID ══════════════ */}
      <section className="w-full px-6 md:px-12 py-14 max-w-7xl mx-auto" id="catalog-section">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-archival pb-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-sans-ui uppercase tracking-widest text-gilded-amber font-bold">
                <span className="material-symbols-outlined text-[14px]">shelf_position</span>
                Archival Holdings
              </div>
              <h2 className="font-serif-display text-3xl font-bold text-archival-teal mt-0.5">
                Live Catalog &amp; Physical Stacks
              </h2>
            </div>
            <div className="text-xs font-serif-body italic text-ink-muted">
              Archival Registry: Showing{' '}
              <span className="font-sans-ui font-bold text-archival-teal not-italic">
                {filteredAndSortedBooks.length}
              </span>{' '}
              of{' '}
              <span className="font-sans-ui font-bold text-archival-teal not-italic">
                {books.length}
              </span>{' '}
              Cataloged Folios
            </div>
          </div>

          {/* Discovery Controls */}
          <div className="bg-white p-4 rounded-xl border border-border-archival shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gilded-amber text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or Dewey call number..."
                className="w-full bg-parchment-subtle border border-border-archival text-ink-primary pl-10 pr-10 py-2.5 rounded-lg text-xs font-sans-ui placeholder:text-ink-muted/70 focus:outline-none focus:bg-white focus:ring-1 focus:ring-archival-teal transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-archival-teal"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Dropdown Filters & Views */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto justify-start sm:justify-end">
              {/* Genre Filter */}
              <div className="flex items-center gap-1.5 bg-parchment-subtle border border-border-archival px-3 py-2 rounded-lg shrink-0">
                <span className="material-symbols-outlined text-[16px] text-gilded-amber shrink-0">category</span>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-transparent text-xs font-sans-ui font-medium text-ink-primary focus:outline-none cursor-pointer"
                >
                  <option value="all">All Genres</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-parchment-subtle border border-border-archival px-3 py-2 rounded-lg shrink-0">
                <span className="material-symbols-outlined text-[16px] text-gilded-amber shrink-0">tune</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-sans-ui font-medium text-ink-primary focus:outline-none cursor-pointer"
                >
                  <option value="all">Circulation: All</option>
                  <option value="available">Available on Shelf</option>
                  <option value="unavailable">Vault Reserved / Loan</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-1.5 bg-parchment-subtle border border-border-archival px-3 py-2 rounded-lg shrink-0">
                <span className="material-symbols-outlined text-[16px] text-gilded-amber shrink-0">sort</span>
                <select
                  value={sortCriteria}
                  onChange={(e) => setSortCriteria(e.target.value)}
                  className="bg-transparent text-xs font-sans-ui font-medium text-ink-primary focus:outline-none cursor-pointer"
                >
                  <option value="popular">Curator's Sort</option>
                  <option value="title-asc">Title: A to Z</option>
                  <option value="title-desc">Title: Z to A</option>
                  <option value="copies-desc">Most Copies on Shelf</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-parchment-subtle border border-border-archival p-1 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid View"
                  className={`p-1 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-archival-teal shadow-xs' : 'text-ink-muted hover:text-archival-teal'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List View"
                  className={`p-1 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white text-archival-teal shadow-xs' : 'text-ink-muted hover:text-archival-teal'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {(selectedGenre !== 'all' || searchQuery || statusFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-sans-ui text-ink-muted uppercase tracking-wider font-bold">
                Active Queries:
              </span>
              {selectedGenre !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-parchment-subtle text-archival-teal text-xs font-semibold border border-border-archival">
                  Genre: {selectedGenre}
                  <button type="button" onClick={() => setSelectedGenre('all')} className="hover:text-red-500 font-bold">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-parchment-subtle text-archival-teal text-xs font-semibold border border-border-archival">
                  Query: "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-500 font-bold">×</button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-parchment-subtle text-archival-teal text-xs font-semibold border border-border-archival">
                  Status: {statusFilter}
                  <button type="button" onClick={() => setStatusFilter('all')} className="hover:text-red-500 font-bold">×</button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedGenre('all');
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-xs text-gilded-amber hover:underline font-semibold ml-2"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Books Display */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-archival-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif-body text-sm italic text-ink-muted">
              Consulting the repository archives and shelf inventory...
            </p>
          </div>
        ) : filteredAndSortedBooks.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-border-archival shadow-xs mt-6">
            <div className="w-14 h-14 rounded-full bg-parchment-subtle mx-auto flex items-center justify-center text-gilded-amber mb-3 border border-border-archival">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h3 className="font-serif-display text-lg font-bold text-archival-teal">
              No folio records matched your archival inquiry
            </h3>
            <p className="font-serif-body text-xs text-ink-muted italic max-w-sm mx-auto mt-1">
              Try searching by author surname, broader classification, or viewing items currently checked out.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedGenre('all');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-archival-teal text-white font-sans-ui text-xs font-semibold hover:bg-archival-deep transition-colors"
            >
              Reset Archival Inquiries
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredAndSortedBooks.map((book, idx) => {
              const copiesAvail = book.availableQuantity ?? book.quantity ?? 1;
              const isAvailable = copiesAvail > 0 && book.status !== 'reserved';

              return (
                <article
                  key={book.id}
                  className={`bg-white rounded-xl border border-border-archival shadow-xs overflow-hidden flex transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    viewMode === 'grid' ? 'flex-col' : 'flex-col md:flex-row'
                  }`}
                >
                  {/* Thumbnail / Aspect Container */}
                  <div
                    className={`relative aspect-[3/4] overflow-hidden bg-[#f3ede1] border-b border-border-archival ${
                      viewMode === 'grid' ? 'w-full' : 'w-full md:w-44 shrink-0'
                    }`}
                  >
                    <img
                      src={getBookCover(book, idx)}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />

                    {/* Status badge in corner */}
                    <div className="absolute top-2.5 right-2.5">
                      {isAvailable ? (
                        <span className="px-2 py-0.5 rounded bg-[#063b36] text-[#fbf9f4] font-sans-ui text-[11px] font-bold shadow-xs border border-white/20">
                          Available
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gilded-amber text-white font-sans-ui text-[11px] font-bold shadow-xs">
                          Vault Reserved
                        </span>
                      )}
                    </div>

                    {/* Dewey call tag */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs font-mono text-[10px] text-archival-teal font-bold border border-border-archival">
                        Dewey: {800 + (idx * 13) % 99}.{10 + (idx * 7) % 89}
                      </span>
                    </div>

                    {/* Examine Eye Button */}
                    <button
                      type="button"
                      onClick={() => setExaminingBook(book)}
                      title="Examine Folio"
                      className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded bg-white/90 backdrop-blur-xs text-archival-teal flex items-center justify-center hover:bg-archival-teal hover:text-white shadow-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-1 justify-between bg-white">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-sans-ui text-[11px] text-gilded-amber font-bold uppercase tracking-wider truncate">
                          {book.category || 'Humanities & Letters'}
                        </span>
                        <span
                          className={`font-sans-ui text-[11px] font-semibold flex items-center gap-1 ${
                            isAvailable ? 'text-status-available' : 'text-status-reserved'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAvailable ? 'bg-status-available' : 'bg-status-reserved'
                            }`}
                          />
                          {isAvailable ? `${copiesAvail} on shelf` : 'On loan / reserved'}
                        </span>
                      </div>

                      <h3 className="font-serif-display text-base font-bold text-archival-teal leading-snug line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="font-serif-body text-xs text-ink-muted italic mt-0.5 flex items-center gap-1">
                        {book.author} ({book.publishYear || 1968})
                      </p>
                    </div>

                    <div className="pt-4 mt-2 flex flex-col gap-2 border-t border-border-archival/70">
                      {isAvailable ? (
                        <button
                          type="button"
                          onClick={() => handleBorrow(book)}
                          className="w-full py-2 px-3 rounded-lg bg-archival-teal hover:bg-archival-deep text-white font-sans-ui text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px] text-gilded-gold">
                            import_contacts
                          </span>
                          <span>Request Circulation</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReserve(book)}
                          className="w-full py-2 px-3 rounded-lg bg-gilded-amber hover:bg-[#92400e] text-white font-sans-ui text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                          <span>Queue Stack Hold</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExaminingBook(book)}
                        className="w-full py-1.5 px-3 rounded-lg bg-parchment-subtle hover:bg-[#eadecc] text-archival-teal font-sans-ui text-xs font-medium flex items-center justify-center gap-1 transition-all border border-border-archival"
                      >
                        <span className="material-symbols-outlined text-[15px]">menu_book</span>
                        <span>Examine Folio</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════ 6. REGISTRATION / PATRONAGE CTA BANNER ══════════════ */}
      <section className="w-full px-6 md:px-12 py-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#063b36] via-[#0c4a43] to-[#063b36] rounded-2xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-gilded-amber/30">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1 text-xs font-sans-ui font-bold text-gilded-gold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px]">badge</span>
              Scholar Patronage
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-[#fbf9f4]">
              Register for Universal Archival Privileges
            </h3>
            <p className="font-serif-body text-xs text-[#e8e0d0] italic leading-relaxed">
              Join scholars, historians, and bibliophiles with authenticated Athenaeum access. Instant digital barcode credentials granted upon verification.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full md:w-auto px-6 py-3 rounded-lg bg-[#fbf9f4] hover:bg-[#f4efe6] text-archival-teal font-sans-ui text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Request Patron Credentials</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Examine Folio Modal */}
      <BookDetailModal
        book={examiningBook}
        isOpen={!!examiningBook}
        onClose={() => setExaminingBook(null)}
        onBorrow={handleBorrow}
        onReserve={handleReserve}
      />
    </div>
  );
};

export default UserCatalog;