CREATE TABLE `pinAuth` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pin` varchar(255) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pinAuth_id` PRIMARY KEY(`id`)
);
