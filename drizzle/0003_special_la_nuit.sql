CREATE TABLE `foodLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logDate` date NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`imageUrl` text,
	`totalCalories` int NOT NULL,
	`totalProtein` decimal(6,1) NOT NULL,
	`totalCarbs` decimal(6,1) NOT NULL,
	`totalFat` decimal(6,1) NOT NULL,
	`healthScore` int,
	`foods` json,
	`suggestions` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `foodLogs_id` PRIMARY KEY(`id`)
);
