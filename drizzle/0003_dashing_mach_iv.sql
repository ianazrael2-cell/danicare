CREATE TABLE `appointmentAddOns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appointmentId` int NOT NULL,
	`addOnId` int NOT NULL,
	`quantity` int NOT NULL,
	`pricePerNail` decimal(8,2) NOT NULL,
	`totalPrice` decimal(8,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointmentAddOns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `designAddOns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`pricePerNail` decimal(8,2) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `designAddOns_id` PRIMARY KEY(`id`)
);
