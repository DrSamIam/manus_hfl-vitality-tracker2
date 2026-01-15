CREATE TABLE `medications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`drugName` varchar(255) NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`frequency` enum('once_daily','twice_daily','three_times_daily','as_needed','weekly','other') NOT NULL,
	`timeOfDay` enum('morning','afternoon','evening','bedtime','with_meals','multiple'),
	`reason` varchar(255),
	`prescriber` varchar(255),
	`startDate` date NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medications_id` PRIMARY KEY(`id`)
);
