import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  biomarkers,
  bodyMeasurements,
  exercisePRs,
  foodLogs,
  hydrationLogs,
  insights,
  labUploads,
  medications,
  medicalHistory,
  menstrualCycles,
  notificationSettings,
  periodSymptoms,
  progressPhotos,
  sleepLogs,
  supplementLogs,
  supplements,
  symptoms,
  users,
  workouts,
  type Biomarker,
  type BodyMeasurement,
  type ExercisePR,
  type HydrationLog,
  type InsertBiomarker,
  type InsertBodyMeasurement,
  type InsertExercisePR,
  type InsertFoodLog,
  type InsertHydrationLog,
  type InsertInsight,
  type InsertLabUpload,
  type InsertMedicalHistoryEntry,
  type InsertMedication,
  type InsertMenstrualCycle,
  type InsertNotificationSettings,
  type InsertPeriodSymptom,
  type InsertProgressPhoto,
  type InsertSleepLog,
  type InsertSupplement,
  type InsertSupplementLog,
  type InsertSymptom,
  type InsertUser,
  type InsertWorkout,
  type MedicalHistoryEntry,
  type Medication,
  type MenstrualCycle,
  type NotificationSettings,
  type PeriodSymptom,
  type ProgressPhoto,
  type SleepLog,
  type Supplement,
  type SupplementLog,
  type Symptom,
  type User,
  type Workout,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== USER OPERATIONS ==========
export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserProfile(userId: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}

// ========== BIOMARKER OPERATIONS ==========
export async function createBiomarker(data: InsertBiomarker): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(biomarkers).values(data);
  return result[0].insertId;
}

export async function getUserBiomarkers(userId: number): Promise<Biomarker[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(biomarkers).where(eq(biomarkers.userId, userId)).orderBy(desc(biomarkers.testDate));
}

export async function getBiomarkersByName(userId: number, markerName: string): Promise<Biomarker[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(biomarkers).where(and(eq(biomarkers.userId, userId), eq(biomarkers.markerName, markerName))).orderBy(desc(biomarkers.testDate));
}

export async function updateBiomarker(id: number, data: Partial<InsertBiomarker>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(biomarkers).set(data).where(eq(biomarkers.id, id));
}

export async function deleteBiomarker(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(biomarkers).where(eq(biomarkers.id, id));
}

export async function getLatestBiomarker(userId: number, markerName: string): Promise<Biomarker | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(biomarkers).where(and(eq(biomarkers.userId, userId), eq(biomarkers.markerName, markerName))).orderBy(desc(biomarkers.testDate)).limit(1);
  return result[0];
}

// ========== SYMPTOM OPERATIONS ==========
export async function createSymptom(data: InsertSymptom): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(symptoms).values(data);
  return result[0].insertId;
}

export async function getUserSymptoms(userId: number, limit?: number): Promise<Symptom[]> {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(symptoms).where(eq(symptoms.userId, userId)).orderBy(desc(symptoms.logDate));
  if (limit) query = query.limit(limit) as any;
  return query;
}

export async function getSymptomByDate(userId: number, logDate: string): Promise<Symptom | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(symptoms).where(and(eq(symptoms.userId, userId), sql`${symptoms.logDate} = ${logDate}`)).limit(1);
  return result[0];
}

export async function updateSymptom(id: number, data: Partial<InsertSymptom>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(symptoms).set(data).where(eq(symptoms.id, id));
}

export async function deleteSymptom(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(symptoms).where(eq(symptoms.id, id));
}

export async function getSymptomStreak(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const allSymptoms = await db.select().from(symptoms).where(eq(symptoms.userId, userId)).orderBy(desc(symptoms.logDate));
  if (allSymptoms.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < allSymptoms.length; i++) {
    const symptomDate = new Date(allSymptoms[i].logDate);
    symptomDate.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);
    if (symptomDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function getSymptomsInRange(userId: number, startDate: string, endDate: string): Promise<Symptom[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(symptoms).where(and(eq(symptoms.userId, userId), sql`${symptoms.logDate} >= ${startDate}`, sql`${symptoms.logDate} <= ${endDate}`)).orderBy(symptoms.logDate);
}

// ========== MENSTRUAL CYCLE OPERATIONS ==========
export async function createMenstrualCycle(data: InsertMenstrualCycle): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(menstrualCycles).values(data);
  return result[0].insertId;
}

export async function getUserMenstrualCycles(userId: number): Promise<MenstrualCycle[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menstrualCycles).where(eq(menstrualCycles.userId, userId)).orderBy(desc(menstrualCycles.cycleStartDate));
}

