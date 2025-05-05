
import React, { useState } from 'react';
import { useTimeStore } from '../data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const TimeTracker: React.FC = () => {
  const { categories, activeEntry, startActivity, stopActivity } = useTimeStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleStart = () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    startActivity(selectedCategory, description);
    toast.success(`Started tracking ${categories.find(c => c.id === selectedCategory)?.name}`);
  };

  const handleStop = () => {
    stopActivity();
    toast.success('Activity stopped and saved');
    setSelectedCategory('');
    setDescription('');
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        {activeEntry ? 'Currently Tracking' : 'Start Tracking'}
      </h2>
      
      {activeEntry ? (
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-secondary rounded-lg">
            <div 
              className="w-4 h-4 rounded-full mr-3" 
              style={{ 
                backgroundColor: categories.find(c => c.id === activeEntry.categoryId)?.color || '#ccc'
              }} 
            />
            <div className="flex-1">
              <p className="font-medium">
                {categories.find(c => c.id === activeEntry.categoryId)?.name}
              </p>
              {activeEntry.description && (
                <p className="text-sm text-muted-foreground">{activeEntry.description}</p>
              )}
            </div>
            <Timer startTime={activeEntry.startTime} />
          </div>
          
          <Button onClick={handleStop} variant="destructive" className="w-full">
            Stop Activity
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Select onValueChange={setSelectedCategory} value={selectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }} 
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="What are you doing? (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          
          <Button onClick={handleStart} className="w-full">
            Start Activity
          </Button>
        </div>
      )}
    </div>
  );
};

// Timer component to show elapsed time
const Timer: React.FC<{ startTime: Date }> = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - startTime.getTime();
      
      // Format as HH:MM:SS
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
      
      const formattedTime = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');
      
      setElapsedTime(formattedTime);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [startTime]);
  
  return (
    <div className="text-lg font-mono">{elapsedTime}</div>
  );
};

export default TimeTracker;
