import React from 'react';
import { Navigation2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PoiActionsProps {
  onGetDirections?: () => void;
}

export const PoiActions: React.FC<PoiActionsProps> = React.memo(({ onGetDirections }) => {
  if (!onGetDirections) return null;

  return (
    <div className="px-4 py-3 border-t border-border/50">
      <Button
        onClick={onGetDirections}
        className="w-full gap-2 font-semibold"
        size="default"
      >
        <Navigation2 size={16} />
        Chỉ đường
      </Button>
    </div>
  );
});
