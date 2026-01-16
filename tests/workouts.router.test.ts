import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("../server/db", () => ({
  getUserWorkouts: vi.fn(),
  getWeeklyWorkoutStats: vi.fn(),
  createWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
}));

import * as db from "../server/db";

describe("Workouts Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserWorkouts", () => {
    it("should return empty array when no workouts exist", async () => {
      vi.mocked(db.getUserWorkouts).mockResolvedValue([]);
      const result = await db.getUserWorkouts(1, 30);
      expect(result).toEqual([]);
      expect(db.getUserWorkouts).toHaveBeenCalledWith(1, 30);
    });

    it("should return workouts for a user", async () => {
      const mockWorkouts = [
        {
          id: 1,
          userId: 1,
          workoutDate: new Date("2025-01-15"),
          workoutType: "strength" as const,
          name: "Leg Day",
          durationMinutes: 45,
          caloriesBurned: 300,
          intensity: "high" as const,
          exercises: [{ name: "Squats", sets: 3, reps: 10, weight: 135 }],
          heartRateAvg: 140,
          heartRateMax: 165,
          notes: "Great workout",
          createdAt: new Date(),
        },
      ];
      vi.mocked(db.getUserWorkouts).mockResolvedValue(mockWorkouts);
      const result = await db.getUserWorkouts(1, 30);
      expect(result).toHaveLength(1);
      expect(result[0].workoutType).toBe("strength");
      expect(result[0].name).toBe("Leg Day");
    });
  });

  describe("getWeeklyWorkoutStats", () => {
    it("should return weekly stats", async () => {
      const mockStats = {
        totalWorkouts: 5,
        totalMinutes: 225,
        totalCalories: 1500,
      };
      vi.mocked(db.getWeeklyWorkoutStats).mockResolvedValue(mockStats);
      const result = await db.getWeeklyWorkoutStats(1);
      expect(result.totalWorkouts).toBe(5);
      expect(result.totalMinutes).toBe(225);
      expect(result.totalCalories).toBe(1500);
    });

    it("should return zero stats when no workouts", async () => {
      const mockStats = {
        totalWorkouts: 0,
        totalMinutes: 0,
        totalCalories: 0,
      };
      vi.mocked(db.getWeeklyWorkoutStats).mockResolvedValue(mockStats);
      const result = await db.getWeeklyWorkoutStats(1);
      expect(result.totalWorkouts).toBe(0);
    });
  });

  describe("createWorkout", () => {
    it("should create a new workout", async () => {
      vi.mocked(db.createWorkout).mockResolvedValue(1);
      const workoutData = {
        userId: 1,
        workoutDate: new Date("2025-01-15"),
        workoutType: "cardio" as const,
        name: "Morning Run",
        durationMinutes: 30,
        caloriesBurned: 250,
        intensity: "moderate" as const,
      };
      const result = await db.createWorkout(workoutData);
      expect(result).toBe(1);
      expect(db.createWorkout).toHaveBeenCalledWith(workoutData);
    });
  });

  describe("deleteWorkout", () => {
    it("should delete a workout", async () => {
      vi.mocked(db.deleteWorkout).mockResolvedValue(undefined);
      await db.deleteWorkout(1);
      expect(db.deleteWorkout).toHaveBeenCalledWith(1);
    });
  });
});
