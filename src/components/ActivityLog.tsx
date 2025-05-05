
import React from 'react';
import { useTimeStore } from '../data/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';

interface ActivityLogProps {
  date: Date;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ date }) => {
  const { getEntriesForDate, categories, deleteTimeEntry } = useTimeStore();
  const entries = getEntriesForDate(date).filter(entry => entry.endTime);
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleDelete = (id: string) => {
    deleteTimeEntry(id);
    toast.success('Activity deleted');
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            No completed activities for today.
            <br />
            Start tracking your time to see your activities here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {entries.map(entry => {
            const category = categories.find(c => c.id === entry.categoryId);
            
            return (
              <div key={entry.id} className="flex items-center p-4 hover:bg-muted/40">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: category?.color || '#ccc' }} 
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{category?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.duration ? formatDuration(entry.duration) : 'In progress'}
                    </p>
                  </div>
                  
                  {entry.description && (
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(entry.startTime, 'h:mm a')} - {
                      entry.endTime ? format(entry.endTime, 'h:mm a') : 'ongoing'
                    }
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-50 hover:opacity-100" 
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
