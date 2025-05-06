
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
import { Clock, Calendar, Plus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';

const TimeTracker: React.FC = () => {
  const { categories, addTimeEntry } = useTimeStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [duration, setDuration] = useState<string>('30');
  
  // Function to add an activity log entry
  const handleAddActivity = () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    // Convert duration from string to number
    const durationMinutes = parseInt(duration, 10);
    
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    // Calculate start and end time
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - durationMinutes * 60000);

    // Add the entry directly
    addTimeEntry({
      categoryId: selectedCategory,
      startTime,
      endTime,
      duration: durationMinutes,
      description
    });

    // Success notification
    toast.success(`Added ${categories.find(c => c.id === selectedCategory)?.name} activity`);
    
    // Reset form
    setSelectedCategory('');
    setDescription('');
    setDuration('30');
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Plus className="w-5 h-5 mr-2" />
        Add Activity
      </h2>
      
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
          placeholder="What did you do? (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            placeholder="Duration in minutes"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">minutes</span>
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          {format(new Date(new Date().getTime() - parseInt(duration || '0', 10) * 60000), 'h:mm a')} - {format(new Date(), 'h:mm a')}
        </div>
        
        <Button onClick={handleAddActivity} className="w-full">
          Add Activity
        </Button>
      </div>
    </div>
  );
};

export default TimeTracker;
