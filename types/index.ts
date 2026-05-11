export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type Category = 'workout' | 'money' | 'habits' | 'mind';

export interface DailyTask {
  id: string;
  label: string;
  xp: number;
  category: Category;
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

export interface GameState {
  username: string;
  totalXP: number;
  categoryXP: CategoryXP;
  streak: number;
  lastCheckinDate: string;
  powerHistory: PowerPoint[];
  todayTasks: Record<string, boolean>;
  todayDate: string;
}
