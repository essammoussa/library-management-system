import { Fine } from '@/types/Fine';

interface FineCardProps {
  fine: Fine;
}

export default function FineCard({ fine }: FineCardProps) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{fine.bookTitle}</h3>
        <p className="text-sm text-muted-foreground">{fine.memberName}</p>
        <p className="text-sm">Due: {fine.dueDate}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">${fine.fine.toFixed(2)}</p>
        <p className={fine.status === 'overdue' ? 'text-red-500' : 'text-green-500'}>
          {fine.status}
        </p>
      </div>
    </div>
  );
}
