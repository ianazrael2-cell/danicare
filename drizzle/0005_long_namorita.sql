ALTER TABLE `appointments` MODIFY COLUMN `clientId` int;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `serviceId` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `type` enum('appointment','rest') DEFAULT 'appointment' NOT NULL;