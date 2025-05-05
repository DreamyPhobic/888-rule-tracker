
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import TimeTracker from '@/components/TimeTracker';
import DashboardSummary from '@/components/DashboardSummary';
import ActivityLog from '@/components/ActivityLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeStore } from '@/data/store';
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  const [currentDate] = useState(new Date());
  const { activeEntry } = useTimeStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TimeTracker />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
                <TabsTrigger value="log" className="flex-1">Activity Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <DashboardSummary date={currentDate} />
              </TabsContent>
              
              <TabsContent value="log">
                <ActivityLog date={currentDate} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>888 Rule: 8 hours work, 8 hours personal, 8 hours sleep</p>
          <p className="mt-1">3F-3H-3S: Family, Finances, Fitness; Health, Hobby, Head; Social, Sleep, Spirituality</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
