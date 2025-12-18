# HFL Vitality Tracker - Mobile App Design Document

## App Overview

**HFL Vitality Tracker** is a health tracking mobile application designed for men and women to track hormones, biomarkers, daily symptoms, and supplement protocols. The app features sex-specific content, menstrual cycle tracking for females, and AI-powered insights based on user data.

## Design Philosophy

This app follows **Apple Human Interface Guidelines (HIG)** to feel like a first-party iOS app. The design is clean, professional, and gender-neutral while adapting content based on biological sex.

### Target Audience
- Men tracking testosterone, libido, energy, and performance
- Women tracking estrogen, progesterone, menstrual cycles, and hormone balance
- Users aged 25-65 seeking natural hormone optimization

### Core User Needs
- Easy daily symptom logging with streak tracking
- Visual hormone/biomarker trends over time
- Supplement protocol tracking with adherence metrics
- Cycle-aware insights for women
- Data export for sharing with healthcare providers

## Visual Design

### Color Palette
- **Primary**: Deep Teal `#0D7C8C` (professional, gender-neutral)
- **Accent**: Vibrant Cyan `#00C9D7` (energy, vitality)
- **Secondary Accent**: Coral `#FF6B6B` (warmth, alerts)
- **Background Light**: `#FFFFFF`
- **Background Dark**: `#151718`
- **Surface Light**: `#F8F9FA`
- **Surface Dark**: `#1E2022`
- **Text Primary Light**: `#11181C`
- **Text Primary Dark**: `#ECEDEE`
- **Text Secondary Light**: `#687076`
- **Text Secondary Dark**: `#9BA1A6`

### Cycle Phase Colors (Female-specific)
- **Menstruation**: `#FF6B6B` (red)
- **Follicular**: `#6BB6FF` (light blue)
- **Ovulation**: `#FFD93D` (yellow)
- **Luteal**: `#B565D8` (purple)

### Typography
- **Title**: 32pt, Bold, Line Height 40pt
- **Subtitle**: 20pt, Bold, Line Height 28pt
- **Body**: 16pt, Regular, Line Height 24pt
- **Caption**: 14pt, Regular, Line Height 20pt
- **Small**: 12pt, Regular, Line Height 18pt

### Spacing & Layout
- **Grid**: 8pt base unit
- **Card Padding**: 16pt
- **Section Spacing**: 24pt
- **Border Radius**: Cards 12pt, Buttons 8pt, Sheets 16pt
- **Touch Targets**: Minimum 44pt

### Icons
- **Tab Bar**: 28pt, filled style
- **Buttons**: 24pt, filled style
- **List Items**: 20pt, filled style

## Screen Structure

### Navigation Architecture

**Bottom Tab Navigation (5 tabs)**
1. **Dashboard** (house.fill) - Home screen with quick stats
2. **Biomarkers** (chart.bar.fill) - Hormone & lab tracking
3. **Symptoms** (heart.text.square.fill) - Daily symptom journal
4. **Supplements** (pills.fill) - Protocol tracker
5. **Profile** (person.fill) - Settings & insights

### Screen List

#### 1. Onboarding Flow (Modal Stack)
- **Welcome Screen**: App intro, benefits overview
- **Sign Up Screen**: Email/password registration
- **Profile Setup Screen**: 
  - Biological sex selection (Male/Female/Prefer not to say)
  - Age input
  - Primary goals (sex-specific multi-select)
  - Current symptoms (sex-specific multi-select)
  - Lab work question (Yes/No)
  - Cycle tracking question (Female only, Yes/No)

#### 2. Dashboard Screen (Home Tab)
- **Top Section**: 4 quick stat cards in 2x2 grid
  - Male: Latest Testosterone, Streak, Energy Trend, Next Lab Due
  - Female: Latest Estradiol, Streak, Energy Trend, Cycle Day/Next Lab
- **Middle Section**: Today's Actions
  - Daily Check-In button (highlighted if incomplete)
  - Supplement checklist (AM/PM checkboxes)
  - Period symptoms button (Female, during menstruation)
  - Completion message when done
- **Bottom Section**: Recent Activity timeline

#### 3. Biomarkers Screen (Tab 2)
- **Header**: "Hormone & Biomarker Tracking"
- **Add Form**: Dropdown (sex-specific options), date picker, value input, cycle day (female)
- **Tabs**: One tab per tracked biomarker
- **Chart View**: Line chart with color-coded zones (optimal/acceptable/concern/clinical)
- **Table View**: All entries with edit/delete
- **Lab Upload**: PDF upload zone

