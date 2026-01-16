# Fitness App Workout Features Research

## Key Findings from Popular Apps

### 1. Fitbod (AI-Powered Personalization)
**Core Personalization Features:**
- **Training History Analysis**: Tracks lifts, weights, performance trends over time
- **Fatigue Scoring**: Calculates muscle group freshness, recommends balanced recovery
- **Progressive Overload**: Automatically increases weight/reps when user masters current level
- **Goal-Based Adjustments**:
  - Hypertrophy = higher volume, moderate load
  - Strength = lower reps, heavier load
  - Endurance = higher reps, lighter load
- **Equipment Inventory**: Only suggests exercises matching available equipment
- **Intelligent Variation**: Rotates movements to prevent plateaus and overuse injuries

**Personalization Loop:**
1. User logs sets, reps, weights, difficulty rating
2. App analyzes muscle recovery status
3. Calculates training volume for progressive overload
4. Adjusts for user goals
5. Applies variation to prevent stagnation
6. Generates next workout

### 2. Hevy (Workout Logging & Tracking)
**Progress Tracking:**
- Gym performance tracking
- Monthly reports
- Muscle group workout charts
- Sets per muscle group per week
- Body measurements
- Progress photos
- Workout consistency & streak

**Workout Logging:**
- Start empty workout or use templates
- Custom exercise notes
- Automatic rest timer
- Add/remove sets dynamically
- Workout set types (warm-up, working, drop sets)
- Previous workout values displayed
- Warm-up set calculator
- Weight plate calculator
- RPE (Rate of Perceived Exertion)
- Supersets support
- Live personal record notifications

**Organization:**
- Create folders and gym routines
- Routine library (pre-built templates)
- Exercise library (searchable database)
- Create custom exercises

### 3. Nike Training Club (Guided Workouts)
**Workout Types:**
- Strength training
- Conditioning/HIIT
- Yoga & Pilates
- Recovery & mobility
- Mindfulness

**Features:**
- 185+ free workouts
- Video-guided sessions
- Periodized programs (multi-week plans)
- Bodyweight-only options
- Full-equipment options
- Various durations (5-60 minutes)

### 4. Strong App (Simple Logging)
- Supersets support
- Custom exercises
- CSV export
- Apple Health integration
- Warm-up calculator
- Siri shortcuts
- 3rd party integrations
- RPE tracking
- Workout templates (up to 3 free)

---

## Recommended Features for HFL Vitality Tracker

### User Onboarding Questions
1. **Fitness Goal**: Build muscle, lose weight, improve endurance, general fitness, sport-specific
2. **Experience Level**: Beginner, intermediate, advanced
3. **Available Equipment**: Home (bodyweight, dumbbells, bands), Gym (full equipment), Hybrid
4. **Workout Frequency**: 2-3x/week, 4-5x/week, 6-7x/week
5. **Time Per Session**: 15-30 min, 30-45 min, 45-60 min, 60+ min
6. **Focus Areas**: Upper body, lower body, core, full body, specific muscle groups

### Workout Templates/Routines
**By Goal:**
- Fat Loss Circuit (HIIT-style)
- Muscle Building (hypertrophy focus)
- Strength Foundation (compound lifts)
- Mobility & Recovery
- Quick Energy Boost (15-20 min)

**By Split:**
- Full Body (2-3x/week)
- Upper/Lower Split (4x/week)
- Push/Pull/Legs (6x/week)
- Bro Split (5x/week)

**By Equipment:**
- Bodyweight Only
- Dumbbell Only
- Resistance Bands
- Full Gym

### Exercise Library Structure
Each exercise should have:
- Name
- Primary muscle group(s)
- Secondary muscle group(s)
- Equipment required
- Difficulty level
- Video/GIF demonstration (optional)
- Instructions/cues
- Common mistakes

### Logging Features
- Sets x Reps x Weight
- Rest timer between sets
- RPE (1-10 difficulty rating)
- Notes per exercise
- Superset grouping
- Personal records tracking

### Progress Tracking
- Volume over time (sets x reps x weight)
- Frequency by muscle group
- Streak/consistency
- Personal records history
- Weekly/monthly summaries

### AI Integration (Dr. Sam)
- Analyze workout patterns
- Suggest recovery days based on symptom scores
- Correlate workout intensity with energy/mood
- Recommend HFL products based on fitness goals
- Adjust recommendations based on sleep quality

---

## Implementation Priority for HFL

### Phase 1: Basic Templates
- Pre-built workout routines (5-10 templates)
- Quick-start workouts by goal
- Equipment filtering

### Phase 2: Personalization
- Fitness goal onboarding
- Equipment inventory
- Experience level adjustment

### Phase 3: AI Integration
- Dr. Sam workout recommendations
- Recovery suggestions based on symptoms
- Product recommendations based on fitness goals
