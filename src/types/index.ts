
export interface ActivityCategory {
  id: string;
  name: string;
  color: string;
  group: "work" | "personal" | "sleep" | "other";
  rule: "3F" | "3H" | "3S" | "other";
  description: string;
}

export interface TimeEntry {
  id: string;
  categoryId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null; // in minutes
  description: string;
}

export interface DailySummary {
  date: string;
  work: number; // minutes
  personal: number; // minutes
  sleep: number; // minutes
  categories: Record<string, number>; // categoryId -> minutes
}

export type TimeDistribution = {
  work: number;
  personal: number;
  sleep: number;
};

export type RuleBreakdown = {
  "3F": number; // Family, Friends, Faith
  "3H": number; // Health, Hygiene, Hobby  
  "3S": number; // Soul, Service, Smile
  other: number;
};
