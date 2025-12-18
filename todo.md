# HFL Vitality Tracker - TODO

## Database & Backend
- [x] Create database schema with all required tables
- [x] Set up user authentication with OAuth
- [x] Create API endpoints for user profile management
- [x] Create API endpoints for biomarkers CRUD
- [x] Create API endpoints for symptoms CRUD
- [x] Create API endpoints for supplements CRUD
- [x] Create API endpoints for menstrual cycle tracking
- [x] Implement streak calculation logic
- [x] Implement cycle day calculation logic
- [x] Create API endpoints for insights
- [x] Create API endpoints for notification settings

## Onboarding Flow
- [x] Create welcome screen with app intro
- [x] Create profile setup screen with biological sex selection
- [x] Add age input to profile setup
- [x] Add cycle tracking question (female only)
- [x] Implement onboarding navigation flow

## Dashboard Screen
- [x] Create dashboard layout with sections
- [x] Add quick stat cards
- [x] Implement sex-specific stat card content
- [x] Add streak counter card with fire emoji
- [x] Add cycle day card for females
- [x] Create today's actions section
- [x] Add daily check-in button
- [x] Add supplement checklist
- [x] Implement navigation to other screens from dashboard

## Biomarkers Screen
- [x] Create biomarkers screen layout
- [x] Add biomarker selection with sex-specific options
- [x] Add date input for test date
- [x] Add value input with units
- [x] Add notes field
- [x] Add "Add Result" button with validation
- [x] Create biomarker list view with all entries
- [x] Add delete functionality for entries

## Symptoms Screen
- [x] Create symptoms screen layout
- [x] Add today's log form section
- [x] Add universal symptom sliders (Energy, Mood, Sleep, Clarity)
- [x] Add sex-specific symptom sliders (Libido, Performance/Stamina)
- [x] Add emoji indicators for slider values
- [x] Add menstrual flow selector (female, during period)
- [x] Add period symptoms checkboxes (female, during period)
- [x] Add notes text area
- [x] Add "Save Daily Log" button with streak display
- [x] Show completed state when today's log is done

## Supplements Screen
- [x] Create supplements screen layout
- [x] Add today's checklist section
- [x] Add supplement checkboxes with AM/PM options
- [x] Implement auto-save on checkbox click
- [x] Add completion percentage display
- [x] Create supplements list with active/paused sections
- [x] Add "Add Supplement" button
- [x] Create add supplement modal
- [x] Add supplement name input
- [x] Add dosage input
- [x] Add timing dropdown
- [x] Add notes text area
- [x] Implement supplement save functionality
- [x] Add pause/resume functionality for supplements
- [x] Add delete functionality for supplements

## Insights Screen
- [x] Create insights screen layout
- [x] Add 7-day averages section
- [x] Add pattern detection (energy trends)
- [x] Add health tips section
- [x] Add AI insights list
- [x] Add cycle-aware testing tips for females

## Profile Screen
- [x] Create profile screen layout
- [x] Add user info section with avatar
- [x] Add stats overview (streak, lab results, logs)
- [x] Add cycle tracking toggle (female)
- [x] Add notification settings section
- [x] Add daily symptom reminder toggle
- [x] Add supplement reminders toggle
- [x] Add weekly insights email toggle
- [x] Add period prediction notifications toggle (female)
- [x] Add ovulation window notifications toggle (female)
- [x] Add data management section
- [x] Add "Export My Data" button
- [x] Add "Delete Account" link with confirmation
- [x] Add logout functionality

## Theme & Styling
- [x] Update theme colors to deep teal/cyan palette
- [x] Add cycle phase colors for female users
- [x] Add surface and border colors
- [x] Add dark mode support

## Icons & Navigation
- [x] Add icon mappings for all tabs
- [x] Update tab bar with proper icons (5 tabs)
- [x] Configure bottom tab navigation

## Branding
- [x] Generate custom app logo
- [x] Update app icon
- [x] Update splash screen icon
- [x] Update favicon
- [x] Update Android icon
- [x] Update app name in config
- [x] Set logo URL in config

## Future Enhancements
- [ ] Add charts for biomarker trends (Victory Native)
- [x] Add calendar view for symptom history
- [ ] Add PDF export for health reports
- [ ] Add lab PDF upload functionality
- [ ] Add push notification scheduling
- [ ] Add reference ranges for biomarkers
- [ ] Add premium features section

## Phase 2 Enhancements

### Data Visualization & Analytics
- [x] Add line charts for biomarker trends using SVG
- [x] Implement color-coded reference ranges (optimal, borderline, concerning)
- [x] Add correlation analysis showing supplement impact on symptoms
- [x] Create weekly summary view

### Cycle Tracking Enhancements (Female)
- [x] Implement period prediction algorithm based on historical data
- [x] Add fertile window and ovulation estimates
- [x] Show cycle phase overlays (cycle wheel component)

### User Experience Improvements
- [ ] Add quick-log functionality from dashboard
- [ ] Implement smart reminder suggestions
- [x] Add calendar view for symptom history

### Engagement Features
- [x] Add achievement badges for streaks and milestones
- [x] Create educational content for each biomarker
- [x] Add optimal ranges and improvement tips

### Technical Enhancements
- [x] Implement offline support with AsyncStorage caching
- [x] Add data sync queue for offline changes

## Phase 3 Features

### Calendar View
- [x] Create calendar component with month navigation
- [x] Show logged days with color indicators
- [x] Add cycle phase color coding for females
- [x] Implement day tap to view details
- [x] Integrate calendar into symptoms screen

### Push Notifications
- [x] Set up Expo Notifications
- [x] Implement daily symptom reminder scheduling
- [x] Add supplement reminder notifications
- [x] Create notification settings UI
- [x] Handle notification permissions

### Health Report Export
- [x] Create health report template
- [x] Generate text report with symptom summaries
- [x] Include biomarker data in report
- [x] Add supplement protocol data
- [x] Implement share functionality via native share sheet

## Bug Fixes

- [x] Fix profile update error on onboarding "Complete Setup" - TRPCClientError (added login requirement notice)