export async function getLatestMenstrualCycle(userId: number): Promise<MenstrualCycle | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(menstrualCycles).where(eq(menstrualCycles.userId, userId)).orderBy(desc(menstrualCycles.cycleStartDate)).limit(1);
  return result[0];
}

export async function updateMenstrualCycle(id: number, data: Partial<InsertMenstrualCycle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(menstrualCycles).set(data).where(eq(menstrualCycles.id, id));
}

export async function getCurrentCycleDay(userId: number): Promise<number | null> {
  const latestCycle = await getLatestMenstrualCycle(userId);
  if (!latestCycle) return null;
  const startDate = new Date(latestCycle.cycleStartDate);
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : null;
}

// ========== PERIOD SYMPTOM OPERATIONS ==========
export async function createPeriodSymptom(data: InsertPeriodSymptom): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(periodSymptoms).values(data);
  return result[0].insertId;
}

export async function getUserPeriodSymptoms(userId: number): Promise<PeriodSymptom[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(periodSymptoms).where(eq(periodSymptoms.userId, userId)).orderBy(desc(periodSymptoms.symptomDate));
}

export async function getPeriodSymptomByDate(userId: number, symptomDate: string): Promise<PeriodSymptom | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(periodSymptoms).where(and(eq(periodSymptoms.userId, userId), sql`${periodSymptoms.symptomDate} = ${symptomDate}`)).limit(1);
  return result[0];
}

export async function updatePeriodSymptom(id: number, data: Partial<InsertPeriodSymptom>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(periodSymptoms).set(data).where(eq(periodSymptoms.id, id));
}

// ========== SUPPLEMENT OPERATIONS ==========
export async function createSupplement(data: InsertSupplement): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supplements).values(data);
  return result[0].insertId;
}

export async function getUserSupplements(userId: number, activeOnly = false): Promise<Supplement[]> {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(supplements).where(and(eq(supplements.userId, userId), eq(supplements.active, true))).orderBy(supplements.name);
  }
  return db.select().from(supplements).where(eq(supplements.userId, userId)).orderBy(supplements.name);
}

export async function updateSupplement(id: number, data: Partial<InsertSupplement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(supplements).set(data).where(eq(supplements.id, id));
}

export async function deleteSupplement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(supplements).where(eq(supplements.id, id));
}

// ========== SUPPLEMENT LOG OPERATIONS ==========
export async function createSupplementLog(data: InsertSupplementLog): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supplementLogs).values(data);
  return result[0].insertId;
}

export async function getSupplementLogByDate(supplementId: number, logDate: string): Promise<SupplementLog | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(supplementLogs).where(and(eq(supplementLogs.supplementId, supplementId), sql`${supplementLogs.logDate} = ${logDate}`)).limit(1);
  return result[0];
}

export async function updateSupplementLog(id: number, data: Partial<InsertSupplementLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(supplementLogs).set(data).where(eq(supplementLogs.id, id));
}

export async function getTodaysSupplementLogs(userId: number, today: string): Promise<SupplementLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplementLogs).where(and(eq(supplementLogs.userId, userId), sql`${supplementLogs.logDate} = ${today}`));
}

export async function getSupplementAdherence(supplementId: number, days = 30): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  const logs = await db.select().from(supplementLogs).where(and(eq(supplementLogs.supplementId, supplementId), sql`${supplementLogs.logDate} >= ${startStr}`, sql`${supplementLogs.logDate} <= ${endStr}`));
  const takenDays = logs.filter(log => log.amTaken || log.pmTaken).length;
  return Math.round((takenDays / days) * 100);
}

// ========== INSIGHT OPERATIONS ==========
export async function createInsight(data: InsertInsight): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(insights).values(data);
  return result[0].insertId;
}

export async function getUserInsights(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(insights).where(eq(insights.userId, userId)).orderBy(desc(insights.generatedDate)).limit(limit);
}

// ========== NOTIFICATION SETTINGS OPERATIONS ==========
export async function getNotificationSettings(userId: number): Promise<NotificationSettings | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId)).limit(1);
  return result[0];
}

export async function createNotificationSettings(data: InsertNotificationSettings): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notificationSettings).values(data);
  return result[0].insertId;
}

export async function updateNotificationSettings(userId: number, data: Partial<InsertNotificationSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notificationSettings).set(data).where(eq(notificationSettings.userId, userId));
}

