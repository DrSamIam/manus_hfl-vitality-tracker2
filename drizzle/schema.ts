import {
  boolean,
  date,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  
  // Health profile fields
  biologicalSex: mysqlEnum("biologicalSex", ["male", "female", "prefer_not_to_say"]),
  age: int("age"),
  goals: json("goals").$type<string[]>(), // Array of goal strings
  currentSymptoms: json("currentSymptoms").$type<string[]>(), // Array of symptom strings
  hasRecentLabWork: boolean("hasRecentLabWork").default(false),
  cycleTrackingEnabled: boolean("cycleTrackingEnabled").default(false),
  premiumStatus: boolean("premiumStatus").default(false),
  onboardingCompleted: boolean("onboardingCompleted").default(false),
  
  // Fitness preferences
  fitnessGoal: mysqlEnum("fitnessGoal", ["build_muscle", "lose_fat", "improve_energy", "reduce_stress", "general_fitness", "increase_strength"]),
  fitnessExperience: mysqlEnum("fitnessExperience", ["beginner", "intermediate", "advanced"]),
  availableEquipment: json("availableEquipment").$type<string[]>(), // Array of equipment types
  workoutFrequency: mysqlEnum("workoutFrequency", ["2_3_per_week", "4_5_per_week", "6_7_per_week"]),
  preferredWorkoutDuration: mysqlEnum("preferredWorkoutDuration", ["15_30_min", "30_45_min", "45_60_min", "60_plus_min"]),
  fitnessOnboardingCompleted: boolean("fitnessOnboardingCompleted").default(false),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ========== BIOMARKERS TABLE ==========
export const biomarkers = mysqlTable("biomarkers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  markerName: varchar("markerName", { length: 100 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  testDate: date("testDate").notNull(),
  cycleDay: int("cycleDay"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== SYMPTOMS TABLE ==========
export const symptoms = mysqlTable("symptoms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  logDate: date("logDate").notNull(),
  energy: int("energy"),
  mood: int("mood"),
  sleep: int("sleep"),
  mentalClarity: int("mentalClarity"),
  libido: int("libido"),
  performanceStamina: int("performanceStamina"),
  notes: text("notes"),
  cycleDay: int("cycleDay"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== MENSTRUAL CYCLES TABLE ==========
export const menstrualCycles = mysqlTable("menstrualCycles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cycleStartDate: date("cycleStartDate").notNull(),
  cycleEndDate: date("cycleEndDate"),
  cycleLength: int("cycleLength"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== PERIOD SYMPTOMS TABLE ==========
export const periodSymptoms = mysqlTable("periodSymptoms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symptomDate: date("symptomDate").notNull(),
  cycleDay: int("cycleDay"),
  flowLevel: mysqlEnum("flowLevel", ["none", "spotting", "light", "moderate", "heavy"]),
  crampingSeverity: int("crampingSeverity"),
  symptomsArray: json("symptomsArray").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== SUPPLEMENTS TABLE ==========
export const supplements = mysqlTable("supplements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  timing: mysqlEnum("timing", ["morning", "afternoon", "evening", "before_bed", "multiple_times"]).notNull(),
  startDate: date("startDate").notNull(),
  active: boolean("active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== SUPPLEMENT LOGS TABLE ==========
export const supplementLogs = mysqlTable("supplementLogs", {
  id: int("id").autoincrement().primaryKey(),
  supplementId: int("supplementId").notNull(),
  userId: int("userId").notNull(),
  logDate: date("logDate").notNull(),
  amTaken: boolean("amTaken").default(false).notNull(),
  pmTaken: boolean("pmTaken").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== INSIGHTS TABLE ==========
export const insights = mysqlTable("insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  insightText: text("insightText").notNull(),
  insightType: varchar("insightType", { length: 50 }).notNull(),
  dataSource: text("dataSource"),
  generatedDate: timestamp("generatedDate").defaultNow().notNull(),
});

// ========== NOTIFICATION SETTINGS TABLE ==========
export const notificationSettings = mysqlTable("notificationSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  dailySymptomReminder: boolean("dailySymptomReminder").default(true).notNull(),
  dailySymptomReminderTime: varchar("dailySymptomReminderTime", { length: 5 }).default("20:00"),
  supplementReminders: boolean("supplementReminders").default(true).notNull(),
  weeklyInsightsEmail: boolean("weeklyInsightsEmail").default(true).notNull(),
  labTestReminders: boolean("labTestReminders").default(true).notNull(),
  periodPredictionNotifications: boolean("periodPredictionNotifications").default(false).notNull(),
  ovulationWindowNotifications: boolean("ovulationWindowNotifications").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ========== MEDICATIONS TABLE ==========
export const medications = mysqlTable("medications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  drugName: varchar("drugName", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: mysqlEnum("frequency", ["once_daily", "twice_daily", "three_times_daily", "as_needed", "weekly", "other"]).notNull(),
  timeOfDay: mysqlEnum("timeOfDay", ["morning", "afternoon", "evening", "bedtime", "with_meals", "multiple"]),
  reason: varchar("reason", { length: 255 }),
  prescriber: varchar("prescriber", { length: 255 }),
  startDate: date("startDate").notNull(),
  active: boolean("active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== FOOD LOGS TABLE ==========
export const foodLogs = mysqlTable("foodLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  logDate: date("logDate").notNull(),
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
  imageUrl: text("imageUrl"),
  totalCalories: int("totalCalories").notNull(),
  totalProtein: decimal("totalProtein", { precision: 6, scale: 1 }).notNull(),
  totalCarbs: decimal("totalCarbs", { precision: 6, scale: 1 }).notNull(),
  totalFat: decimal("totalFat", { precision: 6, scale: 1 }).notNull(),
  healthScore: int("healthScore"), // 1-10 scale
  foods: json("foods").$type<{
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[]>(),
  suggestions: json("suggestions").$type<string[]>(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== WORKOUTS TABLE ==========
export const workouts = mysqlTable("workouts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workoutDate: date("workoutDate").notNull(),
  workoutType: mysqlEnum("workoutType", ["strength", "cardio", "hiit", "yoga", "stretching", "sports", "walking", "other"]).notNull(),
  name: varchar("name", { length: 255 }),
  durationMinutes: int("durationMinutes"),
  caloriesBurned: int("caloriesBurned"),
  intensity: mysqlEnum("intensity", ["low", "moderate", "high", "very_high"]),
  exercises: json("exercises").$type<{
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    weightUnit?: string;
    duration?: number;
    distance?: number;
    distanceUnit?: string;
  }[]>(),
  heartRateAvg: int("heartRateAvg"),
  heartRateMax: int("heartRateMax"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== LAB UPLOADS TABLE ==========
export const labUploads = mysqlTable("labUploads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  uploadDate: timestamp("uploadDate").defaultNow().notNull(),
  processed: boolean("processed").default(false).notNull(),
  notes: text("notes"),
});

// ========== MEDICAL HISTORY TABLE ==========
export const medicalHistory = mysqlTable("medicalHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entryType: mysqlEnum("entryType", ["condition", "surgery", "allergy", "family_history", "hospitalization", "injury"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  diagnosisDate: date("diagnosisDate"),
  status: mysqlEnum("status", ["active", "resolved", "managed", "ongoing"]),
  severity: mysqlEnum("severity", ["mild", "moderate", "severe"]),
  treatedBy: varchar("treatedBy", { length: 255 }),
  familyMember: varchar("familyMember", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== BODY MEASUREMENTS TABLE ==========
export const bodyMeasurements = mysqlTable("bodyMeasurements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  measureDate: date("measureDate").notNull(),
  weight: decimal("weight", { precision: 5, scale: 1 }),
  bodyFatPercent: decimal("bodyFatPercent", { precision: 4, scale: 1 }),
  waist: decimal("waist", { precision: 4, scale: 1 }),
  hips: decimal("hips", { precision: 4, scale: 1 }),
  chest: decimal("chest", { precision: 4, scale: 1 }),
  leftArm: decimal("leftArm", { precision: 4, scale: 1 }),
  rightArm: decimal("rightArm", { precision: 4, scale: 1 }),
  leftThigh: decimal("leftThigh", { precision: 4, scale: 1 }),
  rightThigh: decimal("rightThigh", { precision: 4, scale: 1 }),
  neck: decimal("neck", { precision: 4, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== PROGRESS PHOTOS TABLE ==========
export const progressPhotos = mysqlTable("progressPhotos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  photoDate: date("photoDate").notNull(),
  photoType: mysqlEnum("photoType", ["front", "side", "back", "other"]).notNull(),
  imageUrl: text("imageUrl").notNull(),
  weight: decimal("weight", { precision: 5, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== HYDRATION LOGS TABLE ==========
export const hydrationLogs = mysqlTable("hydrationLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  logDate: date("logDate").notNull(),
  waterOz: int("waterOz").notNull(),
  goal: int("goal").default(64),
  entries: json("entries").$type<{ time: string; amount: number }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== EXERCISE PERSONAL RECORDS TABLE ==========
export const exercisePRs = mysqlTable("exercisePRs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseName: varchar("exerciseName", { length: 255 }).notNull(),
  prType: mysqlEnum("prType", ["weight", "reps", "time", "distance"]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  achievedDate: date("achievedDate").notNull(),
  workoutId: int("workoutId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== SLEEP LOGS TABLE ==========
export const sleepLogs = mysqlTable("sleepLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  logDate: date("logDate").notNull(),
  bedtime: varchar("bedtime", { length: 5 }),
  wakeTime: varchar("wakeTime", { length: 5 }),
  durationMinutes: int("durationMinutes"),
  quality: int("quality"),
  deepSleepMinutes: int("deepSleepMinutes"),
  remSleepMinutes: int("remSleepMinutes"),
  awakenings: int("awakenings"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ========== TYPE EXPORTS ==========
export type Biomarker = typeof biomarkers.$inferSelect;
export type InsertBiomarker = typeof biomarkers.$inferInsert;

export type Symptom = typeof symptoms.$inferSelect;
export type InsertSymptom = typeof symptoms.$inferInsert;

export type MenstrualCycle = typeof menstrualCycles.$inferSelect;
export type InsertMenstrualCycle = typeof menstrualCycles.$inferInsert;

export type PeriodSymptom = typeof periodSymptoms.$inferSelect;
export type InsertPeriodSymptom = typeof periodSymptoms.$inferInsert;

export type Supplement = typeof supplements.$inferSelect;
export type InsertSupplement = typeof supplements.$inferInsert;

export type SupplementLog = typeof supplementLogs.$inferSelect;
export type InsertSupplementLog = typeof supplementLogs.$inferInsert;

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;

export type LabUpload = typeof labUploads.$inferSelect;
export type InsertLabUpload = typeof labUploads.$inferInsert;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;

export type FoodLog = typeof foodLogs.$inferSelect;
export type InsertFoodLog = typeof foodLogs.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = typeof workouts.$inferInsert;

export type MedicalHistoryEntry = typeof medicalHistory.$inferSelect;
export type InsertMedicalHistoryEntry = typeof medicalHistory.$inferInsert;

export type BodyMeasurement = typeof bodyMeasurements.$inferSelect;
export type InsertBodyMeasurement = typeof bodyMeasurements.$inferInsert;

export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type InsertProgressPhoto = typeof progressPhotos.$inferInsert;

export type HydrationLog = typeof hydrationLogs.$inferSelect;
export type InsertHydrationLog = typeof hydrationLogs.$inferInsert;

export type ExercisePR = typeof exercisePRs.$inferSelect;
export type InsertExercisePR = typeof exercisePRs.$inferInsert;

export type SleepLog = typeof sleepLogs.$inferSelect;
export type InsertSleepLog = typeof sleepLogs.$inferInsert;
