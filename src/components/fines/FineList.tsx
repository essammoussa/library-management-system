import React from 'react';
import FineCard from '@/components/fines/FineCard';
import { Fine } from '@/types/Fine';

interface Props {
  fines: Fine[];
  onUpdate?: (fine: Fine) => void;
}

const FineList: React.FC<Props> = ({ fines, onUpdate }) => {
  return (
    <div className="space-y-4">
      {fines.map((fine) => (
        <FineCard key={fine.id} fine={fine} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default FineList;