// ========== LAB UPLOAD OPERATIONS ==========
export async function createLabUpload(data: InsertLabUpload): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(labUploads).values(data);
  return result[0].insertId;
}

export async function getUserLabUploads(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(labUploads).where(eq(labUploads.userId, userId)).orderBy(desc(labUploads.uploadDate));
}

export async function updateLabUpload(id: number, data: Partial<InsertLabUpload>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(labUploads).set(data).where(eq(labUploads.id, id));
}

// ========== MEDICATION OPERATIONS ==========
export async function getUserMedications(userId: number, activeOnly?: boolean) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(medications).where(and(eq(medications.userId, userId), eq(medications.active, true))).orderBy(desc(medications.createdAt));
  }
  return db.select().from(medications).where(eq(medications.userId, userId)).orderBy(desc(medications.createdAt));
}

export async function createMedication(data: InsertMedication): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(medications).values(data);
  return result[0].insertId;
}

export async function updateMedication(id: number, data: Partial<InsertMedication>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(medications).set(data).where(eq(medications.id, id));
}

export async function deleteMedication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(medications).where(eq(medications.id, id));
}


// ========== FOOD LOG OPERATIONS ==========
export async function createFoodLog(data: InsertFoodLog): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(foodLogs).values(data);
  return result[0].insertId;
}

export async function getUserFoodLogs(userId: number, date?: string) {
  const db = await getDb();
  if (!db) return [];
  if (date) {
    return db.select().from(foodLogs).where(and(eq(foodLogs.userId, userId), sql`${foodLogs.logDate} = ${date}`)).orderBy(desc(foodLogs.createdAt));
  }
  return db.select().from(foodLogs).where(eq(foodLogs.userId, userId)).orderBy(desc(foodLogs.createdAt)).limit(50);
}

export async function getDailyNutritionSummary(userId: number, date: string) {
  const db = await getDb();
  if (!db) return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, mealCount: 0 };
  const logs = await db.select().from(foodLogs).where(and(eq(foodLogs.userId, userId), sql`${foodLogs.logDate} = ${date}`));
  return {
    totalCalories: logs.reduce((sum, log) => sum + (log.totalCalories || 0), 0),
    totalProtein: logs.reduce((sum, log) => sum + parseFloat(String(log.totalProtein || 0)), 0),
    totalCarbs: logs.reduce((sum, log) => sum + parseFloat(String(log.totalCarbs || 0)), 0),
    totalFat: logs.reduce((sum, log) => sum + parseFloat(String(log.totalFat || 0)), 0),
    mealCount: logs.length,
  };
}

export async function deleteFoodLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(foodLogs).where(eq(foodLogs.id, id));
}


// ========== WORKOUT OPERATIONS ==========
export async function getUserWorkouts(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workouts).where(eq(workouts.userId, userId)).orderBy(desc(workouts.workoutDate)).limit(limit);
}

export async function getWorkoutsByDateRange(userId: number, startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workouts).where(
    and(
      eq(workouts.userId, userId),
      gte(workouts.workoutDate, new Date(startDate)),
      lte(workouts.workoutDate, new Date(endDate))
    )
  ).orderBy(desc(workouts.workoutDate));
}

export async function createWorkout(data: InsertWorkout): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(workouts).values(data);
  return result[0].insertId;
}

export async function updateWorkout(id: number, data: Partial<InsertWorkout>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(workouts).set(data).where(eq(workouts.id, id));
}

export async function deleteWorkout(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(workouts).where(eq(workouts.id, id));
}

export async function getWeeklyWorkoutStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalWorkouts: 0, totalMinutes: 0, totalCalories: 0 };
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weekWorkouts = await db.select().from(workouts).where(
    and(
      eq(workouts.userId, userId),
      gte(workouts.workoutDate, oneWeekAgo)
    )
  );
  
  return {
    totalWorkouts: weekWorkouts.length,
    totalMinutes: weekWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0),
    totalCalories: weekWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
  };
}


// ========== MEDICAL HISTORY OPERATIONS ==========
export async function getUserMedicalHistory(userId: number, entryType?: string) {
  const db = await getDb();
  if (!db) return [];
  if (entryType) {
    return db.select().from(medicalHistory).where(and(eq(medicalHistory.userId, userId), eq(medicalHistory.entryType, entryType as any))).orderBy(desc(medicalHistory.createdAt));
  }
  return db.select().from(medicalHistory).where(eq(medicalHistory.userId, userId)).orderBy(desc(medicalHistory.createdAt));
}

