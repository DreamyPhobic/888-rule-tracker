
import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Navigation from '@/components/Navigation';
import { Loader2, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useTimeStore } from '@/data/store';

interface TimeEntryFromSupabase {
  id: string;
  category_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  description: string | null;
}

// Helper function to format minutes to hours and minutes
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const DailySummary: React.FC<{date: Date, entries: TimeEntryFromSupabase[]}> = ({ date, entries }) => {
  const { categories } = useTimeStore();
  
  // Calculate time distribution
  const calculateTimeDistribution = () => {
    const distribution = {
      work: 0,
      personal: 0,
      sleep: 0,
    };
    
    entries.forEach(entry => {
      const category = categories.find(c => c.id === entry.category_id);
      if (category) {
        distribution[category.group] += entry.duration;
      }
    });
    
    return distribution;
  };
  
  const timeDistribution = calculateTimeDistribution();
  const totalMinutes = Object.values(timeDistribution).reduce((acc, val) => acc + val, 0);
  
  return (
    <div className="border rounded-md p-3 mb-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          {format(date, 'EEEE, MMMM d')}
        </h3>
        <div className="text-sm text-muted-foreground">
          Total: {formatTime(totalMinutes)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-work">Work</span>
          <span>{formatTime(timeDistribution.work)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-personal">Personal</span>
          <span>{formatTime(timeDistribution.personal)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-sleep">Sleep</span>
          <span>{formatTime(timeDistribution.sleep)}</span>
        </div>
      </div>
    </div>
  );
};

const History = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6); // Default to last 7 days
    date.setHours(0, 0, 0, 0);
    return date;
  });
  
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<{[key: string]: TimeEntryFromSupabase[]}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { categories } = useTimeStore();
  
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    setStartDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  };
  
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get the start and end dates for the range
        const rangeStartDate = new Date(startDate);
        
        const rangeEndDate = new Date(startDate);
        rangeEndDate.setDate(rangeEndDate.getDate() + 6);
        rangeEndDate.setHours(23, 59, 59, 999);
        
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', rangeStartDate.toISOString())
          .lte('start_time', rangeEndDate.toISOString());
        
        if (error) throw error;
        
        // Group entries by date
        const entriesByDate: {[key: string]: TimeEntryFromSupabase[]} = {};
        dates.forEach(date => {
          const dateString = format(date, 'yyyy-MM-dd');
          entriesByDate[dateString] = [];
        });
        
        (data || []).forEach(entry => {
          const entryDate = format(new Date(entry.start_time), 'yyyy-MM-dd');
          if (!entriesByDate[entryDate]) {
            entriesByDate[entryDate] = [];
          }
          entriesByDate[entryDate].push(entry);
        });
        
        setTimeEntries(entriesByDate);
      } catch (error: any) {
        console.error('Error fetching time entries:', error);
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntries();
  }, [user, startDate]);
  
  // Prepare data for charts
  const prepareChartData = () => {
    return dates.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const entries = timeEntries[dateString] || [];
      
      const distribution = {
        work: 0,
        personal: 0,
        sleep: 0,
      };
      
      entries.forEach(entry => {
        const category = categories.find(c => c.id === entry.category_id);
        if (category) {
          distribution[category.group] += entry.duration;
        }
      });
      
      return {
        date: format(date, 'MM/dd'),
        work: Math.round(distribution.work / 60), // Convert to hours
        personal: Math.round(distribution.personal / 60),
        sleep: Math.round(distribution.sleep / 60),
      };
    });
  };
  
  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Time History</h1>
          <p className="text-muted-foreground">View your time tracking history across multiple days</p>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg font-medium">
            {format(startDate, 'MMM d')} - {format(dates[6], 'MMM d, yyyy')}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous Week
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              Next Week <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-6">{error}</div>
        ) : (
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-2">
              {dates.map(date => {
                const dateString = format(date, 'yyyy-MM-dd');
                const entries = timeEntries[dateString] || [];
                return (
                  <DailySummary 
                    key={dateString} 
                    date={date} 
                    entries={entries}
                  />
                );
              })}
            </TabsContent>
            
            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>Time Distribution</CardTitle>
                  <CardDescription>Work, Personal, and Sleep time by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    work: { color: '#3b82f6', label: 'Work' },
                    personal: { color: '#10b981', label: 'Personal' },
                    sleep: { color: '#8b5cf6', label: 'Sleep' }
                  }} className="h-[400px]">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis name="Hours" />
                      <Tooltip formatter={(value) => [`${value} hours`]} />
                      <Legend />
                      <Bar dataKey="work" fill="#3b82f6" name="Work" />
                      <Bar dataKey="personal" fill="#10b981" name="Personal" />
                      <Bar dataKey="sleep" fill="#8b5cf6" name="Sleep" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Breakdown</CardTitle>
                  <CardDescription>Time spent by category each day</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Work</TableHead>
                        <TableHead>Personal</TableHead>
                        <TableHead>Sleep</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dates.map(date => {
                        const dateString = format(date, 'yyyy-MM-dd');
                        const entries = timeEntries[dateString] || [];
                        const distribution = {
                          work: 0,
                          personal: 0,
                          sleep: 0,
                        };
                        
                        entries.forEach(entry => {
                          const category = categories.find(c => c.id === entry.category_id);
                          if (category) {
                            distribution[category.group] += entry.duration;
                          }
                        });
                        
                        const totalMinutes = Object.values(distribution).reduce((acc, val) => acc + val, 0);
                        
                        return (
                          <TableRow key={dateString}>
                            <TableCell>{format(date, 'EEE, MMM d')}</TableCell>
                            <TableCell>{formatTime(distribution.work)}</TableCell>
                            <TableCell>{formatTime(distribution.personal)}</TableCell>
                            <TableCell>{formatTime(distribution.sleep)}</TableCell>
                            <TableCell>{formatTime(totalMinutes)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>888 Rule: 8 hours work, 8 hours personal, 8 hours sleep</p>
          <p className="mt-1">3F-3H-3S: Family, Friends, Faith; Health, Hygiene, Hobby; Soul, Service, Smile</p>
        </div>
      </footer>
    </div>
  );
};

export default History;
