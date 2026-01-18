CREATE TABLE `bodyMeasurements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`measureDate` date NOT NULL,
	`weight` decimal(5,1),
	`bodyFatPercent` decimal(4,1),
	`waist` decimal(4,1),
	`hips` decimal(4,1),
	`chest` decimal(4,1),
	`leftArm` decimal(4,1),
	`rightArm` decimal(4,1),
	`leftThigh` decimal(4,1),
	`rightThigh` decimal(4,1),
	`neck` decimal(4,1),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bodyMeasurements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercisePRs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseName` varchar(255) NOT NULL,
	`prType` enum('weight','reps','time','distance') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`unit` varchar(20) NOT NULL,
	`achievedDate` date NOT NULL,
	`workoutId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercisePRs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hydrationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logDate` date NOT NULL,
	`waterOz` int NOT NULL,
	`goal` int DEFAULT 64,
	`entries` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hydrationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medicalHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryType` enum('condition','surgery','allergy','family_history','hospitalization','injury') NOT NULL,
	`name` varchar(255) NOT NULL,
	`diagnosisDate` date,
	`status` enum('active','resolved','managed','ongoing'),
	`severity` enum('mild','moderate','severe'),
	`treatedBy` varchar(255),
	`familyMember` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medicalHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progressPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`photoDate` date NOT NULL,
	`photoType` enum('front','side','back','other') NOT NULL,
	`imageUrl` text NOT NULL,
	`weight` decimal(5,1),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progressPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleepLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logDate` date NOT NULL,
	`bedtime` varchar(5),
	`wakeTime` varchar(5),
	`durationMinutes` int,
	`quality` int,
	`deepSleepMinutes` int,
	`remSleepMinutes` int,
	`awakenings` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sleepLogs_id` PRIMARY KEY(`id`)
);
