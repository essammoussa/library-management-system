import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, CheckCircle, Ban, Eye } from 'lucide-react';
import { Fine } from '@/types/Fine';
import { FineCalculator } from '@/lib/fineCalculator';

interface FineTableRowProps {
  fine: Fine; // The fine object to display in this row
  isSelected: boolean; // Whether this row is currently selected (checkbox)
  onToggleSelect: () => void; // Callback for checkbox toggle
  onEdit: () => void; // Callback to edit this fine
  onDelete: () => void; // Callback to delete this fine
  onMarkAsPaid: () => void; // Callback to mark this fine as paid
  onWaive: () => void; // Callback to waive this fine
}

export function FineTablerow({
  fine,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onMarkAsPaid,
  onWaive,
}: FineTableRowProps) {
  const [showActions, setShowActions] = useState(false); // For toggling extra action buttons if needed

  // Determine which actions are allowed based on current fine status
  const canMarkAsPaid = fine.status === 'pending' || fine.status === 'overdue';
  const canWaive = fine.status === 'pending' || fine.status === 'overdue';

  return (
    // Table row with hover highlight
    <tr className="hover:bg-accent/50 transition">
      
      {/* --- Selection Checkbox --- */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="rounded border-border"
        />
      </td>

      {/* --- Fine ID --- */}
      <td className="px-4 py-3">
        <span className="text-sm font-mono text-foreground">{fine.id}</span>
      </td>

      {/* --- Member Info: Name + Email --- */}
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{fine.memberName}</p>
          <p className="text-xs text-muted-foreground">{fine.memberEmail}</p>
        </div>
      </td>

      {/* --- Book Title --- */}
      <td className="px-4 py-3">
        <p className="text-sm text-foreground line-clamp-2 max-w-xs">
          {fine.bookTitle}
        </p>
      </td>

      {/* --- Due Date --- */}
      <td className="px-4 py-3">
        <p className="text-sm text-foreground">
          {FineCalculator.formatDate(fine.dueDate)}
        </p>
      </td>

      {/* --- Days Overdue with color coding --- */}
      <td className="px-4 py-3">
        <span className={`text-sm font-semibold ${
          fine.daysOverdue > 14 ? 'text-red-600' : 
          fine.daysOverdue > 7 ? 'text-yellow-600' : 
          'text-foreground'
        }`}>
          {fine.daysOverdue} days
        </span>
      </td>

      {/* --- Fine Amount --- */}
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-foreground">
          {FineCalculator.formatCurrency(fine.fineAmount)}
        </span>
      </td>

      {/* --- Status Badge with color --- */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          FineCalculator.getStatusColor(fine.status)
        }`}>
          {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
        </span>
      </td>

      {/* --- Action Buttons --- */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">

          {/* Mark as Paid button (only if allowed) */}
          {canMarkAsPaid && (
            <button
              onClick={onMarkAsPaid}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
              title="Mark as Paid"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          {/* Waive Fine button (only if allowed) */}
          {canWaive && (
            <button
              onClick={onWaive}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
              title="Waive Fine"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}

          {/* Edit button */}
          <button
            onClick={onEdit}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Delete button */}
          <button
            onClick={onDelete}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>

        </div>
      </td>
    </tr>
  );
}
