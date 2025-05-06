import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActivityCategory, TimeEntry, DailySummary, TimeDistribution, RuleBreakdown } from '../types';

interface TimeStore {
  categories: ActivityCategory[];
  timeEntries: TimeEntry[];
  dailySummaries: DailySummary[];
  
  // Actions
  addCategory: (category: Omit<ActivityCategory, "id">) => void;
  addTimeEntry: (entry: Omit<TimeEntry, "id">) => void;
  deleteTimeEntry: (id: string) => void;
  getEntriesForDate: (date: Date) => TimeEntry[];
  getTimeDistribution: (date: Date) => TimeDistribution;
  getRuleBreakdown: (date: Date) => RuleBreakdown;
}

// Default categories
const defaultCategories: ActivityCategory[] = [
  {
    id: "work",
    name: "Work",
    color: "#4361EE",
    group: "work",
    rule: "other",
    description: "Professional work activities"
  },
  {
    id: "family",
    name: "Family",
    color: "#FF8C42",
    group: "personal",
    rule: "3F",
    description: "Time spent with family"
  },
  {
    id: "friends",
    name: "Friends",
    color: "#6ECB63",
    group: "personal",
    rule: "3F",
    description: "Time with friends and social connections"
  },
  {
    id: "faith",
    name: "Faith",
    color: "#FF5A5F",
    group: "personal",
    rule: "3F",
    description: "Faith-based activities and beliefs"
  },
  {
    id: "health",
    name: "Health",
    color: "#5E60CE",
    group: "personal",
    rule: "3H",
    description: "Physical health and fitness"
  },
  {
    id: "hygiene",
    name: "Hygiene",
    color: "#9B5DE5",
    group: "personal",
    rule: "3H",
    description: "Personal care and hygiene"
  },
  {
    id: "hobby",
    name: "Hobby",
    color: "#00BBF9",
    group: "personal",
    rule: "3H",
    description: "Personal hobbies and interests"
  },
  {
    id: "soul",
    name: "Soul",
    color: "#FFD166",
    group: "personal",
    rule: "3S",
    description: "Personal fulfillment and spirituality"
  },
  {
    id: "sleep",
    name: "Sleep",
    color: "#7209B7",
    group: "sleep",
    rule: "3S",
    description: "Sleep and rest"
  },
  {
    id: "service",
    name: "Service",
    color: "#06D6A0",
    group: "personal",
    rule: "3S",
    description: "Helping others and community service"
  },
  {
    id: "smile",
    name: "Smile",
    color: "#06D6C2",
    group: "personal",
    rule: "3S",
    description: "Activities that bring joy and happiness"
  }
];

// Create the store with persistence
export const useTimeStore = create<TimeStore>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,
      timeEntries: [],
      dailySummaries: [],

      addCategory: (category) => set((state) => ({
        categories: [...state.categories, { ...category, id: crypto.randomUUID() }]
      })),

      addTimeEntry: (entry) => set((state) => ({
        timeEntries: [...state.timeEntries, { ...entry, id: crypto.randomUUID() }]
      })),

      deleteTimeEntry: (id) => set((state) => ({
        timeEntries: state.timeEntries.filter(entry => entry.id !== id)
      })),

      getEntriesForDate: (date) => {
        const { timeEntries } = get();
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);
        
        return timeEntries.filter(entry => {
          const entryDate = new Date(entry.startTime);
          return entryDate >= targetDate && entryDate < nextDate;
        });
      },

      getTimeDistribution: (date) => {
        const entries = get().getEntriesForDate(date);
        const categories = get().categories;
        
        const distribution: TimeDistribution = {
          work: 0,
          personal: 0,
          sleep: 0
        };
        
        entries.forEach(entry => {
          if (!entry.duration) return;
          
          const category = categories.find(c => c.id === entry.categoryId);
          if (category) {
            distribution[category.group] += entry.duration;
          }
        });
        
        return distribution;
      },

      getRuleBreakdown: (date) => {
        const entries = get().getEntriesForDate(date);
        const categories = get().categories;
        
        const breakdown: RuleBreakdown = {
          "3F": 0,
          "3H": 0, 
          "3S": 0,
          other: 0
        };
        
        entries.forEach(entry => {
          if (!entry.duration) return;
          
          const category = categories.find(c => c.id === entry.categoryId);
          if (category) {
            if (category.rule === "3F" || category.rule === "3H" || category.rule === "3S") {
              breakdown[category.rule] += entry.duration;
            } else {
              breakdown.other += entry.duration;
            }
          }
        });
        
        return breakdown;
      }
    }),
    {
      name: 'time-tracker-storage',
      partialize: (state) => ({
        categories: state.categories,
        timeEntries: state.timeEntries,
        dailySummaries: state.dailySummaries,
      }),
    }
  )
);