#### 4. Symptoms Screen (Tab 3)
- **Today's Log Form**: 
  - Universal sliders: Energy, Mood, Sleep, Mental Clarity (1-10)
  - Sex-specific sliders: Libido, Performance/Stamina (1-10)
  - Female cycle tracking: Flow level, period symptoms (during menstruation)
  - Notes text area
  - Save button with streak display
- **Trends Section**: 30-day line chart with cycle phase overlay (female)
- **Calendar View**: Logged days with cycle phase colors (female)

#### 5. Supplements Screen (Tab 4)
- **Today's Checklist**: Active supplements with AM/PM checkboxes
- **My Supplements Table**: Name, Dosage, Timing, Adherence %, Actions
- **Add Form (Modal)**: Name autocomplete (sex-specific), dosage, timing, start date, notes
- **Performance Cards**: Before/after comparison for each supplement

#### 6. Insights Screen (Accessible from Profile)
- **Pattern Cards**: Key correlations detected (sex-specific language)
- **Recommendations**: Based on user data with educational links
- **Premium Upsell**: Feature comparison, upgrade CTA

#### 7. Profile Screen (Tab 5)
- **User Info**: Sex, age, goals, account date, premium badge
- **Notification Settings**: Daily reminders, supplement alerts, cycle predictions (female)
- **Data Management**: Export all data (CSV), download report (PDF), delete account
- **Subscription**: Plan details, billing (if premium)
- **Navigation**: Link to Insights screen

## Key User Flows

### Flow 1: First-Time User Onboarding
1. User opens app → Welcome screen
2. Tap "Get Started" → Sign up with email/password
3. Complete profile setup (sex, age, goals, symptoms)
4. If female, choose cycle tracking option
5. Land on Dashboard with empty state prompts

### Flow 2: Daily Check-In
1. User opens app → Dashboard shows "Daily Check-In" button highlighted
2. Tap button → Navigate to Symptoms screen with today's form
3. Adjust sliders for energy, mood, sleep, clarity, libido, performance
4. If female during period, mark flow level and symptoms
5. Add optional notes
6. Tap "Save Daily Log" → See streak count, return to Dashboard
7. Dashboard shows "✓ All done for today!"

### Flow 3: Adding a Biomarker Result
1. Navigate to Biomarkers tab
2. Select biomarker from dropdown (e.g., "Testosterone (Total)" for males)
3. Pick test date (defaults to today)
4. Enter value (e.g., "485") with auto-displayed unit (ng/dL)
5. If female with cycle tracking, optionally enter cycle day
6. Tap "Add Result"
7. Chart updates with new data point in color-coded zone
8. Table shows new entry at top

### Flow 4: Tracking Supplements
1. Navigate to Supplements tab
2. Tap "Add Supplement" → Modal opens
3. Start typing "Zinc" → Autocomplete suggests
4. Enter dosage "50mg", select timing "Morning"
5. Tap "Save" → Supplement added to list
6. Daily checklist now shows "Zinc 50mg" with AM checkbox
7. Each morning, check AM box → Auto-saves, updates adherence %

### Flow 5: Viewing Cycle Patterns (Female)
1. Navigate to Symptoms tab
2. Scroll to calendar view
3. Calendar shows color-coded days (red=menstruation, blue=follicular, etc.)
4. Tap any day → See that day's symptom entries and cycle day
5. Scroll to trends chart → Background shaded by cycle phase
6. Notice energy dips during menstruation phase
7. Navigate to Insights → See "Your energy drops 35% during Days 1-5"

### Flow 6: Exporting Data for Doctor
1. Navigate to Profile tab
2. Scroll to Data Management section
3. Tap "Download Health Report" → PDF generates with charts
4. Share PDF via system share sheet
5. Or tap "Export All Data" → CSV downloads with all entries

## Sex-Specific Adaptations

### Male Users
- **Biomarkers**: Testosterone (Total/Free), SHBG, Estradiol, DHT, PSA + shared markers
- **Goals**: Optimize testosterone, improve libido, increase energy, build muscle, etc.
- **Symptoms**: Low energy, reduced libido, erectile dysfunction, joint pain, etc.
- **Dashboard**: Latest Testosterone card, no cycle tracking
- **Insights**: Testosterone correlations, libido patterns, workout performance
- **Supplements**: Tongkat Ali, Fadogia, Boron, Zinc, Creatine suggestions

