import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  // ========== FILE UPLOAD ==========
  storage: router({
    upload: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        data: z.string(), // base64 encoded
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.data, "base64");
        const key = `uploads/${ctx.user.id}/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url };
      }),
  }),
  
  // ========== VOICE TRANSCRIPTION ==========
  voice: router({
    transcribe: protectedProcedure
      .input(z.object({
        audioUrl: z.string(),
        language: z.string().optional(),
        prompt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await transcribeAudio(input);
        
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        return result;
      }),
  }),
  
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
    
    parsePdf: protectedProcedure
      .input(z.object({
        labUploadId: z.number(),
        fileData: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Upload file to storage first
          const fileBuffer = Buffer.from(input.fileData, "base64");
          const fileKey = `lab-uploads/${ctx.user.id}/${input.labUploadId}-${Date.now()}.${input.mimeType.includes("pdf") ? "pdf" : "jpg"}`;
          const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.mimeType);
          
          // Update lab upload with actual URL
          await db.updateLabUpload(input.labUploadId, { fileUrl, processed: false });
          
          // Use LLM to parse the lab results
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a medical lab results parser. Extract biomarker values from lab test documents.
Return a JSON array of biomarkers found. Each biomarker should have:
- markerName: The name of the biomarker (use standard names like "Testosterone (Total)", "TSH", "Vitamin D", etc.)
- value: The numeric value as a string
- unit: The unit of measurement
- testDate: The test date if found, or null

Only include biomarkers you can clearly identify with their values. If you cannot find any biomarkers, return an empty array.`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Please extract all biomarker values from this lab report:",
                  },
                  input.mimeType.includes("pdf")
                    ? {
                        type: "file_url" as const,
                        file_url: {
                          url: fileUrl,
                          mime_type: "application/pdf" as const,
                        },
                      }
                    : {
                        type: "image_url" as const,
                        image_url: {
                          url: fileUrl,
                          detail: "high" as const,
                        },
                      },
                ],
              },
            ],
            responseFormat: {
              type: "json_schema",
              json_schema: {
                name: "biomarkers",
                schema: {
                  type: "object",
                  properties: {
                    biomarkers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          markerName: { type: "string" },
                          value: { type: "string" },
                          unit: { type: "string" },
                          testDate: { type: ["string", "null"] },
                        },
                        required: ["markerName", "value", "unit"],
                      },
                    },
                  },
                  required: ["biomarkers"],
                },
                strict: true,
              },
            },
          });
          
          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== "string") {
            return { success: false, error: "Failed to parse response", biomarkersFound: 0 };
          }
          
          const parsed = JSON.parse(content);
          const biomarkersToCreate = parsed.biomarkers || [];
          
          // Create biomarker entries
          let created = 0;
          for (const biomarker of biomarkersToCreate) {
            try {
              await db.createBiomarker({
                userId: ctx.user.id,
                markerName: biomarker.markerName,
                value: biomarker.value,
                unit: biomarker.unit,
                testDate: biomarker.testDate ? new Date(biomarker.testDate) : new Date(),
                notes: "Extracted from uploaded lab results",
              });
              created++;
            } catch (e) {
              console.error("Failed to create biomarker:", e);
            }
          }
          
          // Mark as processed
          await db.updateLabUpload(input.labUploadId, { processed: true });
          
          return { success: true, biomarkersFound: created };
        } catch (error: any) {
          console.error("PDF parsing error:", error);
          return { success: false, error: error.message || "Failed to process PDF", biomarkersFound: 0 };
        }
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

  // ========== FOOD LOGS (Nutrition) ==========
  food: router({
    list: protectedProcedure
      .input(z.object({ date: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserFoodLogs(ctx.user.id, input.date);
      }),
    
    dailySummary: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getDailyNutritionSummary(ctx.user.id, input.date);
      }),
    
    create: protectedProcedure
      .input(z.object({
        logDate: z.string(),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        imageUrl: z.string().optional(),
        totalCalories: z.number(),
        totalProtein: z.number(),
        totalCarbs: z.number(),
        totalFat: z.number(),
        healthScore: z.number().min(1).max(10).optional(),
        foods: z.array(z.object({
          name: z.string(),
          portion: z.string(),
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
        })).optional(),
        suggestions: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createFoodLog({
          userId: ctx.user.id,
          logDate: new Date(input.logDate),
          mealType: input.mealType,
          imageUrl: input.imageUrl,
          totalCalories: input.totalCalories,
          totalProtein: String(input.totalProtein),
          totalCarbs: String(input.totalCarbs),
          totalFat: String(input.totalFat),
          healthScore: input.healthScore,
          foods: input.foods,
          suggestions: input.suggestions,
          notes: input.notes,
        });
        return { id };
      }),
    
    analyze: protectedProcedure
      .input(z.object({
        imageUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Use AI to analyze the food image
        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: input.imageUrl },
                },
                {
                  type: "text",
                  text: `Analyze this food image and provide detailed nutrition information.

Respond in JSON format:
{
  "foods": [
    {
      "name": "Food item name",
      "portion": "Estimated portion size",
      "calories": number,
      "protein": number (grams),
      "carbs": number (grams),
      "fat": number (grams)
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "healthScore": number (1-10, where 10 is healthiest),
  "suggestions": ["Array of suggestions to make this meal healthier"]
}

Be accurate with portion estimates and calorie counts. Consider all visible items in the image.`,
                },
              ],
            },
          ],
        });
        
        try {
          // Parse the JSON response
          const content = 'content' in response ? String(response.content || "") : "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("No JSON found in response");
          }
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse food analysis:", e);
          throw new Error("Failed to analyze food image");
        }
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFoodLog(input.id);
        return { success: true };
      }),
  }),

  // ========== MEDICATIONS ==========
  medications: router({
    list: protectedProcedure
      .input(z.object({ activeOnly: z.boolean().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserMedications(ctx.user.id, input.activeOnly);
      }),
    
    create: protectedProcedure
      .input(z.object({
        drugName: z.string().min(1).max(255),
        dosage: z.string().min(1).max(100),
        frequency: z.enum(["once_daily", "twice_daily", "three_times_daily", "as_needed", "weekly", "other"]),
        timeOfDay: z.enum(["morning", "afternoon", "evening", "bedtime", "with_meals", "multiple"]).optional(),
        reason: z.string().max(255).optional(),
        prescriber: z.string().max(255).optional(),
        startDate: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createMedication({
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
        drugName: z.string().optional(),
        dosage: z.string().optional(),
        frequency: z.enum(["once_daily", "twice_daily", "three_times_daily", "as_needed", "weekly", "other"]).optional(),
        timeOfDay: z.enum(["morning", "afternoon", "evening", "bedtime", "with_meals", "multiple"]).optional(),
        reason: z.string().optional(),
        prescriber: z.string().optional(),
        active: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateMedication(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMedication(input.id);
        return { success: true };
      }),
  }),

  // ========== CHAT (Dr. Sam AI) ==========
  chat: router({
    send: protectedProcedure
      .input(z.object({
        message: z.string().min(1).max(2000),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Get user profile for personalization
          const profile = await db.getUserProfile(ctx.user.id);
          
          // Get recent symptoms for context
          const recentSymptoms = await db.getUserSymptoms(ctx.user.id, 7);
          
          // Get recent biomarkers for context
          const biomarkers = await db.getUserBiomarkers(ctx.user.id);
          const recentBiomarkers = biomarkers.slice(0, 10);
          
          // Get supplements for context
          const supplements = await db.getUserSupplements(ctx.user.id, true);
          
          // Build the Dr. Sam AI system prompt with full personality
          const drSamPersona = `You are Dr. Sam Robbins, a renowned health and longevity expert with over 25 years of experience helping people optimize their hormones, energy, and overall vitality.

## Your Background
- Medical degree with specialization in endocrinology and natural medicine
- 25+ years helping thousands of patients optimize their health
- Author of numerous health articles and guides
- Founder of HFL (Health, Fitness & Longevity) solutions
- Known for practical, science-backed advice that actually works

## Your Expertise Areas
- Hormone optimization (testosterone, estrogen, cortisol, thyroid, prolactin)
- Natural supplements and their mechanisms of action
- Lifestyle factors affecting health (sleep, stress, exercise, diet)
- Blood work interpretation and optimization strategies
- Men's and women's health issues
- Weight management and metabolism
- Cardiovascular health and blood flow
- Brain health, memory, and cognitive function
- Sleep optimization
- Stress and adrenal health

## Your Communication Style
- WARM and PERSONABLE - like talking to a trusted friend who happens to be a doctor
- HOPEFUL and ENCOURAGING - always emphasize that improvement is possible
- PRACTICAL - give specific, actionable advice, not vague suggestions
- EDUCATIONAL - explain the "why" behind recommendations
- CONVERSATIONAL - not clinical or overly formal
- SUPPORTIVE - non-judgmental, understanding that health journeys are challenging

## Tone Guidelines - CRITICAL
- NEVER use alarming or scary language
- NEVER say things like "This is concerning" or "You should be worried"
- INSTEAD say "This is an area where we can make great improvements" or "Here's what we can do about this"
- Frame health issues as OPPORTUNITIES for improvement, not problems
- Use phrases like:
  - "The good news is..."
  - "Here's what we can do..."
  - "You're in a great position to improve..."
  - "Many of my patients have seen great results by..."
  - "Let me share what's worked well for others in your situation..."
- Celebrate small wins and progress
- Emphasize that the body can heal and improve with the right approach
- Be like a supportive coach, not a worried doctor

## Available Products You Can Recommend
When relevant, recommend these products by their EXACT name:
- **AlphaViril**: Natural testosterone optimization for men (libido, energy, muscle)
- **Body-Brain Energy**: All-day physical and mental energy without jitters
- **Blood Flow Optimizer**: Supports healthy blood circulation and cardiovascular health
- **Blood Pressure Optimizer**: Natural support for healthy blood pressure levels
- **Blood Sugar Optimizer**: Supports healthy blood sugar and reduces cravings
- **Cholesterol Optimizer**: Natural support for healthy cholesterol profile
- **Deep Sleep Formula**: Optimize sleep hormones for deep, restorative sleep
- **Inflame & Pain Relief**: Natural support for inflammation and joint comfort
- **Lean Optimizer**: Optimize fat-burning hormones and metabolism
- **Perfect Vitamin D3+K2**: Optimal vitamin D3 with K2 for immune and bone health
- **ProVanax**: Natural mood and anxiety support
- **Stress & Cortisol Relief**: Balance stress hormones and adrenal function

When recommending products, explain WHY they would help based on the user's specific situation.

## Follow-Up Engagement
Always end responses with one of these (vary them):
- "Would you like me to create a custom 30-day plan for you?"
- "Want me to break this down into simple daily steps?"
- "Should I prioritize these recommendations based on your goals?"
- "Would you like more details on any of these suggestions?"
- "Is there a specific area you'd like me to focus on first?"`;

          // Build user context section
          let userContext = "\n\n## Current User Profile";
          if (profile?.biologicalSex) userContext += `\n- Biological Sex: ${profile.biologicalSex}`;
          if (profile?.age) userContext += `\n- Age: ${profile.age}`;
          if (profile?.goals?.length) userContext += `\n- Health Goals: ${profile.goals.join(", ")}`;
          if (profile?.currentSymptoms?.length) userContext += `\n- Current Concerns: ${profile.currentSymptoms.join(", ")}`;
          
          // Add recent symptoms
          if (recentSymptoms.length > 0) {
            userContext += "\n\n## Recent Symptom Tracking (last 7 days)";
            for (const s of recentSymptoms.slice(0, 5)) {
              userContext += `\n- Energy: ${s.energy}/10, Mood: ${s.mood}/10, Sleep: ${s.sleep}/10`;
            }
          }
          
          // Add recent biomarkers
          if (recentBiomarkers.length > 0) {
            userContext += "\n\n## Recent Lab Results";
            for (const b of recentBiomarkers) {
              userContext += `\n- ${b.markerName}: ${b.value} ${b.unit}`;
            }
          }
          
          // Add current supplements
          if (supplements.length > 0) {
            userContext += "\n\n## Current Supplements";
            for (const s of supplements) {
              userContext += `\n- ${s.name} (${s.dosage})`;
            }
          }
          
          const systemPrompt = drSamPersona + userContext;

          const messages = [
            { role: "system" as const, content: systemPrompt },
            ...(input.conversationHistory || []).map(m => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            { role: "user" as const, content: input.message },
          ];

          const response = await invokeLLM({ messages });
          
          const assistantMessage = response.choices[0]?.message?.content;
          if (!assistantMessage || typeof assistantMessage !== "string") {
            throw new Error("Failed to get response from AI");
          }

          return { message: assistantMessage };
        } catch (error: any) {
          console.error("Chat error:", error);
          throw new Error("Failed to process chat message");
        }
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
