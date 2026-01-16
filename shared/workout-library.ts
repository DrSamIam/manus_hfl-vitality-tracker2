// Exercise Library and Workout Templates
// Comprehensive workout system for HFL Vitality Tracker

export type MuscleGroup = 
  | "chest" | "back" | "shoulders" | "biceps" | "triceps" 
  | "forearms" | "core" | "quads" | "hamstrings" | "glutes" 
  | "calves" | "full_body";

export type Equipment = 
  | "bodyweight" | "dumbbells" | "barbell" | "kettlebell" 
  | "resistance_bands" | "cable_machine" | "pull_up_bar" 
  | "bench" | "gym_machine" | "none";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type FitnessGoal = 
  | "build_muscle" | "lose_fat" | "improve_energy" 
  | "reduce_stress" | "general_fitness" | "increase_strength";

export type WorkoutType = 
  | "strength" | "cardio" | "hiit" | "yoga" 
  | "mobility" | "circuit" | "stretching";

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  difficulty: Difficulty;
  instructions: string;
  tips: string[];
  caloriesPerMinute: number; // Approximate
}

export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: string; // Can be "10-12" or "30 sec" for timed
  restSeconds: number;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkoutType;
  duration: number; // minutes
  difficulty: Difficulty;
  equipment: Equipment[];
  targetMuscles: MuscleGroup[];
  goals: FitnessGoal[];
  exercises: TemplateExercise[];
  warmup?: TemplateExercise[];
  cooldown?: TemplateExercise[];
  hflProductTip?: string; // Relevant HFL product recommendation
}

// ============================================
// EXERCISE LIBRARY
// ============================================

