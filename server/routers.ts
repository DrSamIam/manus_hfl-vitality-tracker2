import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ========== USER PROFILE ==========
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProfile(ctx.user.id);
    }),
    
    update: protectedProcedure
      .input(z.object({
        biologicalSex: z.enum(["male", "female", "prefer_not_to_say"]).optional(),
        age: z.number().min(13).max(120).optional(),
        goals: z.array(z.string()).optional(),
        currentSymptoms: z.array(z.string()).optional(),
        hasRecentLabWork: z.boolean().optional(),
        cycleTrackingEnabled: z.boolean().optional(),
        onboardingCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ========== BIOMARKERS ==========
  biomarkers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBiomarkers(ctx.user.id);
    }),
    
    byName: protectedProcedure
      .input(z.object({ markerName: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getBiomarkersByName(ctx.user.id, input.markerName);
      }),
    
    latest: protectedProcedure
      .input(z.object({ markerName: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getLatestBiomarker(ctx.user.id, input.markerName);
      }),
    
    create: protectedProcedure
      .input(z.object({
        markerName: z.string().min(1).max(100),
        value: z.string(),
        unit: z.string().min(1).max(50),
        testDate: z.string(),
        cycleDay: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createBiomarker({
          userId: ctx.user.id,
          ...input,
          testDate: new Date(input.testDate),
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        value: z.string().optional(),
        unit: z.string().optional(),
        testDate: z.string().optional(),
        cycleDay: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, testDate, ...data } = input;
        await db.updateBiomarker(id, {
          ...data,
          ...(testDate && { testDate: new Date(testDate) }),
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBiomarker(input.id);
        return { success: true };
      }),
  }),

  // ========== SYMPTOMS ==========
  symptoms: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserSymptoms(ctx.user.id, input.limit);
      }),
    
    byDate: protectedProcedure
      .input(z.object({ logDate: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getSymptomByDate(ctx.user.id, input.logDate);
      }),
    
    inRange: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getSymptomsInRange(ctx.user.id, input.startDate, input.endDate);
      }),
    
    streak: protectedProcedure.query(async ({ ctx }) => {
      return db.getSymptomStreak(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        logDate: z.string(),
        energy: z.number().min(1).max(10).optional(),
        mood: z.number().min(1).max(10).optional(),
        sleep: z.number().min(1).max(10).optional(),
        mentalClarity: z.number().min(1).max(10).optional(),
        libido: z.number().min(1).max(10).optional(),
        performanceStamina: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
        cycleDay: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createSymptom({
          userId: ctx.user.id,
          ...input,
          logDate: new Date(input.logDate),
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        energy: z.number().min(1).max(10).optional(),
        mood: z.number().min(1).max(10).optional(),
        sleep: z.number().min(1).max(10).optional(),
        mentalClarity: z.number().min(1).max(10).optional(),
        libido: z.number().min(1).max(10).optional(),
        performanceStamina: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSymptom(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSymptom(input.id);
        return { success: true };
      }),
  }),

  // ========== MENSTRUAL CYCLES ==========
  cycles: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserMenstrualCycles(ctx.user.id);
    }),
    
    latest: protectedProcedure.query(async ({ ctx }) => {
      return db.getLatestMenstrualCycle(ctx.user.id);
    }),
    
    currentDay: protectedProcedure.query(async ({ ctx }) => {
      return db.getCurrentCycleDay(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        cycleStartDate: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createMenstrualCycle({
          userId: ctx.user.id,
          ...input,
          cycleStartDate: new Date(input.cycleStartDate),
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        cycleEndDate: z.string().optional(),
        cycleLength: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, cycleEndDate, ...data } = input;
        await db.updateMenstrualCycle(id, {
          ...data,
          ...(cycleEndDate && { cycleEndDate: new Date(cycleEndDate) }),
        });
        return { success: true };
      }),
  }),

  // ========== PERIOD SYMPTOMS ==========
  periodSymptoms: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPeriodSymptoms(ctx.user.id);
    }),
    
    byDate: protectedProcedure
      .input(z.object({ symptomDate: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getPeriodSymptomByDate(ctx.user.id, input.symptomDate);
      }),
    
    create: protectedProcedure
      .input(z.object({
        symptomDate: z.string(),
        cycleDay: z.number().optional(),
        flowLevel: z.enum(["none", "spotting", "light", "moderate", "heavy"]).optional(),
        crampingSeverity: z.number().min(1).max(10).optional(),
        symptomsArray: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createPeriodSymptom({
          userId: ctx.user.id,
          ...input,
          symptomDate: new Date(input.symptomDate),
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        flowLevel: z.enum(["none", "spotting", "light", "moderate", "heavy"]).optional(),
        crampingSeverity: z.number().min(1).max(10).optional(),
        symptomsArray: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updatePeriodSymptom(id, data);
        return { success: true };
      }),
  }),

  // ========== SUPPLEMENTS ==========
  supplements: router({
    list: protectedProcedure
      .input(z.object({ activeOnly: z.boolean().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserSupplements(ctx.user.id, input.activeOnly);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        dosage: z.string().min(1).max(100),
        timing: z.enum(["morning", "afternoon", "evening", "before_bed", "multiple_times"]),
        startDate: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createSupplement({
          userId: ctx.user.id,
          active: true,
          ...input,
          startDate: new Date(input.startDate),
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        dosage: z.string().optional(),
        timing: z.enum(["morning", "afternoon", "evening", "before_bed", "multiple_times"]).optional(),
        active: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSupplement(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSupplement(input.id);
        return { success: true };
      }),
    
    adherence: protectedProcedure
      .input(z.object({
        supplementId: z.number(),
        days: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getSupplementAdherence(input.supplementId, input.days);
      }),
  }),

  // ========== SUPPLEMENT LOGS ==========
  supplementLogs: router({
    todaysLogs: protectedProcedure
      .input(z.object({ today: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getTodaysSupplementLogs(ctx.user.id, input.today);
      }),
    
    byDate: protectedProcedure
      .input(z.object({
        supplementId: z.number(),
        logDate: z.string(),
      }))
      .query(async ({ input }) => {
        return db.getSupplementLogByDate(input.supplementId, input.logDate);
      }),
    
    create: protectedProcedure
      .input(z.object({
        supplementId: z.number(),
        logDate: z.string(),
        amTaken: z.boolean(),
        pmTaken: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createSupplementLog({
          userId: ctx.user.id,
          ...input,
          logDate: new Date(input.logDate),
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        amTaken: z.boolean().optional(),
        pmTaken: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSupplementLog(id, data);
        return { success: true };
      }),
  }),

  // ========== INSIGHTS ==========
  insights: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserInsights(ctx.user.id, input.limit);
      }),
    
    create: protectedProcedure
      .input(z.object({
        insightText: z.string(),
        insightType: z.string(),
        dataSource: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createInsight({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),
  }),

  // ========== NOTIFICATION SETTINGS ==========
  notificationSettings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotificationSettings(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        dailySymptomReminder: z.boolean().optional(),
        dailySymptomReminderTime: z.string().optional(),
        supplementReminders: z.boolean().optional(),
        weeklyInsightsEmail: z.boolean().optional(),
        labTestReminders: z.boolean().optional(),
        periodPredictionNotifications: z.boolean().optional(),
        ovulationWindowNotifications: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createNotificationSettings({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        dailySymptomReminder: z.boolean().optional(),
        dailySymptomReminderTime: z.string().optional(),
        supplementReminders: z.boolean().optional(),
        weeklyInsightsEmail: z.boolean().optional(),
        labTestReminders: z.boolean().optional(),
        periodPredictionNotifications: z.boolean().optional(),
        ovulationWindowNotifications: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateNotificationSettings(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ========== LAB UPLOADS ==========
  labUploads: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserLabUploads(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createLabUpload({
          userId: ctx.user.id,
          processed: false,
          ...input,
        });
        return { id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
