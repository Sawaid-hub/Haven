CREATE TABLE `favorites` (
	`user` text NOT NULL,
	`property` text NOT NULL,
	PRIMARY KEY(`user`, `property`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL
);
