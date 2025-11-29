import React, { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { Fine, FineStatus } from '@/types/Fine';
import { FineCalculator } from '@/lib/fineCalculator';

interface FineFormProps {
  fine?: Fine; // If provided, edit mode. Otherwise, create mode
  onSave: (fineData: Omit<Fine, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FineForm({ fine, onSave, onCancel, isSubmitting = false }: FineFormProps) {
  const isEditMode = !!fine;

  // Form state
  const [formData, setFormData] = useState({
    memberId: fine?.memberId || '',
    memberName: fine?.memberName || '',
    memberEmail: fine?.memberEmail || '',
    bookId: fine?.bookId || '',
    bookTitle: fine?.bookTitle || '',
    borrowDate: fine?.borrowDate || '',
    dueDate: fine?.dueDate || '',
    returnDate: fine?.returnDate || '',
    daysOverdue: fine?.daysOverdue || 0,
    fineAmount: fine?.fineAmount || 0,
    status: fine?.status || 'pending' as FineStatus,
    notes: fine?.notes || '',
  });

  // Auto-calculate fine when dates change
  useEffect(() => {
    if (formData.dueDate) {
      const { daysOverdue, fineAmount } = FineCalculator.calculateFine(
        formData.dueDate,
        formData.returnDate || undefined
      );
      setFormData(prev => ({
        ...prev,
        daysOverdue,
        fineAmount,
      }));
    }
  }, [formData.dueDate, formData.returnDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-2xl font-bold text-foreground">
            {isEditMode ? 'Edit Fine' : 'Create New Fine'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-accent rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Member Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Member Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Member ID *
                </label>
                <input
                  type="text"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="M001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Member Name *
                </label>
                <input
                  type="text"
                  name="memberName"
                  value={formData.memberName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="John Doe"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Member Email *
                </label>
                <input
                  type="email"
                  name="memberEmail"
                  value={formData.memberEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Book Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Book ID *
                </label>
                <input
                  type="text"
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="B001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  name="bookTitle"
                  value={formData.bookTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                  placeholder="1984"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Borrow Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Borrow Date *
                </label>
                <input
                  type="date"
                  name="borrowDate"
                  value={formData.borrowDate.split('T')[0]}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate.split('T')[0]}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate ? formData.returnDate.split('T')[0] : ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Fine Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Fine Calculation</h3>
            </div>
            <div className="bg-accent/50 border border-border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Days Overdue:</span>
                  <p className="text-lg font-semibold text-foreground">{formData.daysOverdue}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fine Amount:</span>
                  <p className="text-lg font-semibold text-foreground">
                    {FineCalculator.formatCurrency(formData.fineAmount)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Rate: ${1.00}/day • Maximum: $50.00
              </p>
            </div>
          </div>

          {/* Status and Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring resize-none"
                placeholder="Additional notes about this fine..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : (isEditMode ? 'Update Fine' : 'Create Fine')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}