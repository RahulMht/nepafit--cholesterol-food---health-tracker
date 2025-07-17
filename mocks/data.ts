import { Meal, Summary, WeeklySummary } from "@/types";

// Mock meals data
const mockMeals: Meal[] = [
  {
    id: "1",
    description: "Grilled Chicken Salad with Olive Oil",
    mealType: "Lunch",
    servings: 1,
    calories: 320,
    saturatedFat: 3,
    cholesterol: 85,
    fiber: 8,
    protein: 35,
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    description: "Oatmeal with Berries and Almonds",
    mealType: "Breakfast",
    servings: 1,
    calories: 210,
    saturatedFat: 1,
    cholesterol: 0,
    fiber: 6,
    protein: 8,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    description: "Baked Salmon with Steamed Vegetables",
    mealType: "Dinner",
    servings: 1,
    calories: 380,
    saturatedFat: 4,
    cholesterol: 75,
    fiber: 5,
    protein: 40,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Mock summary data
export const mockSummary: Summary = {
  achieved: {
    cal: 910,
    saturatedFat: 8,
    cholesterol: 160,
    fiber: 19,
    protein: 83,
  },
  targets: {
    cal: 1800,
    saturatedFat: 20,
    cholesterol: 200,
    fiber: 25,
    protein: 120,
  },
  percent_of_target: {
    saturatedFat: 40,
    cholesterol: 80,
    fiber: 76,
    protein: 69,
  },
  meals: mockMeals,
};

// Mock weekly summary data
export const mockWeeklySummary: WeeklySummary = {
  dailyCholesterol: [
    { day: "Mon", value: 180 },
    { day: "Tue", value: 150 },
    { day: "Wed", value: 210 },
    { day: "Thu", value: 120 },
    { day: "Fri", value: 190 },
    { day: "Sat", value: 220 },
    { day: "Sun", value: 160 },
  ],
  insight: "Your cholesterol intake has been within healthy ranges this week. Keep focusing on lean proteins and high-fiber foods. Consider adding more omega-3 rich foods like salmon and walnuts.",
  todayMeals: mockMeals,
};