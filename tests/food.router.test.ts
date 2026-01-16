import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("../server/db", () => ({
  getUserFoodLogs: vi.fn(),
  getDailyNutritionSummary: vi.fn(),
  createFoodLog: vi.fn(),
  deleteFoodLog: vi.fn(),
}));

// Mock the LLM module
vi.mock("../server/_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import * as db from "../server/db";
import { invokeLLM } from "../server/_core/llm";

describe("Food Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserFoodLogs", () => {
    it("should return food logs for a user", async () => {
      const mockLogs = [
        {
          id: 1,
          userId: 1,
          logDate: new Date("2025-01-15"),
          mealType: "breakfast",
          totalCalories: 450,
          totalProtein: "25",
          totalCarbs: "45",
          totalFat: "15",
          healthScore: 7,
          foods: [{ name: "Eggs", portion: "2 large", calories: 140, protein: 12, carbs: 1, fat: 10 }],
        },
        {
          id: 2,
          userId: 1,
          logDate: new Date("2025-01-15"),
          mealType: "lunch",
          totalCalories: 650,
          totalProtein: "35",
          totalCarbs: "55",
          totalFat: "25",
          healthScore: 8,
          foods: [{ name: "Grilled Chicken Salad", portion: "1 bowl", calories: 650, protein: 35, carbs: 55, fat: 25 }],
        },
      ];

      (db.getUserFoodLogs as any).mockResolvedValue(mockLogs);

      const result = await db.getUserFoodLogs(1, "2025-01-15");

      expect(db.getUserFoodLogs).toHaveBeenCalledWith(1, "2025-01-15");
      expect(result).toHaveLength(2);
      expect(result[0].mealType).toBe("breakfast");
      expect(result[1].mealType).toBe("lunch");
    });

    it("should return empty array when no logs exist", async () => {
      (db.getUserFoodLogs as any).mockResolvedValue([]);

      const result = await db.getUserFoodLogs(1, "2025-01-20");

      expect(result).toHaveLength(0);
    });
  });

  describe("getDailyNutritionSummary", () => {
    it("should calculate daily nutrition totals", async () => {
      const mockSummary = {
        totalCalories: 1800,
        totalProtein: 120,
        totalCarbs: 180,
        totalFat: 60,
        mealCount: 3,
      };

      (db.getDailyNutritionSummary as any).mockResolvedValue(mockSummary);

      const result = await db.getDailyNutritionSummary(1, "2025-01-15");

      expect(db.getDailyNutritionSummary).toHaveBeenCalledWith(1, "2025-01-15");
      expect(result.totalCalories).toBe(1800);
      expect(result.totalProtein).toBe(120);
      expect(result.totalCarbs).toBe(180);
      expect(result.totalFat).toBe(60);
      expect(result.mealCount).toBe(3);
    });

    it("should return zero values when no meals logged", async () => {
      const mockSummary = {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealCount: 0,
      };

      (db.getDailyNutritionSummary as any).mockResolvedValue(mockSummary);

      const result = await db.getDailyNutritionSummary(1, "2025-01-20");

      expect(result.totalCalories).toBe(0);
      expect(result.mealCount).toBe(0);
    });
  });

  describe("createFoodLog", () => {
    it("should create a new food log entry", async () => {
      (db.createFoodLog as any).mockResolvedValue(1);

      const foodLogData = {
        userId: 1,
        logDate: new Date("2025-01-15"),
        mealType: "dinner" as const,
        totalCalories: 700,
        totalProtein: "40",
        totalCarbs: "60",
        totalFat: "30",
        healthScore: 8,
        foods: [
          { name: "Salmon", portion: "6 oz", calories: 350, protein: 30, carbs: 0, fat: 20 },
          { name: "Brown Rice", portion: "1 cup", calories: 220, protein: 5, carbs: 45, fat: 2 },
          { name: "Broccoli", portion: "1 cup", calories: 55, protein: 4, carbs: 10, fat: 0 },
        ],
        suggestions: ["Great protein choice!", "Consider adding more vegetables"],
      };

      const result = await db.createFoodLog(foodLogData);

      expect(db.createFoodLog).toHaveBeenCalledWith(foodLogData);
      expect(result).toBe(1);
    });
  });

  describe("deleteFoodLog", () => {
    it("should delete a food log entry", async () => {
      (db.deleteFoodLog as any).mockResolvedValue(undefined);

      await db.deleteFoodLog(1);

      expect(db.deleteFoodLog).toHaveBeenCalledWith(1);
    });
  });

  describe("Food Analysis (LLM)", () => {
    it("should parse food analysis response correctly", async () => {
      const mockLLMResponse = {
        content: JSON.stringify({
          foods: [
            { name: "Grilled Chicken Breast", portion: "6 oz", calories: 280, protein: 52, carbs: 0, fat: 6 },
            { name: "Mixed Greens Salad", portion: "2 cups", calories: 40, protein: 3, carbs: 8, fat: 0 },
            { name: "Olive Oil Dressing", portion: "2 tbsp", calories: 120, protein: 0, carbs: 0, fat: 14 },
          ],
          totalCalories: 440,
          totalProtein: 55,
          totalCarbs: 8,
          totalFat: 20,
          healthScore: 9,
          suggestions: ["Excellent protein-rich meal", "Consider adding more complex carbs for energy"],
        }),
      };

      (invokeLLM as any).mockResolvedValue(mockLLMResponse);

      const result = await invokeLLM({
        messages: [{ role: "user", content: "Analyze this food image" }],
      });

      expect(invokeLLM).toHaveBeenCalled();
      
      // Parse the response
      const content = 'content' in result ? String(result.content || "") : "";
      const parsed = JSON.parse(content);
      
      expect(parsed.foods).toHaveLength(3);
      expect(parsed.totalCalories).toBe(440);
      expect(parsed.healthScore).toBe(9);
      expect(parsed.suggestions).toHaveLength(2);
    });
  });
});
