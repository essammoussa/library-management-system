import { useState, useEffect } from 'react';
import { 
  Plus, Search, Loader2, Clock, DollarSign, AlertCircle, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { Fine, FineStatus } from '../types/Fine';
import { finesService } from '../services/finesService';
import { FineCalculator } from '../lib/fineCalculator';
import { FineForm } from '../components/fines/FineForm';
import { FineTablerow } from "@/components/fines/FineTablerow";
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
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FinesList() {
  const { toast } = useToast();
  // --- State declarations ---
  const [fines, setFines] = useState<Fine[]>([]); // all fines
  const [filteredFines, setFilteredFines] = useState<Fine[]>([]); // fines after search/filter
  const [loading, setLoading] = useState(true); // loading state
  const [searchQuery, setSearchQuery] = useState(''); // search input
  const [statusFilter, setStatusFilter] = useState<FineStatus | 'all'>('all'); // filter by status
  const [showCreateModal, setShowCreateModal] = useState(false); // show/hide create fine modal
  const [editingFine, setEditingFine] = useState<Fine | null>(null); // fine being edited
  const [isSubmitting, setIsSubmitting] = useState(false); // submission state
  const [selectedFines, setSelectedFines] = useState<Set<string>>(new Set()); // selected fines for bulk actions

  // State for Confirmations
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // State for Waive Reason Prompt
  const [waiveConfig, setWaiveConfig] = useState<{
    open: boolean;
    fineId: string | null;
    reason: string;
  }>({
    open: false,
    fineId: null,
    reason: "",
  });

  // --- Calculate statistics for dashboard cards ---
  const stats = FineCalculator.calculateStatistics(fines);

  // --- Load fines on component mount ---
  useEffect(() => {
    loadFines();
  }, []);

  // --- Re-filter fines whenever data, search, or filter changes ---
  useEffect(() => {
    filterFines();
  }, [fines, searchQuery, statusFilter]);

  // --- Load fines from the service ---
  const loadFines = async () => {
    setLoading(true);
    try {
      const data = await finesService.getAllFines();
      setFines([...data]); // force new array to trigger re-render
      filterFines([...data]); // apply search & filter immediately
    } catch (error) {
      console.error('Error loading fines:', error);
      toast({ title: 'Error', description: 'Failed to load fines', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- Filter fines by search query and status ---
  const filterFines = (finesToFilter?: Fine[]) => {
    const source = finesToFilter || fines;
    let filtered = [...source];

    // Search by member, email, book, or fine ID
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        f =>
          f.memberName.toLowerCase().includes(query) ||
          f.memberEmail.toLowerCase().includes(query) ||
          f.bookTitle.toLowerCase().includes(query) ||
          f.id.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    // Sort newest fines first
    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredFines([...filtered]); // update state to trigger re-render
  };

  // --- Handlers for creating and updating fines ---
  const handleCreateFine = async (fineData: Omit<Fine, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    try {
      await finesService.createFine(fineData);
      await loadFines(); // reload fines after creation
      setShowCreateModal(false);
      toast({ title: 'Success', description: 'Fine created successfully!' });
    } catch (error) {
      console.error('Error creating fine:', error);
      toast({ title: 'Error', description: 'Failed to create fine', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFine = async (fineData: Omit<Fine, 'id' | 'createdAt'>) => {
    if (!editingFine) return;
    setIsSubmitting(true);
    try {
      await finesService.updateFine(editingFine.id, fineData);
      await loadFines();
      setEditingFine(null);
      toast({ title: 'Success', description: 'Fine updated successfully!' });
    } catch (error) {
      console.error('Error updating fine:', error);
      toast({ title: 'Error', description: 'Failed to update fine', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers for deleting, paying, and waiving fines ---
  const handleDeleteFine = (id: string) => {
    setConfirmConfig({
      open: true,
      title: "Delete Fine",
      description: "Are you sure you want to delete this fine?",
      onConfirm: async () => {
        try {
          await finesService.deleteFine(id);
          await loadFines();
          toast({ title: 'Success', description: 'Fine deleted successfully!' });
        } catch (error) {
          console.error('Error deleting fine:', error);
          toast({ title: 'Error', description: 'Failed to delete fine', variant: 'destructive' });
        }
      }
    });
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await finesService.markAsPaid(id, 'Payment received');
      await loadFines();
      toast({ title: 'Success', description: 'Fine marked as paid!' });
    } catch (error) {
      console.error('Error marking fine as paid:', error);
      toast({ title: 'Error', description: 'Failed to mark fine as paid', variant: 'destructive' });
    }
  };

  const handleWaiveFine = (id: string) => {
    setWaiveConfig({
      open: true,
      fineId: id,
      reason: "",
    });
  };

  const confirmWaiveFine = async () => {
    if (!waiveConfig.fineId || !waiveConfig.reason) return;
    try {
      await finesService.waiveFine(waiveConfig.fineId, waiveConfig.reason, 'admin');
      await loadFines();
      toast({ title: 'Success', description: 'Fine waived successfully!' });
      setWaiveConfig({ open: false, fineId: null, reason: "" });
    } catch (error) {
      console.error('Error waiving fine:', error);
      toast({ title: 'Error', description: 'Failed to waive fine', variant: 'destructive' });
    }
  };

  // --- Bulk delete selected fines ---
  const handleBulkDelete = () => {
    if (selectedFines.size === 0) {
      toast({ title: 'Warning', description: 'No fines selected' });
      return;
    }
    setConfirmConfig({
      open: true,
      title: "Bulk Delete",
      description: `Are you sure you want to delete ${selectedFines.size} fines?`,
      onConfirm: async () => {
        try {
          await finesService.bulkDeleteFines(Array.from(selectedFines));
          await loadFines();
          setSelectedFines(new Set());
          toast({ title: 'Success', description: 'Fines deleted successfully!' });
        } catch (error) {
          console.error('Error deleting fines:', error);
          toast({ title: 'Error', description: 'Failed to delete fines', variant: 'destructive' });
        }
      }
    });
  };

  // --- Toggle single fine selection ---
  const toggleSelectFine = (id: string) => {
    const newSelected = new Set(selectedFines);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedFines(newSelected);
  };

  // --- Toggle select all fines ---
  const toggleSelectAll = () => {
    if (selectedFines.size === filteredFines.length) {
      setSelectedFines(new Set());
    } else {
      setSelectedFines(new Set(filteredFines.map(f => f.id)));
    }
  };

  // --- Loading screen while fetching fines ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading fines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add & Refresh buttons */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-5xl font-extrabold text-foreground tracking-tighter mb-2">Revenue <span className="text-primary italic">Control</span></h1>
          <p className="text-lg text-muted-foreground/60">Manage library fines, payments, and financial records.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadFines}
            className="flex items-center space-x-2 px-5 py-2.5 border border-border/50 rounded-2xl hover:bg-accent transition-all font-bold text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total fines */}
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Total Active</span>
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-foreground tracking-tight">{stats.totalFines}</p>
          <p className="text-xs text-muted-foreground/50 mt-1 font-medium">All recorded entries</p>
        </div>

        {/* Pending fines */}
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-lg shadow-yellow-500/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Outstanding</span>
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 tracking-tight">
            {FineCalculator.formatCurrency(stats.pendingAmount)}
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1 font-medium">
            {stats.totalPending + stats.totalOverdue} cases pending
          </p>
        </div>

        {/* Collected fines */}
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Revenue</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {FineCalculator.formatCurrency(stats.paidAmount)}
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1 font-medium">{stats.totalPaid} settled transactions</p>
        </div>

        {/* Waived fines */}
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-lg shadow-violet-500/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Waivers</span>
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-500">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400 tracking-tight">
            {FineCalculator.formatCurrency(stats.waivedAmount)}
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1 font-medium">{stats.totalWaived} approved waivers</p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by member, email, book, or fine ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FineStatus | 'all')}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Results count and bulk delete */}
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredFines.length} of {fines.length} fines
          </span>
          {selectedFines.size > 0 && (
            <button onClick={handleBulkDelete} className="text-destructive hover:underline">
              Delete {selectedFines.size} selected
            </button>
          )}
        </div>
      </div>

      {/* Fines Table */}
      {filteredFines.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No fines found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No fines have been created yet'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {/* Select all checkbox */}
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFines.size === filteredFines.length}
                      onChange={toggleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  {/* Table headers */}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Fine ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Member</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Book</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Days Overdue</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFines.map((fine) => (
                  <FineTablerow
                    key={fine.id}
                    fine={fine}
                    isSelected={selectedFines.has(fine.id)}
                    onToggleSelect={() => toggleSelectFine(fine.id)}
                    onEdit={() => setEditingFine(fine)}
                    onDelete={() => handleDeleteFine(fine.id)}
                    onMarkAsPaid={() => handleMarkAsPaid(fine.id)}
                    onWaive={() => handleWaiveFine(fine.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fine Create/Edit Modal */}
      {(showCreateModal || editingFine) && (
        <FineForm
          fine={editingFine || undefined}
          onSave={editingFine ? handleUpdateFine : handleCreateFine}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingFine(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmConfig.open} onOpenChange={(val) => setConfirmConfig(prev => ({ ...prev, open: val }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConfig.onConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Waive Prompt Dialog */}
      <Dialog open={waiveConfig.open} onOpenChange={(val) => setWaiveConfig(prev => ({ ...prev, open: val }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive Fine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Waiver Reason</Label>
              <Input
                id="reason"
                placeholder="Enter reason for waiving this fine"
                value={waiveConfig.reason}
                onChange={(e) => setWaiveConfig(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaiveConfig(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button onClick={confirmWaiveFine} disabled={!waiveConfig.reason}>Confirm Waive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
