import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  biomarkers,
  insights,
  labUploads,
  menstrualCycles,
  notificationSettings,
  periodSymptoms,
  supplementLogs,
  supplements,
  symptoms,
  users,
  type Biomarker,
  type InsertBiomarker,
  type InsertInsight,
  type InsertLabUpload,
  type InsertMenstrualCycle,
  type InsertNotificationSettings,
  type InsertPeriodSymptom,
  type InsertSupplement,
  type InsertSupplementLog,
  type InsertSymptom,
  type InsertUser,
  type MenstrualCycle,
  type NotificationSettings,
  type PeriodSymptom,
  type Supplement,
  type SupplementLog,
  type Symptom,
  type User,
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
