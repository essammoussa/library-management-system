import { useState, useEffect } from 'react';
import FineCard from '@/components/fines/FineCard';
import { finesMock } from '@/services/fines';
import { Fine } from '@/types/Fine';

export default function FineList() {
  const [fines, setFines] = useState<Fine[]>([]);

  useEffect(() => {
    // Load mock data directly
    setFines(finesMock);
  }, []);

  if (fines.length === 0) return <p>No fines found.</p>;

  return (
    <div className="space-y-4">
      {fines.map(f => <FineCard key={f.id} fine={f} />)}
    </div>
  );
}
