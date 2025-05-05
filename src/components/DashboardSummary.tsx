
import React from 'react';
import { useTimeStore } from '../data/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressRing from './ProgressRing';
import { Calendar } from 'lucide-react';

interface DashboardSummaryProps {
  date: Date;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ date }) => {
  const { getTimeDistribution, getRuleBreakdown } = useTimeStore();
  const timeDistribution = getTimeDistribution(date);
  const ruleBreakdown = getRuleBreakdown(date);
  
  const totalMinutes = Object.values(timeDistribution).reduce((acc, val) => acc + val, 0);
  const idealMinutesPerDay = 24 * 60; // 24 hours in minutes
  
  // 888 rule is 8 hours for each category (8 hours = 480 minutes)
  const idealDistribution = {
    work: 480,
    personal: 480,
    sleep: 480
  };

  // Calculate percentages relative to total day
  const getPercentage = (minutes: number) => {
    return (minutes / idealMinutesPerDay) * 100;
  };
  
  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5" />
        <h2 className="text-xl font-semibold">
          {date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-work">Work</CardTitle>
            <CardDescription>8 hours target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ProgressRing 
                progress={getPercentage(timeDistribution.work)} 
                size={80}
                color="stroke-work"
              >
                <div className="text-center">
                  <div className="text-sm font-medium">{formatTime(timeDistribution.work)}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(timeDistribution.work / 480 * 100)}%
                  </div>
                </div>
              </ProgressRing>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Goal: 8h 0m</p>
                <p className="text-sm text-muted-foreground mb-1">
                  {timeDistribution.work < 480 
                    ? `${formatTime(480 - timeDistribution.work)} remaining` 
                    : `${formatTime(timeDistribution.work - 480)} over`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-personal">Personal</CardTitle>
            <CardDescription>8 hours target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ProgressRing 
                progress={getPercentage(timeDistribution.personal)} 
                size={80}
                color="stroke-personal"
              >
                <div className="text-center">
                  <div className="text-sm font-medium">{formatTime(timeDistribution.personal)}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(timeDistribution.personal / 480 * 100)}%
                  </div>
                </div>
              </ProgressRing>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Goal: 8h 0m</p>
                <p className="text-sm text-muted-foreground mb-1">
                  {timeDistribution.personal < 480 
                    ? `${formatTime(480 - timeDistribution.personal)} remaining` 
                    : `${formatTime(timeDistribution.personal - 480)} over`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sleep">Sleep</CardTitle>
            <CardDescription>8 hours target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ProgressRing 
                progress={getPercentage(timeDistribution.sleep)} 
                size={80}
                color="stroke-sleep"
              >
                <div className="text-center">
                  <div className="text-sm font-medium">{formatTime(timeDistribution.sleep)}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(timeDistribution.sleep / 480 * 100)}%
                  </div>
                </div>
              </ProgressRing>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Goal: 8h 0m</p>
                <p className="text-sm text-muted-foreground mb-1">
                  {timeDistribution.sleep < 480 
                    ? `${formatTime(480 - timeDistribution.sleep)} remaining` 
                    : `${formatTime(timeDistribution.sleep - 480)} over`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>3F-3H-3S Breakdown</CardTitle>
          <CardDescription>Balance across all 9 life areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-family">3F - Family, Finances, Fitness</h3>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-family to-fitness" 
                  style={{ width: `${getPercentage(ruleBreakdown["3F"])}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{formatTime(ruleBreakdown["3F"])}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-hobby">3H - Health, Hobby, Head</h3>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-health to-head" 
                  style={{ width: `${getPercentage(ruleBreakdown["3H"])}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{formatTime(ruleBreakdown["3H"])}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-social">3S - Social, Sleep, Spirituality</h3>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-social to-spirituality" 
                  style={{ width: `${getPercentage(ruleBreakdown["3S"])}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{formatTime(ruleBreakdown["3S"])}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
