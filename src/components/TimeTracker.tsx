
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
import { Calendar as CalendarIcon, Plus, Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface TimeTrackerProps {
  onActivityAdded?: () => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ onActivityAdded }) => {
  const { categories } = useTimeStore();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [duration, setDuration] = useState<string>('0.5'); // Default to 0.5 hours (30 minutes)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(), 'HH:mm')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to handle quick duration selection
  const handleQuickDuration = (hours: number) => {
    // Parse the current duration, or default to 0 if it's not a valid number
    const currentDuration = parseFloat(duration) || 0;
    // Add the specified hours to the current duration
    const newDuration = currentDuration + hours;
    // Update the duration state with the new value (with up to 2 decimal places)
    setDuration(newDuration.toFixed(2));
  };
  
  // Function to add an activity log entry
  const handleAddActivity = async () => {
    if (!user) {
      toast.error('You must be logged in to add activities');
      return;
    }
    
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    // Convert duration from hours to minutes for database storage
    const durationHours = parseFloat(duration);
    
    if (isNaN(durationHours) || durationHours <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }
    
    // Convert hours to minutes for storage
    const durationMinutes = Math.round(durationHours * 60);

    // Parse selected time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    
    // Create end time based on selected date and time
    const endTime = new Date(selectedDate);
    endTime.setHours(hours, minutes, 0, 0);
    
    // Calculate start time by subtracting duration
    const startTime = new Date(endTime.getTime() - durationMinutes * 60000);

    try {
      setIsSubmitting(true);
      
      // Insert data into Supabase
      const { error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          category_id: selectedCategory,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration: durationMinutes, // Store as minutes in database
          description: description || null
        });

      if (error) throw error;

      // Success notification
      toast.success(`Added ${categories.find(c => c.id === selectedCategory)?.name} activity`);
      
      // Reset form
      setSelectedCategory('');
      setDescription('');
      setDuration('0.5'); // Reset to default 0.5 hours
      
      // Call the onActivityAdded callback to refresh the summary
      if (onActivityAdded) {
        onActivityAdded();
      }
      
    } catch (error: any) {
      toast.error(`Error adding activity: ${error.message}`);
      console.error('Error adding time entry:', error);
    } finally {
      setIsSubmitting(false);
    }
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
        
        <div className="flex flex-col space-y-3">
          {/* Date picker */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Time picker */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">End Time</label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Duration input with quick selection buttons */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Duration</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Duration in hours"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
            
            {/* Quick duration selection buttons */}
            <div className="flex gap-2 mt-2">
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={() => handleQuickDuration(0.5)}
                className="flex-1"
              >
                <Clock className="mr-1 h-3 w-3" />
                +0.5h
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={() => handleQuickDuration(1)}
                className="flex-1"
              >
                <Clock className="mr-1 h-3 w-3" />
                +1h
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={() => handleQuickDuration(3)}
                className="flex-1"
              >
                <Clock className="mr-1 h-3 w-3" />
                +3h
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          {format(new Date(new Date(selectedDate).setHours(
            ...selectedTime.split(':').map(Number) as [number, number]
          )).getTime() - Math.round(parseFloat(duration || '0') * 60) * 60000, 'h:mm a')} - {
            format(new Date(selectedDate).setHours(
              ...selectedTime.split(':').map(Number) as [number, number]
            ), 'h:mm a')
          }
        </div>
        
        <Button 
          onClick={handleAddActivity} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Activity'}
        </Button>
      </div>
    </div>
  );
};

export default TimeTracker;
