CREATE TABLE `workouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workoutDate` date NOT NULL,
	`workoutType` enum('strength','cardio','hiit','yoga','stretching','sports','walking','other') NOT NULL,
	`name` varchar(255),
	`durationMinutes` int,
	`caloriesBurned` int,
	`intensity` enum('low','moderate','high','very_high'),
	`exercises` json,
	`heartRateAvg` int,
	`heartRateMax` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workouts_id` PRIMARY KEY(`id`)
);