export const EXERCISES: Exercise[] = [
  // CHEST
  {
    id: "push_ups",
    name: "Push-Ups",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "shoulders", "core"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Start in a plank position with hands shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up.",
    tips: ["Keep your core tight", "Don't let your hips sag", "Full range of motion"],
    caloriesPerMinute: 7,
  },
  {
    id: "dumbbell_bench_press",
    name: "Dumbbell Bench Press",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "shoulders"],
    equipment: ["dumbbells", "bench"],
    difficulty: "intermediate",
    instructions: "Lie on a bench with dumbbells at chest level. Press the weights up until arms are extended, then lower with control.",
    tips: ["Keep feet flat on floor", "Squeeze chest at top", "Control the descent"],
    caloriesPerMinute: 5,
  },
  {
    id: "incline_push_ups",
    name: "Incline Push-Ups",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "shoulders"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Place hands on an elevated surface (bench, step). Perform push-ups from this inclined position.",
    tips: ["Great for beginners", "Focus on form", "Progress to regular push-ups"],
    caloriesPerMinute: 5,
  },
  
  // BACK
  {
    id: "dumbbell_rows",
    name: "Dumbbell Rows",
    primaryMuscles: ["back"],
    secondaryMuscles: ["biceps", "shoulders"],
    equipment: ["dumbbells", "bench"],
    difficulty: "beginner",
    instructions: "Place one knee and hand on a bench. Row the dumbbell up to your hip, squeezing your back at the top.",
    tips: ["Keep back flat", "Pull with your elbow", "Don't rotate torso"],
    caloriesPerMinute: 5,
  },
  {
    id: "pull_ups",
    name: "Pull-Ups",
    primaryMuscles: ["back"],
    secondaryMuscles: ["biceps", "forearms"],
    equipment: ["pull_up_bar"],
    difficulty: "intermediate",
    instructions: "Hang from a bar with palms facing away. Pull yourself up until chin is over the bar, then lower with control.",
    tips: ["Engage lats first", "Full extension at bottom", "Avoid swinging"],
    caloriesPerMinute: 8,
  },
  {
    id: "superman",
    name: "Superman Hold",
    primaryMuscles: ["back"],
    secondaryMuscles: ["glutes", "hamstrings"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Lie face down with arms extended. Lift arms, chest, and legs off the ground simultaneously. Hold briefly, then lower.",
    tips: ["Squeeze glutes", "Keep neck neutral", "Breathe steadily"],
    caloriesPerMinute: 4,
  },
  
  // SHOULDERS
  {
    id: "shoulder_press",
    name: "Dumbbell Shoulder Press",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    instructions: "Sit or stand with dumbbells at shoulder height. Press overhead until arms are extended, then lower with control.",
    tips: ["Don't arch back excessively", "Core engaged", "Full range of motion"],
    caloriesPerMinute: 5,
  },
  {
    id: "lateral_raises",
    name: "Lateral Raises",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: [],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    instructions: "Stand with dumbbells at sides. Raise arms out to the sides until parallel with floor, then lower slowly.",
    tips: ["Slight bend in elbows", "Control the weight", "Don't use momentum"],
    caloriesPerMinute: 4,
  },
  {
    id: "pike_push_ups",
    name: "Pike Push-Ups",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps", "chest"],
    equipment: ["bodyweight", "none"],
    difficulty: "intermediate",
    instructions: "Start in a downward dog position. Bend elbows to lower head toward the ground, then push back up.",
    tips: ["Great shoulder builder", "Keep hips high", "Progress to handstand push-ups"],
    caloriesPerMinute: 6,
  },
  
  // ARMS
  {
    id: "bicep_curls",
    name: "Dumbbell Bicep Curls",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    instructions: "Stand with dumbbells at sides, palms forward. Curl weights to shoulders, squeeze, then lower with control.",
    tips: ["Keep elbows stationary", "Full range of motion", "Don't swing"],
    caloriesPerMinute: 4,
  },
  {
    id: "tricep_dips",
    name: "Tricep Dips",
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["chest", "shoulders"],
    equipment: ["bodyweight", "bench"],
    difficulty: "beginner",
    instructions: "Place hands on a bench behind you. Lower your body by bending elbows to 90 degrees, then push back up.",
    tips: ["Keep back close to bench", "Don't go too deep", "Squeeze triceps at top"],
    caloriesPerMinute: 5,
  },
  {
    id: "diamond_push_ups",
    name: "Diamond Push-Ups",
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["chest", "shoulders"],
    equipment: ["bodyweight", "none"],
    difficulty: "intermediate",
    instructions: "Perform push-ups with hands close together forming a diamond shape under your chest.",
    tips: ["Elbows stay close to body", "Great tricep builder", "Harder than regular push-ups"],
    caloriesPerMinute: 7,
  },
  
  // CORE
  {
    id: "plank",
    name: "Plank",
    primaryMuscles: ["core"],
    secondaryMuscles: ["shoulders", "glutes"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Hold a push-up position with forearms on the ground. Keep body in a straight line from head to heels.",
    tips: ["Don't let hips sag", "Squeeze glutes", "Breathe normally"],
    caloriesPerMinute: 4,
  },
  {
    id: "crunches",
    name: "Crunches",
    primaryMuscles: ["core"],
    secondaryMuscles: [],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Lie on back with knees bent. Curl shoulders off the ground by contracting abs, then lower with control.",
    tips: ["Don't pull on neck", "Focus on contraction", "Exhale on the way up"],
    caloriesPerMinute: 5,
  },
  {
    id: "mountain_climbers",
    name: "Mountain Climbers",
    primaryMuscles: ["core"],
    secondaryMuscles: ["shoulders", "quads"],
    equipment: ["bodyweight", "none"],
    difficulty: "intermediate",
    instructions: "Start in push-up position. Rapidly alternate driving knees toward chest in a running motion.",
    tips: ["Keep hips level", "Core tight", "Great for cardio too"],
    caloriesPerMinute: 10,
  },
  {
    id: "russian_twists",
    name: "Russian Twists",
    primaryMuscles: ["core"],
    secondaryMuscles: [],
    equipment: ["bodyweight", "dumbbells"],
    difficulty: "intermediate",
    instructions: "Sit with knees bent, lean back slightly. Rotate torso side to side, optionally holding a weight.",
    tips: ["Keep chest up", "Rotate from core", "Control the movement"],
    caloriesPerMinute: 6,
  },
  {
    id: "dead_bug",
    name: "Dead Bug",
    primaryMuscles: ["core"],
    secondaryMuscles: [],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Lie on back with arms extended up and knees at 90 degrees. Slowly lower opposite arm and leg, then return.",
    tips: ["Keep lower back pressed to floor", "Move slowly", "Great for core stability"],
    caloriesPerMinute: 4,
  },
  
  // LEGS
  {
    id: "squats",
    name: "Bodyweight Squats",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Stand with feet shoulder-width apart. Lower by bending knees and pushing hips back, then stand back up.",
    tips: ["Knees track over toes", "Chest up", "Go as low as comfortable"],
    caloriesPerMinute: 6,
  },
  {
    id: "goblet_squats",
    name: "Goblet Squats",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: ["dumbbells", "kettlebell"],
    difficulty: "beginner",
    instructions: "Hold a dumbbell or kettlebell at chest level. Perform a squat while keeping the weight close to your body.",
    tips: ["Great for learning squat form", "Keep elbows inside knees", "Upright torso"],
    caloriesPerMinute: 7,
  },
  {
    id: "lunges",
    name: "Walking Lunges",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: ["bodyweight", "dumbbells"],
    difficulty: "beginner",
    instructions: "Step forward into a lunge, lowering back knee toward ground. Push off front foot and step forward with other leg.",
    tips: ["Keep torso upright", "Don't let knee go past toes", "Control each step"],
    caloriesPerMinute: 7,
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["back", "core"],
    equipment: ["dumbbells", "barbell"],
    difficulty: "intermediate",
    instructions: "Hold weights in front of thighs. Hinge at hips, lowering weights along legs while keeping back flat. Return to standing.",
    tips: ["Slight knee bend", "Feel the hamstring stretch", "Squeeze glutes at top"],
    caloriesPerMinute: 6,
  },
  {
    id: "glute_bridges",
    name: "Glute Bridges",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Lie on back with knees bent. Push through heels to lift hips until body forms a straight line. Squeeze glutes at top.",
    tips: ["Don't hyperextend back", "Squeeze at top", "Great for glute activation"],
    caloriesPerMinute: 4,
  },
  {
    id: "calf_raises",
    name: "Calf Raises",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    equipment: ["bodyweight", "dumbbells"],
    difficulty: "beginner",
    instructions: "Stand on edge of a step or flat ground. Rise up onto toes, pause at top, then lower with control.",
    tips: ["Full range of motion", "Pause at top", "Can add weight for challenge"],
    caloriesPerMinute: 3,
  },
  {
    id: "jump_squats",
    name: "Jump Squats",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["calves", "core"],
    equipment: ["bodyweight", "none"],
    difficulty: "intermediate",
    instructions: "Perform a squat, then explosively jump up. Land softly and immediately go into the next squat.",
    tips: ["Land softly", "Great for power", "High intensity"],
    caloriesPerMinute: 12,
  },
  
  // CARDIO / FULL BODY
  {
    id: "burpees",
    name: "Burpees",
    primaryMuscles: ["full_body"],
    secondaryMuscles: [],
    equipment: ["bodyweight", "none"],
    difficulty: "intermediate",
    instructions: "From standing, drop into a squat, kick feet back to plank, do a push-up, jump feet forward, then jump up with arms overhead.",
    tips: ["Modify by stepping instead of jumping", "Keep core tight", "High calorie burn"],
    caloriesPerMinute: 14,
  },
  {
    id: "jumping_jacks",
    name: "Jumping Jacks",
    primaryMuscles: ["full_body"],
    secondaryMuscles: [],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Jump while spreading legs and raising arms overhead. Jump back to starting position with feet together and arms at sides.",
    tips: ["Great warm-up", "Keep a steady rhythm", "Land softly"],
    caloriesPerMinute: 8,
  },
  {
    id: "high_knees",
    name: "High Knees",
    primaryMuscles: ["core", "quads"],
    secondaryMuscles: ["calves"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Run in place while driving knees up toward chest as high as possible. Pump arms for momentum.",
    tips: ["Stay on balls of feet", "Keep core engaged", "Great cardio"],
    caloriesPerMinute: 10,
  },
  
  // MOBILITY / STRETCHING
  {
    id: "cat_cow",
    name: "Cat-Cow Stretch",
    primaryMuscles: ["back", "core"],
    secondaryMuscles: [],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "On hands and knees, alternate between arching back up (cat) and dropping belly down (cow). Move with breath.",
    tips: ["Great for spine mobility", "Move slowly", "Breathe deeply"],
    caloriesPerMinute: 2,
  },
  {
    id: "childs_pose",
    name: "Child's Pose",
    primaryMuscles: ["back"],
    secondaryMuscles: ["shoulders"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Kneel and sit back on heels. Extend arms forward and lower chest toward floor. Rest forehead on ground.",
    tips: ["Great for relaxation", "Breathe into back", "Hold 30-60 seconds"],
    caloriesPerMinute: 1,
  },
  {
    id: "downward_dog",
    name: "Downward Dog",
    primaryMuscles: ["hamstrings", "calves"],
    secondaryMuscles: ["shoulders", "back"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "From hands and knees, lift hips up and back forming an inverted V. Press heels toward floor and hands into ground.",
    tips: ["Bend knees if needed", "Press chest toward thighs", "Great full-body stretch"],
    caloriesPerMinute: 3,
  },
  {
    id: "hip_flexor_stretch",
    name: "Hip Flexor Stretch",
    primaryMuscles: ["quads"],
    secondaryMuscles: ["core"],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Kneel on one knee with other foot forward. Push hips forward while keeping torso upright. Feel stretch in front of hip.",
    tips: ["Squeeze glute of back leg", "Don't lean forward", "Hold 30 seconds each side"],
    caloriesPerMinute: 2,
  },
  {
    id: "pigeon_pose",
    name: "Pigeon Pose",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: ["bodyweight", "none"],
    difficulty: "intermediate",
    instructions: "From downward dog, bring one knee forward behind wrist. Extend other leg back. Lower hips toward floor.",
    tips: ["Great hip opener", "Use props if needed", "Hold 1-2 minutes"],
    caloriesPerMinute: 2,
  },
  {
    id: "standing_quad_stretch",
    name: "Standing Quad Stretch",
    primaryMuscles: ["quads"],
    secondaryMuscles: [],
    equipment: ["bodyweight", "none"],
    difficulty: "beginner",
    instructions: "Stand on one leg, grab opposite ankle and pull heel toward glute. Keep knees together.",
    tips: ["Hold wall for balance", "Keep hips square", "Hold 30 seconds each side"],
    caloriesPerMinute: 1,
  },
];

// ============================================
// WORKOUT TEMPLATES
// ============================================

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  // QUICK ENERGY BOOST (15 min)
  {
    id: "morning_energy",
    name: "Morning Energy Boost",
    description: "Quick full-body activation to start your day with energy. Perfect for when you're feeling sluggish.",
    type: "circuit",
    duration: 15,
    difficulty: "beginner",
    equipment: ["bodyweight", "none"],
    targetMuscles: ["full_body"],
    goals: ["improve_energy", "general_fitness"],
    warmup: [
      { exerciseId: "jumping_jacks", sets: 1, reps: "30 sec", restSeconds: 10 },
      { exerciseId: "high_knees", sets: 1, reps: "30 sec", restSeconds: 10 },
    ],
    exercises: [
      { exerciseId: "squats", sets: 2, reps: "12", restSeconds: 30 },
      { exerciseId: "push_ups", sets: 2, reps: "10", restSeconds: 30 },
      { exerciseId: "mountain_climbers", sets: 2, reps: "30 sec", restSeconds: 30 },
      { exerciseId: "lunges", sets: 2, reps: "10 each", restSeconds: 30 },
      { exerciseId: "plank", sets: 2, reps: "30 sec", restSeconds: 30 },
    ],
    cooldown: [
      { exerciseId: "childs_pose", sets: 1, reps: "30 sec", restSeconds: 0 },
      { exerciseId: "cat_cow", sets: 1, reps: "30 sec", restSeconds: 0 },
    ],
    hflProductTip: "Body-Brain Energy can help boost your physical and mental energy levels for better workout performance.",
  },
  
  // FAT BURNING CIRCUIT (25 min)
  {
    id: "fat_burner",
    name: "Fat Burning Circuit",
    description: "High-intensity circuit designed to maximize calorie burn and boost metabolism. Great for weight loss goals.",
    type: "hiit",
    duration: 25,
    difficulty: "intermediate",
    equipment: ["bodyweight", "dumbbells"],
    targetMuscles: ["full_body"],
    goals: ["lose_fat", "general_fitness"],
    warmup: [
      { exerciseId: "jumping_jacks", sets: 1, reps: "60 sec", restSeconds: 15 },
      { exerciseId: "high_knees", sets: 1, reps: "30 sec", restSeconds: 15 },
    ],
    exercises: [
      { exerciseId: "burpees", sets: 3, reps: "10", restSeconds: 30 },
      { exerciseId: "jump_squats", sets: 3, reps: "15", restSeconds: 30 },
      { exerciseId: "mountain_climbers", sets: 3, reps: "45 sec", restSeconds: 30 },
      { exerciseId: "dumbbell_rows", sets: 3, reps: "12 each", restSeconds: 30 },
      { exerciseId: "push_ups", sets: 3, reps: "12", restSeconds: 30 },
      { exerciseId: "russian_twists", sets: 3, reps: "20", restSeconds: 30 },
    ],
    cooldown: [
      { exerciseId: "downward_dog", sets: 1, reps: "45 sec", restSeconds: 0 },
      { exerciseId: "childs_pose", sets: 1, reps: "45 sec", restSeconds: 0 },
    ],
    hflProductTip: "Lean Optimizer can help boost your metabolism and reduce appetite for better fat loss results.",
  },
  
  // STRENGTH FOUNDATION (45 min)
  {
    id: "strength_foundation",
    name: "Strength Foundation",
    description: "Build a solid strength base with compound movements. Focus on proper form and progressive overload.",
    type: "strength",
    duration: 45,
    difficulty: "intermediate",
    equipment: ["dumbbells", "bench"],
    targetMuscles: ["chest", "back", "shoulders", "quads", "glutes"],
    goals: ["build_muscle", "increase_strength"],
    warmup: [
      { exerciseId: "jumping_jacks", sets: 1, reps: "60 sec", restSeconds: 15 },
      { exerciseId: "squats", sets: 1, reps: "10", restSeconds: 15, notes: "Warm-up set, no weight" },
    ],
    exercises: [
      { exerciseId: "goblet_squats", sets: 4, reps: "10-12", restSeconds: 90 },
      { exerciseId: "dumbbell_bench_press", sets: 4, reps: "8-10", restSeconds: 90 },
      { exerciseId: "dumbbell_rows", sets: 4, reps: "10 each", restSeconds: 60 },
      { exerciseId: "shoulder_press", sets: 3, reps: "10-12", restSeconds: 60 },
      { exerciseId: "romanian_deadlift", sets: 3, reps: "10-12", restSeconds: 60 },
      { exerciseId: "plank", sets: 3, reps: "45 sec", restSeconds: 45 },
    ],
    cooldown: [
      { exerciseId: "hip_flexor_stretch", sets: 1, reps: "30 sec each", restSeconds: 0 },
      { exerciseId: "childs_pose", sets: 1, reps: "60 sec", restSeconds: 0 },
    ],
    hflProductTip: "AlphaViril can help optimize testosterone levels for better muscle growth and strength gains.",
  },
  
  // STRESS RELIEF FLOW (20 min)
  {
    id: "stress_relief",
    name: "Stress Relief Flow",
    description: "Gentle movement and stretching to reduce tension and calm the mind. Perfect after a stressful day.",
    type: "yoga",
    duration: 20,
    difficulty: "beginner",
    equipment: ["bodyweight", "none"],
    targetMuscles: ["full_body"],
    goals: ["reduce_stress", "general_fitness"],
    exercises: [
      { exerciseId: "cat_cow", sets: 1, reps: "10 breaths", restSeconds: 0 },
      { exerciseId: "childs_pose", sets: 1, reps: "60 sec", restSeconds: 0 },
      { exerciseId: "downward_dog", sets: 1, reps: "60 sec", restSeconds: 0 },
      { exerciseId: "hip_flexor_stretch", sets: 1, reps: "45 sec each", restSeconds: 0 },
      { exerciseId: "pigeon_pose", sets: 1, reps: "60 sec each", restSeconds: 0 },
      { exerciseId: "glute_bridges", sets: 2, reps: "10", restSeconds: 30, notes: "Slow and controlled" },
      { exerciseId: "dead_bug", sets: 2, reps: "10 each", restSeconds: 30 },
      { exerciseId: "standing_quad_stretch", sets: 1, reps: "30 sec each", restSeconds: 0 },
    ],
    hflProductTip: "Stress & Cortisol Relief can help lower stress hormones and improve relaxation.",
  },
  
  // RECOVERY & MOBILITY (15 min)
  {
    id: "recovery_mobility",
    name: "Recovery & Mobility",
    description: "Active recovery session to improve flexibility and reduce muscle soreness. Great for rest days.",
    type: "mobility",
    duration: 15,
    difficulty: "beginner",
    equipment: ["bodyweight", "none"],
    targetMuscles: ["full_body"],
    goals: ["general_fitness", "reduce_stress"],
    exercises: [
      { exerciseId: "cat_cow", sets: 1, reps: "2 min", restSeconds: 0 },
      { exerciseId: "downward_dog", sets: 1, reps: "60 sec", restSeconds: 0 },
      { exerciseId: "hip_flexor_stretch", sets: 1, reps: "60 sec each", restSeconds: 0 },
      { exerciseId: "pigeon_pose", sets: 1, reps: "90 sec each", restSeconds: 0 },
      { exerciseId: "standing_quad_stretch", sets: 1, reps: "45 sec each", restSeconds: 0 },
      { exerciseId: "childs_pose", sets: 1, reps: "2 min", restSeconds: 0 },
    ],
    hflProductTip: "Inflame & Pain Relief can help reduce inflammation and improve joint mobility.",
  },
  
  // UPPER BODY BLAST (30 min)
  {
    id: "upper_body",
    name: "Upper Body Blast",
    description: "Target your chest, back, shoulders, and arms for a complete upper body workout.",
    type: "strength",
    duration: 30,
    difficulty: "intermediate",
    equipment: ["dumbbells", "bench"],
    targetMuscles: ["chest", "back", "shoulders", "biceps", "triceps"],
    goals: ["build_muscle", "increase_strength"],
    warmup: [
      { exerciseId: "jumping_jacks", sets: 1, reps: "45 sec", restSeconds: 15 },
      { exerciseId: "push_ups", sets: 1, reps: "8", restSeconds: 15, notes: "Warm-up set" },
    ],
    exercises: [
      { exerciseId: "dumbbell_bench_press", sets: 3, reps: "10-12", restSeconds: 60 },
      { exerciseId: "dumbbell_rows", sets: 3, reps: "10 each", restSeconds: 60 },
      { exerciseId: "shoulder_press", sets: 3, reps: "10-12", restSeconds: 60 },
      { exerciseId: "lateral_raises", sets: 3, reps: "12-15", restSeconds: 45 },
      { exerciseId: "bicep_curls", sets: 3, reps: "12", restSeconds: 45 },
      { exerciseId: "tricep_dips", sets: 3, reps: "12", restSeconds: 45 },
    ],
    cooldown: [
      { exerciseId: "childs_pose", sets: 1, reps: "45 sec", restSeconds: 0 },
    ],
    hflProductTip: "Blood Flow Optimizer can improve circulation to muscles for better pumps and recovery.",
  },
  
  // LOWER BODY POWER (30 min)
  {
    id: "lower_body",
    name: "Lower Body Power",
    description: "Build strong legs and glutes with this focused lower body session.",
    type: "strength",
    duration: 30,
    difficulty: "intermediate",
    equipment: ["dumbbells"],
    targetMuscles: ["quads", "hamstrings", "glutes", "calves"],
    goals: ["build_muscle", "increase_strength"],
    warmup: [
      { exerciseId: "jumping_jacks", sets: 1, reps: "45 sec", restSeconds: 15 },
      { exerciseId: "squats", sets: 1, reps: "12", restSeconds: 15, notes: "Warm-up, no weight" },
    ],
    exercises: [
      { exerciseId: "goblet_squats", sets: 4, reps: "12", restSeconds: 60 },
      { exerciseId: "romanian_deadlift", sets: 4, reps: "10", restSeconds: 60 },
      { exerciseId: "lunges", sets: 3, reps: "10 each", restSeconds: 60 },
      { exerciseId: "glute_bridges", sets: 3, reps: "15", restSeconds: 45 },
      { exerciseId: "calf_raises", sets: 3, reps: "15", restSeconds: 30 },
    ],
    cooldown: [
      { exerciseId: "hip_flexor_stretch", sets: 1, reps: "45 sec each", restSeconds: 0 },
      { exerciseId: "standing_quad_stretch", sets: 1, reps: "30 sec each", restSeconds: 0 },
    ],
    hflProductTip: "AlphaViril can help boost testosterone for better leg strength and muscle development.",
  },
  
  // CORE CRUSHER (20 min)
  {
    id: "core_crusher",
    name: "Core Crusher",
    description: "Strengthen your entire core including abs, obliques, and lower back.",
    type: "strength",
    duration: 20,
    difficulty: "intermediate",
    equipment: ["bodyweight", "none"],
    targetMuscles: ["core"],
    goals: ["build_muscle", "general_fitness"],
    warmup: [
      { exerciseId: "cat_cow", sets: 1, reps: "60 sec", restSeconds: 15 },
    ],
    exercises: [
      { exerciseId: "plank", sets: 3, reps: "45 sec", restSeconds: 30 },
      { exerciseId: "crunches", sets: 3, reps: "20", restSeconds: 30 },
      { exerciseId: "mountain_climbers", sets: 3, reps: "30 sec", restSeconds: 30 },
      { exerciseId: "russian_twists", sets: 3, reps: "20", restSeconds: 30 },
      { exerciseId: "dead_bug", sets: 3, reps: "10 each", restSeconds: 30 },
      { exerciseId: "superman", sets: 3, reps: "12", restSeconds: 30 },
    ],
    cooldown: [
      { exerciseId: "childs_pose", sets: 1, reps: "60 sec", restSeconds: 0 },
    ],
    hflProductTip: "Blood Sugar Optimizer can help reduce belly fat when combined with core training.",
  },
  
  // BODYWEIGHT BASICS (25 min)
  {
    id: "bodyweight_basics",
    name: "Bodyweight Basics",
    description: "No equipment needed! A complete workout using just your body weight. Perfect for home or travel.",
    type: "circuit",
    duration: 25,
    difficulty: "beginner",
    equipment: ["bodyweight", "none"],
    targetMuscles: ["full_body"],
    goals: ["general_fitness", "build_muscle"],
    warmup: [
      { exerciseId: "jumping_jacks", sets: 1, reps: "45 sec", restSeconds: 15 },
      { exerciseId: "high_knees", sets: 1, reps: "30 sec", restSeconds: 15 },
    ],
    exercises: [
      { exerciseId: "squats", sets: 3, reps: "15", restSeconds: 45 },
      { exerciseId: "push_ups", sets: 3, reps: "10-12", restSeconds: 45 },
      { exerciseId: "lunges", sets: 3, reps: "10 each", restSeconds: 45 },
      { exerciseId: "superman", sets: 3, reps: "12", restSeconds: 45 },
      { exerciseId: "plank", sets: 3, reps: "30 sec", restSeconds: 30 },
      { exerciseId: "glute_bridges", sets: 3, reps: "15", restSeconds: 30 },
    ],
    cooldown: [
      { exerciseId: "downward_dog", sets: 1, reps: "45 sec", restSeconds: 0 },
      { exerciseId: "childs_pose", sets: 1, reps: "45 sec", restSeconds: 0 },
    ],
    hflProductTip: "Perfect Vitamin D3 + K2 supports energy levels and bone health for better workout performance.",
  },
  
  // EVENING WIND-DOWN (15 min)
  {
    id: "evening_winddown",
    name: "Evening Wind-Down",
    description: "Gentle stretching and relaxation to prepare your body for restful sleep.",
    type: "stretching",
    duration: 15,
    difficulty: "beginner",
    equipment: ["bodyweight", "none"],
    targetMuscles: ["full_body"],
    goals: ["reduce_stress", "general_fitness"],
    exercises: [
      { exerciseId: "cat_cow", sets: 1, reps: "2 min", restSeconds: 0 },
      { exerciseId: "childs_pose", sets: 1, reps: "90 sec", restSeconds: 0 },
      { exerciseId: "hip_flexor_stretch", sets: 1, reps: "60 sec each", restSeconds: 0 },
      { exerciseId: "pigeon_pose", sets: 1, reps: "90 sec each", restSeconds: 0 },
      { exerciseId: "downward_dog", sets: 1, reps: "60 sec", restSeconds: 0 },
      { exerciseId: "standing_quad_stretch", sets: 1, reps: "30 sec each", restSeconds: 0 },
    ],
    hflProductTip: "Deep Sleep Formula can help you fall asleep faster and enjoy deeper, more restorative sleep.",
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

export function getTemplateById(id: string): WorkoutTemplate | undefined {
  return WORKOUT_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByGoal(goal: FitnessGoal): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter(t => t.goals.includes(goal));
}

export function getTemplatesByEquipment(equipment: Equipment[]): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter(t => 
    t.equipment.every(e => equipment.includes(e) || e === "none" || e === "bodyweight")
  );
}

export function getTemplatesByDuration(maxMinutes: number): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter(t => t.duration <= maxMinutes);
}

export function getTemplatesByDifficulty(difficulty: Difficulty): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter(t => t.difficulty === difficulty);
}

export function getExercisesByMuscle(muscle: MuscleGroup): Exercise[] {
  return EXERCISES.filter(e => 
    e.primaryMuscles.includes(muscle) || e.secondaryMuscles.includes(muscle)
  );
}

export function getExercisesByEquipment(equipment: Equipment[]): Exercise[] {
  return EXERCISES.filter(e => 
    e.equipment.some(eq => equipment.includes(eq))
  );
}

export function calculateWorkoutCalories(template: WorkoutTemplate): number {
  let totalCalories = 0;
  const allExercises = [
    ...(template.warmup || []),
    ...template.exercises,
    ...(template.cooldown || []),
  ];
  
  for (const te of allExercises) {
    const exercise = getExerciseById(te.exerciseId);
    if (exercise) {
      // Estimate time per exercise based on sets and reps
      const timePerSet = te.reps.includes("sec") 
        ? parseInt(te.reps) / 60 
        : 0.5; // Assume 30 seconds per set for rep-based
      const totalTime = te.sets * (timePerSet + te.restSeconds / 60);
      totalCalories += exercise.caloriesPerMinute * totalTime;
    }
  }
  
  return Math.round(totalCalories);
}