### Female Users
- **Biomarkers**: Estradiol, Progesterone, FSH, LH, Prolactin, AMH, DHEA-S + shared markers
- **Goals**: Balance hormones, manage menopause, support thyroid, PCOS support, etc.
- **Symptoms**: Low energy, irregular periods, hot flashes, mood swings, PMS, etc.
- **Dashboard**: Latest Estradiol card, Cycle Day card (if tracking enabled)
- **Cycle Tracking**: Mark period start/end, automatic cycle day counter, phase overlays
- **Insights**: Cycle patterns, hormone correlations, PMS predictions
- **Supplements**: Vitex, Evening Primrose Oil, Maca, DIM, Iron suggestions

### Prefer Not to Say
- **Access**: All biomarkers, symptoms, and features (most inclusive)
- **Goals**: Combined list from both male and female options
- **Dashboard**: Latest primary biomarker (whatever they track most)

## Technical Implementation Notes

### Data Storage
- **Authentication**: Built-in auth system with email/password
- **Database**: PostgreSQL with tables for users, biomarkers, symptoms, cycles, supplements, logs, insights
- **Local Caching**: AsyncStorage for offline access to recent data

### Conditional Logic
- All sex-specific features check `user.biological_sex` from database
- Biomarker dropdowns, symptom questions, reference ranges, insights language, supplement suggestions all adapt
- Cycle tracking features only visible if `user.cycle_tracking_enabled === true`

### Charts & Visualizations
- Use Victory Native for React Native charts (line charts, sparklines)
- Color-coded background zones based on sex + age reference ranges
- Cycle phase overlays for female users with tracking enabled
- Smooth animations on data updates

### Notifications
- Local notifications for daily symptom reminders
- Supplement reminders at user-specified times
- Period prediction notifications (female with cycle tracking)
- Ovulation window notifications (female with cycle tracking)

### Data Export
- CSV export: All biomarkers, symptoms, supplements, cycle data
- PDF report: Summary with embedded charts (use react-native-pdf or web view)

### MVP Simplifications
- Lab PDF upload saves file but doesn't auto-extract (manual process)
- AI insights use template-based calculations, not LLM (can upgrade later)
- Cycle predictions use simple average (28-day default + user history)
- Premium features mocked (upgrade shows "Coming Soon")
- Supplement autocomplete uses hardcoded list (50 common supplements)

## Component Architecture

### Reusable Components
- **StatCard**: Quick stat display with icon, value, trend arrow, change %
- **SymptomSlider**: Slider with emoji indicators and value label
- **BiomarkerChart**: Line chart with reference zones and data points
- **SupplementCheckbox**: Checkbox with name, dosage, timing
- **CycleCalendar**: Calendar grid with phase color coding
- **InsightCard**: Pattern display with icon, text, data source
- **ThemedButton**: Primary/secondary button styles with haptic feedback
- **ThemedInput**: Text input with validation and error states
- **ThemedDropdown**: Dropdown with search/filter
- **EmptyState**: Placeholder for empty lists with CTA

### Screen Components
- **OnboardingScreen**: Modal stack with step indicator
- **DashboardScreen**: ScrollView with stat cards, action buttons, timeline
- **BiomarkersScreen**: Tabs with chart view and form
- **SymptomsScreen**: Form with sliders, calendar, trends chart
- **SupplementsScreen**: Checklist, table, add form modal
- **InsightsScreen**: Pattern cards, recommendations, upsell
- **ProfileScreen**: Settings list with sections

## Accessibility

- All touch targets minimum 44pt
- Text contrast ratio minimum 4.5:1
- Support for system font size scaling
- VoiceOver labels on all interactive elements
- Haptic feedback on button presses
- Dark mode support throughout

## Performance Considerations

- FlatList for all scrollable lists (biomarkers, symptoms history, supplements)
- Memoized chart components to prevent unnecessary re-renders
- Lazy load historical data (paginate symptom logs, biomarker entries)
- Optimize images (app icon, splash screen)
- Bundle size monitoring (keep under 50MB)

## Future Enhancements (Post-MVP)

- LLM-powered personalized insights
- Lab PDF auto-extraction with OCR
- Integration with wearables (Apple Health, Google Fit)
- Social features (share progress with accountability partner)
- Telemedicine integration (book consults with hormone specialists)
- Premium features (advanced analytics, unlimited biomarkers, priority support)
- Multi-language support
- Web dashboard for desktop access
