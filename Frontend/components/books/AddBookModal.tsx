import React, { useState } from 'react';
import { bookApi } from '@/api/bookApi';
import { Book } from '@/data/books';
import { useToast } from '@/hooks/use-toast';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded?: (newBook: Book) => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onBookAdded,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [fetchingIsbn, setFetchingIsbn] = useState(false);

  // Form State
  const [isbn, setIsbn] = useState('978-0441478125');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishYear, setPublishYear] = useState<number>(new Date().getFullYear());
  const [category, setCategory] = useState('Fiction');
  const [language, setLanguage] = useState('English (EN-US)');
  const [binding, setBinding] = useState('Hardcover / Clothbound');
  
  // Tab 2: Stacks & Dewey
  const [dewey, setDewey] = useState('813.54');
  const [wing, setWing] = useState('West Wing • Tier 3 (Modern Lit)');
  const [privilege, setPrivilege] = useState('Open Circulating Stacks');

  // Tab 3: Copies
  const [copies, setCopies] = useState<number>(3);
  const [condition, setCondition] = useState('Pristine / Mint Accession');

  // Tab 4: Dust jacket & Abstract
  const [image, setImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop');
  const [description, setDescription] = useState('');
  const [subjectTags, setSubjectTags] = useState<string[]>([
    '#ArchivalCanon',
    '#Literature',
    '#HeritageCollection'
  ]);
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  // Auto-fetch metadata via OpenLibrary API
  const handleAutoFetch = async () => {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    if (!cleanIsbn) {
      toast({
        title: "Invalid ISBN",
        description: "Please enter a valid ISBN-10 or ISBN-13.",
        variant: "destructive",
      });
      return;
    }

    setFetchingIsbn(true);
    try {
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      const data = await res.json();
      const bookData = data[`ISBN:${cleanIsbn}`];

      if (bookData) {
        if (bookData.title) setTitle(bookData.title);
        if (bookData.subtitle) setSubtitle(bookData.subtitle);
        if (bookData.authors && bookData.authors.length > 0) {
          setAuthor(bookData.authors.map((a: any) => a.name).join(', '));
        }
        if (bookData.publish_date) {
          const yearMatch = bookData.publish_date.match(/\d{4}/);
          if (yearMatch) setPublishYear(parseInt(yearMatch[0], 10));
        }
        if (bookData.publishers && bookData.publishers.length > 0) {
          setPublisher(bookData.publishers[0].name);
        }
        if (bookData.cover?.large || bookData.cover?.medium) {
          setImage(bookData.cover.large || bookData.cover.medium);
        }
        if (bookData.subjects && bookData.subjects.length > 0) {
          setSubjectTags(bookData.subjects.slice(0, 5).map((s: any) => `#${s.name.replace(/\s+/g, '')}`));
        }

        toast({
          title: "Metadata Retrieved",
          description: `Successfully loaded metadata for "${bookData.title}".`,
        });
      } else {
        toast({
          title: "No Catalog Record Found",
          description: "No record found on OpenLibrary. You can fill the details manually.",
        });
      }
    } catch (err) {
      toast({
        title: "Catalog Query Warning",
        description: "Could not connect to external catalog. Please fill manually.",
      });
    } finally {
      setFetchingIsbn(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const formatted = newTag.startsWith('#') ? newTag.trim() : `#${newTag.trim()}`;
      if (!subjectTags.includes(formatted)) {
        setSubjectTags([...subjectTags, formatted]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSubjectTags(subjectTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      toast({
        title: "Required Fields Missing",
        description: "Please provide both book title and author.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newBookPayload: Omit<Book, "id"> = {
        title,
        author,
        isbn,
        category,
        status: "available",
        publishYear: Number(publishYear) || 2024,
        quantity: copies,
        availableQuantity: copies,
        image,
      };

      const created = await bookApi.create(newBookPayload);

      toast({
        title: "Accession Complete",
        description: `"${title}" has been registered into the repository archives.`,
      });

      if (onBookAdded) {
        onBookAdded(created);
      }
      onClose();
    } catch (err: any) {
      toast({
        title: "Accession Error",
        description: err.response?.data?.message || "Failed to register book into catalog.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans-ui">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[880px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] border border-border-archival"
      >
        {/* MODAL HEADER */}
        <div className="px-6 sm:px-8 pt-6 pb-4 bg-white border-b border-border-archival/60 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-[#e6f4f2] text-archival-teal border border-[#bbf7d0]">
                Cataloging &amp; Accession
              </span>
              <span className="text-[11px] text-ink-muted">• Terminal Desk B-02</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-parchment-subtle text-ink-muted text-[10px] font-mono border border-border-archival">
                ESC to dismiss
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-parchment-subtle transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
          <div className="mt-1">
            <h2 className="font-serif-display text-2xl font-bold text-archival-teal tracking-tight">
              Add New Tome to Repository
            </h2>
            <p className="font-serif-body text-xs italic text-ink-muted mt-0.5">
              Index bibliographic metadata, Dewey Decimal classification, shelf location, and physical copy inventory.
            </p>
          </div>
        </div>

        {/* WORKFLOW TABS */}
        <div className="px-6 sm:px-8 bg-[#f8fafc] border-b border-border-archival flex items-center gap-2 overflow-x-auto">
          {[
            { id: 1, name: "1. Core Metadata", icon: "menu_book" },
            { id: 2, name: "2. Stacks & Dewey", icon: "account_tree" },
            { id: 3, name: "3. Physical Copies", icon: "barcode_scanner" },
            { id: 4, name: "4. Dust Jacket & Abstract", icon: "photo_library" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "text-archival-teal font-bold shadow-[inset_0_-2px_0_#0f766e] bg-white/60"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 sm:px-8 py-6 space-y-6 bg-white">
            {/* Auto-fetch Accelerator Bar */}
            <div className="p-3.5 rounded-lg bg-parchment-subtle border border-border-archival flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gilded-amber text-[20px]">
                  qr_code_scanner
                </span>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="Scan or enter ISBN-10 / ISBN-13 (e.g. 978-0441478125)"
                  className="w-full bg-white text-ink-primary pl-10 pr-4 py-2 rounded-md text-xs border border-border-archival placeholder:text-ink-muted/70 focus:outline-none focus:ring-1 focus:ring-archival-teal"
                />
              </div>
              <button
                type="button"
                onClick={handleAutoFetch}
                disabled={fetchingIsbn}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gilded-amber hover:bg-[#92400e] text-white rounded-md text-xs font-semibold transition-all shadow-xs shrink-0 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {fetchingIsbn ? 'refresh' : 'bolt'}
                </span>
                <span>{fetchingIsbn ? 'Querying Catalog...' : 'Auto-fetch OpenLibrary'}</span>
              </button>
            </div>

            {/* TAB 1: Core Metadata */}
            {activeTab === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-archival-teal tracking-wider">
                    Bibliographic Records
                  </span>
                  <span className="text-[11px] text-ink-muted font-serif-body italic">
                    * Indicates mandatory archival fields
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Tome / Work Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. The Left Hand of Darkness"
                      className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Subtitle / Series Context
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. 50th Anniversary Critical Study Edition"
                      className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Primary Author(s) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Ursula K. Le Guin"
                      className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Publisher &amp; Imprint
                    </label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="e.g. Ace Science Fiction Classics / Berkley"
                      className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-ink-primary mb-1">
                        Year of Pub.
                      </label>
                      <input
                        type="number"
                        value={publishYear}
                        onChange={(e) => setPublishYear(Number(e.target.value))}
                        className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-primary mb-1">
                        Discipline / Genre
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white text-ink-primary px-2 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                      >
                        <option value="Fiction">Fiction</option>
                        <option value="Classic">Classics</option>
                        <option value="Science Fiction">Science Fiction</option>
                        <option value="Fantasy">Epic Fantasy</option>
                        <option value="History">History &amp; Archive</option>
                        <option value="Philosophy">Philosophy</option>
                        <option value="Science">Physical Sciences</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Primary Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    >
                      <option value="English (EN-US)">English (EN-US)</option>
                      <option value="French (FR)">French (FR)</option>
                      <option value="German (DE)">German (DE)</option>
                      <option value="Latin (LAT)">Classical Latin (LAT)</option>
                      <option value="Arabic (AR)">Classical Arabic (AR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Physical Binding Format
                    </label>
                    <select
                      value={binding}
                      onChange={(e) => setBinding(e.target.value)}
                      className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    >
                      <option value="Hardcover / Clothbound">Hardcover / Clothbound</option>
                      <option value="Trade Paperback">Trade Paperback</option>
                      <option value="Archival Folio (Leather)">Archival Folio (Leather)</option>
                      <option value="Microfiche / Facsimile">Microfiche / Digitized Facsimile</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Stacks & Dewey */}
            {activeTab === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-archival-teal tracking-wider">
                    Classification &amp; Spatial Stacks Assignment
                  </span>
                  <span className="text-[11px] text-ink-muted font-serif-body italic">
                    Dewey Decimal &amp; LC Hybrid System
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Dewey Call Number
                    </label>
                    <input
                      type="text"
                      value={dewey}
                      onChange={(e) => setDewey(e.target.value)}
                      className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival uppercase font-mono focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    />
                    <span className="text-[11px] text-ink-muted mt-1 block">
                      800 Literature • 813 American Fiction
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Wing &amp; Tier Allocation
                    </label>
                    <select
                      value={wing}
                      onChange={(e) => setWing(e.target.value)}
                      className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    >
                      <option value="West Wing • Tier 3 (Modern Lit)">West Wing • Tier 3 (Modern Lit)</option>
                      <option value="East Rotunda • Vault A (Rare Folios)">East Rotunda • Vault A (Rare Folios)</option>
                      <option value="North Mezzanine • Periodicals">North Mezzanine • Periodicals &amp; Essays</option>
                      <option value="South Annex • Academic Monographs">South Annex • Academic Monographs</option>
                    </select>
                    <span className="text-[11px] text-ink-muted mt-1 block">
                      Shelf Bay: B-14, Tier Level 2
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Access Privilege Policy
                    </label>
                    <select
                      value={privilege}
                      onChange={(e) => setPrivilege(e.target.value)}
                      className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    >
                      <option value="Open Circulating Stacks">Open Circulating Stacks</option>
                      <option value="Restricted Reading Room Only">Restricted Reading Room Only</option>
                      <option value="Curator Permission Required">Curator Permission Required</option>
                      <option value="Preservation Quarantine">Preservation Quarantine</option>
                    </select>
                    <span className="text-[11px] text-[#059669] font-semibold mt-1 block">
                      Standard 28-day patron loan
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Physical Copies */}
            {activeTab === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-archival-teal tracking-wider">
                    Physical Copy Inventory &amp; Sequential RFID Barcodes
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold">
                    Auto-indexer active
                  </span>
                </div>

                <div className="bg-parchment-subtle p-5 rounded-xl border border-border-archival space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-xs font-semibold text-ink-primary mb-1">
                        Initial Copy Count
                      </label>
                      <div className="flex items-center bg-white rounded-md border border-border-archival w-fit">
                        <button
                          type="button"
                          onClick={() => setCopies(Math.max(1, copies - 1))}
                          className="px-3 py-1 text-ink-muted hover:text-ink-primary font-bold text-base"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 text-xs font-bold text-archival-teal">
                          {copies} Copies
                        </span>
                        <button
                          type="button"
                          onClick={() => setCopies(copies + 1)}
                          className="px-3 py-1 text-ink-muted hover:text-ink-primary font-bold text-base"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-primary mb-1">
                        Accession Condition
                      </label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                      >
                        <option value="Pristine / Mint Accession">Pristine / Mint Accession</option>
                        <option value="Good / Minor Shelf Wear">Good / Minor Shelf Wear</option>
                        <option value="Archival Rebind Required">Archival Rebind Required</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-primary mb-1">
                        RFID Barcode Sequence
                      </label>
                      <div className="text-xs font-mono font-bold text-archival-teal flex items-center gap-1 bg-white px-3 py-2 rounded-md border border-border-archival">
                        <span className="material-symbols-outlined text-[16px]">pin</span>
                        ATH-99201 → ATH-9920{copies}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-archival/60">
                    {Array.from({ length: Math.min(copies, 5) }).map((_, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-border-archival rounded text-[11px] text-ink-muted flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-status-available" />
                        Copy {idx + 1}: #ATH-9920{idx + 1} (Main Stacks)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Dust Jacket & Abstract */}
            {activeTab === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-archival-teal tracking-wider">
                    Dust Jacket &amp; Curatorial Abstract
                  </span>
                  <span className="text-[11px] text-ink-muted font-serif-body italic">
                    Digital Asset Ingestion
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Cover URL / Preview */}
                  <div className="md:col-span-4 flex flex-col gap-2">
                    <div className="relative h-56 bg-parchment-subtle rounded-xl overflow-hidden border border-border-archival flex flex-col items-center justify-center p-2 text-center shadow-xs">
                      {image ? (
                        <img
                          src={image}
                          alt="Dust jacket scan preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-ink-muted">
                          <span className="material-symbols-outlined text-4xl mb-1">image</span>
                          <span className="text-xs">No Cover Image</span>
                        </div>
                      )}
                    </div>
                    <label className="block text-[11px] font-semibold text-ink-primary">
                      Image URL:
                    </label>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white text-ink-primary px-2.5 py-1.5 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal"
                    />
                  </div>

                  {/* Curatorial Abstract & Tags */}
                  <div className="md:col-span-8 flex flex-col gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-ink-primary">
                          Curatorial Summary &amp; Synopsis
                        </label>
                        <span className="text-[11px] text-ink-muted font-mono">
                          {description.length} / 1,000 chars
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide an editorial overview of the work, thesis, historical context, or critical evaluation..."
                        className="w-full bg-white text-ink-primary px-3 py-2 rounded-md text-xs border border-border-archival focus:outline-none focus:ring-1 focus:ring-archival-teal resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-primary mb-1">
                        Subject Headings &amp; Controlled Thematic Lexicon
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-parchment-subtle border border-border-archival rounded-md">
                        {subjectTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-archival-teal text-[11px] font-medium border border-border-archival"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-ink-muted hover:text-red-500 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                            placeholder="+ Add tag..."
                            className="bg-transparent text-xs text-ink-primary focus:outline-none px-1.5 py-0.5"
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="text-[11px] font-bold text-archival-teal hover:underline"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MODAL FOOTER */}
          <div className="px-6 sm:px-8 py-4 bg-[#f8fafc] border-t border-border-archival flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
              <span className="text-[11px] text-ink-muted">
                Archival draft verified &amp; staged
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-parchment-subtle text-ink-muted rounded-lg text-xs font-semibold transition-colors border border-border-archival shadow-xs"
              >
                Cancel
              </button>
              
              {activeTab < 4 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-archival-teal hover:bg-archival-deep text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                >
                  <span>Next Step</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-[#0f766e] hover:bg-archival-deep text-white rounded-lg text-xs font-semibold transition-all shadow-md disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">post_add</span>
                  <span>{loading ? 'Registering...' : 'Accession & Register Book'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
