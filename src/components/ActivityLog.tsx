
import React, { useState, useEffect } from 'react';
import { useTimeStore } from '../data/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { format, isToday, startOfDay, endOfDay, parseISO } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ActivityLogProps {
  date: Date;
}

interface TimeEntryFromSupabase {
  id: string;
  category_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  description: string | null;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ date }) => {
  const { categories } = useTimeStore();
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntryFromSupabase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const startDate = startOfDay(date).toISOString();
      const endDate = endOfDay(date).toISOString();
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      setEntries(data || []);
    } catch (error: any) {
      console.error('Error fetching time entries:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEntries();
  }, [user, date]);
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state to reflect the deletion
      setEntries(entries.filter(entry => entry.id !== id));
      toast.success('Activity deleted');
    } catch (error: any) {
      toast.error(`Error deleting activity: ${error.message}`);
      console.error('Error deleting time entry:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-destructive py-6">
            {error}
            <Button variant="outline" onClick={fetchEntries} className="block mx-auto mt-4">
              Try Again
            </Button>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            No activities recorded for {isToday(date) ? 'today' : format(date, 'PPP')}.
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
            const category = categories.find(c => c.id === entry.category_id);
            
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
                      {formatDuration(entry.duration)}
                    </p>
                  </div>
                  
                  {entry.description && (
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(entry.start_time), 'h:mm a')} - {format(parseISO(entry.end_time), 'h:mm a')}
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
