ALTER TABLE `users` ADD `fitnessGoal` enum('build_muscle','lose_fat','improve_energy','reduce_stress','general_fitness','increase_strength');--> statement-breakpoint
ALTER TABLE `users` ADD `fitnessExperience` enum('beginner','intermediate','advanced');--> statement-breakpoint
ALTER TABLE `users` ADD `availableEquipment` json;--> statement-breakpoint
ALTER TABLE `users` ADD `workoutFrequency` enum('2_3_per_week','4_5_per_week','6_7_per_week');--> statement-breakpoint
ALTER TABLE `users` ADD `preferredWorkoutDuration` enum('15_30_min','30_45_min','45_60_min','60_plus_min');--> statement-breakpoint
ALTER TABLE `users` ADD `fitnessOnboardingCompleted` boolean DEFAULT false;