export async function createMedicalHistoryEntry(data: InsertMedicalHistoryEntry): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(medicalHistory).values(data);
  return result[0].insertId;
}

export async function updateMedicalHistoryEntry(id: number, data: Partial<InsertMedicalHistoryEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(medicalHistory).set(data).where(eq(medicalHistory.id, id));
}

export async function deleteMedicalHistoryEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(medicalHistory).where(eq(medicalHistory.id, id));
}

// ========== BODY MEASUREMENTS OPERATIONS ==========
export async function getUserBodyMeasurements(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bodyMeasurements).where(eq(bodyMeasurements.userId, userId)).orderBy(desc(bodyMeasurements.measureDate)).limit(limit);
}

export async function getLatestBodyMeasurement(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bodyMeasurements).where(eq(bodyMeasurements.userId, userId)).orderBy(desc(bodyMeasurements.measureDate)).limit(1);
  return result[0] || null;
}

export async function createBodyMeasurement(data: InsertBodyMeasurement): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bodyMeasurements).values(data);
  return result[0].insertId;
}

export async function deleteBodyMeasurement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bodyMeasurements).where(eq(bodyMeasurements.id, id));
}

// ========== PROGRESS PHOTOS OPERATIONS ==========
export async function getUserProgressPhotos(userId: number, photoType?: string) {
  const db = await getDb();
  if (!db) return [];
  if (photoType) {
    return db.select().from(progressPhotos).where(and(eq(progressPhotos.userId, userId), eq(progressPhotos.photoType, photoType as any))).orderBy(desc(progressPhotos.photoDate));
  }
  return db.select().from(progressPhotos).where(eq(progressPhotos.userId, userId)).orderBy(desc(progressPhotos.photoDate));
}

export async function createProgressPhoto(data: InsertProgressPhoto): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(progressPhotos).values(data);
  return result[0].insertId;
}

export async function deleteProgressPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(progressPhotos).where(eq(progressPhotos.id, id));
}

// ========== HYDRATION LOGS OPERATIONS ==========
export async function getHydrationLog(userId: number, date: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(hydrationLogs).where(and(eq(hydrationLogs.userId, userId), sql`${hydrationLogs.logDate} = ${date}`)).limit(1);
  return result[0] || null;
}

export async function getUserHydrationLogs(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hydrationLogs).where(eq(hydrationLogs.userId, userId)).orderBy(desc(hydrationLogs.logDate)).limit(limit);
}

export async function upsertHydrationLog(data: InsertHydrationLog): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getHydrationLog(data.userId, data.logDate as unknown as string);
  if (existing) {
    await db.update(hydrationLogs).set(data).where(eq(hydrationLogs.id, existing.id));
    return existing.id;
  }
  const result = await db.insert(hydrationLogs).values(data);
  return result[0].insertId;
}

// ========== EXERCISE PERSONAL RECORDS OPERATIONS ==========
export async function getUserExercisePRs(userId: number, exerciseName?: string) {
  const db = await getDb();
  if (!db) return [];
  if (exerciseName) {
    return db.select().from(exercisePRs).where(and(eq(exercisePRs.userId, userId), eq(exercisePRs.exerciseName, exerciseName))).orderBy(desc(exercisePRs.achievedDate));
  }
  return db.select().from(exercisePRs).where(eq(exercisePRs.userId, userId)).orderBy(desc(exercisePRs.achievedDate));
}

export async function createExercisePR(data: InsertExercisePR): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(exercisePRs).values(data);
  return result[0].insertId;
}

export async function deleteExercisePR(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(exercisePRs).where(eq(exercisePRs.id, id));
}

// ========== SLEEP LOGS OPERATIONS ==========
export async function getSleepLog(userId: number, date: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sleepLogs).where(and(eq(sleepLogs.userId, userId), sql`${sleepLogs.logDate} = ${date}`)).limit(1);
  return result[0] || null;
}

export async function getUserSleepLogs(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sleepLogs).where(eq(sleepLogs.userId, userId)).orderBy(desc(sleepLogs.logDate)).limit(limit);
}

export async function upsertSleepLog(data: InsertSleepLog): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSleepLog(data.userId, data.logDate as unknown as string);
  if (existing) {
    await db.update(sleepLogs).set(data).where(eq(sleepLogs.id, existing.id));
    return existing.id;
  }
  const result = await db.insert(sleepLogs).values(data);
  return result[0].insertId;
}

export async function deleteSleepLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sleepLogs).where(eq(sleepLogs.id, id));
}
