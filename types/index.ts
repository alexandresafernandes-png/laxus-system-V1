export type Rank           = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type Category       = 'workout' | 'money' | 'habits' | 'mind';
export type Grade          = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
export type StreakState     = 'active' | 'cracked';
export type BusinessDifficulty = 'tiny' | 'small' | 'medium' | 'big' | 'boss';

export interface DailyTask {
  id: string;
  label: string;
  xp: number;
  category: Category;
}

export interface BusinessTask {
  id: string;
  label: string;
  difficulty: BusinessDifficulty;
  xp: number;
  lastCompletedDate: string | null;
}

export interface CategoryXP {
  workout: number;
  money: number;
  habits: number;
  mind: number;
}

export interface PowerPoint {
  date: string;
  powerLevel: number;
}

export interface DayLog {
  date: string;
  completedTasks: string[];
}

export interface WeeklyReport {
  weekEnd: string;
  grades: {
    consistency: Grade;
    physical:    Grade;
    focus:       Grade;
    discipline:  Grade;
    overall:     Grade;
  };
}

export interface HunterStats {
  str:         number;
  int:         number;
  discipline:  number;
  consistency: number;
  focus:       number;
}

export interface GameState {
  username:        string;
  totalXP:         number;
  categoryXP:      CategoryXP;
  streak:          number;
  streakState:     StreakState;
  lastCheckinDate: string;
  powerHistory:    PowerPoint[];
  todayTasks:      Record<string, boolean>;
  todayDate:       string;
  dailyLog:        DayLog[];
  weeklyReport:    WeeklyReport | null;
  soundEnabled:    boolean;
  businessTasks:   BusinessTask[];
}
