ALTER TABLE `clients` ADD `address` varchar(500);--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `staff` DROP COLUMN `email`;