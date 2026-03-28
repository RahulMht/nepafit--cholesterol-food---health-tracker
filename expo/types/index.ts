export interface Meal {
  id: string;
  description: string;
  mealType: string;
  servings: number;
  calories: number;
  saturatedFat: number;
  cholesterol: number;
  fiber: number;
  protein: number;
  imageUrl?: string;
  timestamp: string;
  status?: "queued" | "sending" | "sent" | "failed";
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: string;
  status?: "queued" | "sending" | "sent" | "failed";
}

export interface Summary {
  achieved?: {
    cal: number;
    saturatedFat: number;
    cholesterol: number;
    fiber: number;
    protein: number;
  };
  targets?: {
    cal: number;
    saturatedFat: number;
    cholesterol: number;
    fiber: number;
    protein: number;
  };
  percent_of_target?: {
    saturatedFat: number;
    cholesterol: number;
    fiber: number;
    protein: number;
  };
  meals?: Meal[];
  stale?: boolean;
}

export interface WeeklySummary {
  dailyCholesterol: { day: string; value: number }[];
  insight: string;
  todayMeals: Meal[];
}

export interface Profile {
  age: number;
  weight: number;
  height: number;
  cholesterolRisk: string;
  takingStatins: boolean;
  targetCholesterol: number;
}

export interface UserProfile {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  avatar?: string;
}