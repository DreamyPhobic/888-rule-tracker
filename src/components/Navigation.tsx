
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTimeStore } from '../data/store';
import { Timer, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Navigation: React.FC = () => {
  const { activeEntry } = useTimeStore();
  
  return (
    <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-accent" />
            <h1 className="font-bold text-xl">888 Time Tracker</h1>
          </div>
          
          {activeEntry && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent"
              onClick={() => toast.info('Currently tracking time. Stop your current activity to view detailed insights.')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Tracking...
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
