CREATE TABLE `biomarkers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`markerName` varchar(100) NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`testDate` date NOT NULL,
	`cycleDay` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `biomarkers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`insightText` text NOT NULL,
	`insightType` varchar(50) NOT NULL,
	`dataSource` text,
	`generatedDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `labUploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`uploadDate` timestamp NOT NULL DEFAULT (now()),
	`processed` boolean NOT NULL DEFAULT false,
	`notes` text,
	CONSTRAINT `labUploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menstrualCycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cycleStartDate` date NOT NULL,
	`cycleEndDate` date,
	`cycleLength` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `menstrualCycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dailySymptomReminder` boolean NOT NULL DEFAULT true,
	`dailySymptomReminderTime` varchar(5) DEFAULT '20:00',
	`supplementReminders` boolean NOT NULL DEFAULT true,
	`weeklyInsightsEmail` boolean NOT NULL DEFAULT true,
	`labTestReminders` boolean NOT NULL DEFAULT true,
	`periodPredictionNotifications` boolean NOT NULL DEFAULT false,
	`ovulationWindowNotifications` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `periodSymptoms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symptomDate` date NOT NULL,
	`cycleDay` int,
	`flowLevel` enum('none','spotting','light','moderate','heavy'),
	`crampingSeverity` int,
	`symptomsArray` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `periodSymptoms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplementLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplementId` int NOT NULL,
	`userId` int NOT NULL,
	`logDate` date NOT NULL,
	`amTaken` boolean NOT NULL DEFAULT false,
	`pmTaken` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplementLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`timing` enum('morning','afternoon','evening','before_bed','multiple_times') NOT NULL,
	`startDate` date NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `symptoms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logDate` date NOT NULL,
	`energy` int,
	`mood` int,
	`sleep` int,
	`mentalClarity` int,
	`libido` int,
	`performanceStamina` int,
	`notes` text,
	`cycleDay` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `symptoms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `biologicalSex` enum('male','female','prefer_not_to_say');--> statement-breakpoint
ALTER TABLE `users` ADD `age` int;--> statement-breakpoint
ALTER TABLE `users` ADD `goals` json;--> statement-breakpoint
ALTER TABLE `users` ADD `currentSymptoms` json;--> statement-breakpoint
ALTER TABLE `users` ADD `hasRecentLabWork` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `cycleTrackingEnabled` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `premiumStatus` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingCompleted` boolean DEFAULT false;